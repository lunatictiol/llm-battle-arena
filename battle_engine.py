import math
import json
import re
from pathlib import Path

from models import CharacterSheet, TurnRequest, TurnAction, SpecialAbility, TurnResponse
from ollama_client import generate_chat

def load_system_prompt() -> str:
    prompt_path = Path(__file__).parent / "prompts" / "system_prompt.txt"
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "You are a battle mage in the Arena. Respond in JSON only."

def clean_json_string(raw: str) -> str:
    """Removes markdown backticks and formatting to extract raw JSON."""
    raw = raw.strip()
    if raw.startswith("```"):
        # Find first newline
        first_newline = raw.find("\n")
        if first_newline != -1:
            raw = raw[first_newline+1:]
        # Remove trailing backticks
        if raw.endswith("```"):
            raw = raw[:-3]
    return raw.strip()

async def create_character(model: str, max_words: int) -> CharacterSheet:
    system_prompt_tmpl = load_system_prompt()
    system_prompt = system_prompt_tmpl.replace("{max_words}", str(max_words))
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Create your character now."}
    ]
    
    raw_response = await generate_chat(model, messages)
    cleaned_json = clean_json_string(raw_response)
    
    try:
        data = json.loads(cleaned_json)
        # Apply bounds if LLM didn't respect them perfectly
        max_hp = max(80, min(150, data.get("max_hp", 100)))
        max_mana = max(60, min(120, data.get("max_mana", 80)))
        
        sa_data = data.get("special_ability", {})
        sa = SpecialAbility(
            name=sa_data.get("name", "Basic Strike"),
            description=sa_data.get("description", ""),
            mana_cost=max(20, min(40, sa_data.get("mana_cost", 20))),
            used=False
        )
        
        sheet = CharacterSheet(
            name=data.get("name", "Unknown Fighter"),
            archetype=data.get("archetype", "Novice"),
            lore=data.get("lore", ""),
            max_hp=max_hp,
            max_mana=max_mana,
            hp=max_hp,
            mana=max_mana,
            special_ability=sa,
            model=model
        )
        return sheet
    except json.JSONDecodeError as e:
        print(f"Failed to parse Character creation JSON from {model}. Raw: {raw_response}")
        raise ValueError("Invalid JSON returned during character creation.") from e
        

async def execute_turn(request: TurnRequest) -> TurnResponse:
    self_state = request.self_state
    opp_state = request.opponent_state
    
    system_prompt_tmpl = load_system_prompt()
    system_prompt = system_prompt_tmpl.replace("{max_words}", str(request.max_words))
    
    last_move_text = "None (You have the initiative)"
    if request.last_action:
        last_move_text = f"{request.last_action.description} (dealt {request.last_action.damage_dealt} damage)"
        
    history_lines = []
    # Grab last 3 entries
    for entry in request.battle_history[-3:]:
        history_lines.append(
            f"Round {entry.round} - {entry.actor} cast {entry.spell_name} "
            f"(Spent {entry.mana_spent} mana, dealt {entry.damage_dealt} damage, "
            f"took {entry.damage_received} damage) - {entry.description}"
        )
    history_text = "\n".join(history_lines) if history_lines else "None"
    
    user_prompt = f"""You are {self_state.name} ({self_state.archetype}).
Your HP: {self_state.hp}/{self_state.max_hp} | Your Mana: {self_state.mana}/{self_state.max_mana}
Your opponent: {opp_state.name} ({opp_state.archetype}) — HP: {opp_state.hp}/{opp_state.max_hp}

Last move against you: {last_move_text}

Battle history (last 3 rounds): 
{history_text}

Your action type this turn: {request.action_type}
Word limit: {request.max_words} words. Do not exceed it.

Respond with valid JSON only."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    raw_response = await generate_chat(self_state.model, messages)
    cleaned_json = clean_json_string(raw_response)
    
    try:
        data = json.loads(cleaned_json)
    except json.JSONDecodeError as e:
        print(f"Failed to parse turn JSON from {self_state.model}. Raw: {raw_response}")
        raise ValueError("Invalid JSON returned during battle turn.") from e
        
    action = TurnAction(**data)
    
    # Validation / Clamping
    # 1. Limit word count (just enforcing the reported number matches bounds). We could also split() and check.
    actual_words = len(action.description.split())
    if action.word_count > request.max_words or actual_words > request.max_words:
        print(f"Warning: Model {self_state.model} exceeded max_words.")
        action.word_count = min(action.word_count, request.max_words)
        
    # 2. Mana rules
    action.mana_spent = max(5, min(30, action.mana_spent))
    if action.mana_spent > self_state.mana:
        action.mana_spent = self_state.mana
        
    if self_state.mana == 0:
        action.mana_spent = 0 # desperation strike
        
    # 3. Minimum damage received
    if request.last_action:
        min_dmg = math.floor(request.last_action.damage_dealt * 0.10)
        if action.damage_received < min_dmg:
            print(f"Warning: Model {self_state.model} didn't take enough damage. Clamping from {action.damage_received} to {min_dmg}")
            action.damage_received = max(action.damage_received, min_dmg)
    else:
        # No last action, no damage should be received
        action.damage_received = 0
        
    if action.damage_received < 0:
        action.damage_received = 0
        
    # Apply states
    self_state.hp -= action.damage_received
    self_state.mana -= action.mana_spent
    
    opp_state.hp -= action.damage_dealt
    
    if action.used_special:
        self_state.special_ability.used = True
        
    battle_over = False
    winner = None
    
    if action.action_type == "yield":
        battle_over = True
        winner = opp_state.name
    elif self_state.hp <= 0 and opp_state.hp <= 0:
        # Draw, usually the one who just moved is dead
        battle_over = True
        winner = "Draw"
    elif self_state.hp <= 0:
        battle_over = True
        winner = opp_state.name
    elif opp_state.hp <= 0:
        battle_over = True
        winner = self_state.name
        
    return TurnResponse(
        battle_id=request.battle_id,
        turn_action=action,
        updated_self=self_state,
        updated_opponent=opp_state,
        battle_over=battle_over,
        winner=winner
    )
