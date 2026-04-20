from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional, List

# Agent Models
class AgentResponse(BaseModel):
    id: str
    name: str
    model: str

class GetAgentsResponse(BaseModel):
    agents: List[AgentResponse]

# Character Models
class SpecialAbility(BaseModel):
    name: str
    description: str
    mana_cost: int
    used: bool = False

class CharacterSheet(BaseModel):
    name: str
    archetype: str
    lore: str
    max_hp: int
    max_mana: int
    hp: int
    mana: int
    special_ability: SpecialAbility
    model: str

# Last Action and History
class LastAction(BaseModel):
    type: str  # attack, counter, yield
    description: str
    mana_spent: int
    damage_dealt: int

class HistoryEntry(BaseModel):
    round: int
    actor: str
    spell_name: str
    description: str
    damage_dealt: int
    damage_received: int
    mana_spent: int

# Turn Models
class TurnRequest(BaseModel):
    battle_id: str
    acting_model: str
    action_type: Literal["attack", "counter"]
    self_state: CharacterSheet
    opponent_state: CharacterSheet
    last_action: Optional[LastAction]
    battle_history: List[HistoryEntry]
    max_words: int
    round: int

class TurnAction(BaseModel):
    action_type: str
    spell_name: str
    description: str
    mana_spent: int
    damage_dealt: int
    damage_received: int
    word_count: int
    used_special: bool
    yield_reason: Optional[str] = None

class TurnResponse(BaseModel):
    battle_id: str
    turn_action: TurnAction
    updated_self: CharacterSheet
    updated_opponent: CharacterSheet
    battle_over: bool
    winner: Optional[str] = None

# Create Battle Models
class CreateBattleRequest(BaseModel):
    agent_a_model: str
    agent_b_model: str
    max_words: int

class CreateBattleResponse(BaseModel):
    battle_id: str
    agent_a: CharacterSheet
    agent_b: CharacterSheet
    max_words: int
