from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uuid
import os

from models import (
    GetAgentsResponse, 
    CreateBattleRequest, 
    CreateBattleResponse,
    TurnRequest,
    TurnResponse
)
import ollama_client
import battle_engine

app = FastAPI(title="LLM Battle Arena")

os.makedirs("battles", exist_ok=True)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/agents", response_model=GetAgentsResponse)
async def get_agents_endpoint():
    agents = await ollama_client.get_agents()
    return GetAgentsResponse(agents=agents)


@app.post("/battle/create", response_model=CreateBattleResponse)
async def create_battle_endpoint(req: CreateBattleRequest):
    try:
        agent_a = await battle_engine.create_character(req.agent_a_model, req.max_words)
        agent_b = await battle_engine.create_character(req.agent_b_model, req.max_words)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create characters: {e}")
        
    battle_id = str(uuid.uuid4())
    
    with open(f"battles/{battle_id}.txt", "w", encoding="utf-8") as f:
        f.write(f"Battle ID: {battle_id}\n")
        f.write(f"Model A: {agent_a.name} ({agent_a.model})\n")
        f.write(f"Model B: {agent_b.name} ({agent_b.model})\n")
        f.write(f"Max Words: {req.max_words}\n")
        f.write("-" * 40 + "\n")
    
    return CreateBattleResponse(
        battle_id=battle_id,
        agent_a=agent_a,
        agent_b=agent_b,
        max_words=req.max_words
    )


@app.post("/battle/turn", response_model=TurnResponse)
async def battle_turn_endpoint(req: TurnRequest):
    try:
        response = await battle_engine.execute_turn(req)
        
        with open(f"battles/{req.battle_id}.txt", "a", encoding="utf-8") as f:
            f.write(f"\n[Round {req.round}] {req.self_state.name} ({req.acting_model}):\n")
            f.write(f"Action Type: {response.turn_action.action_type}\n")
            f.write(f"Spell: {response.turn_action.spell_name}\n")
            f.write(f"Mana Spent: {response.turn_action.mana_spent}\n")
            f.write(f"Damage Dealt: {response.turn_action.damage_dealt}\n")
            f.write(f"Damage Received: {response.turn_action.damage_received}\n")
            f.write(f"Used Special: {response.turn_action.used_special}\n")
            if response.turn_action.yield_reason:
                f.write(f"Yield Reason: {response.turn_action.yield_reason}\n")
            f.write(f"Description: {response.turn_action.description}\n")
            f.write("-" * 40 + "\n")
            
            if response.battle_over:
                f.write(f"\nBATTLE OVER\n")
                f.write(f"Winner: {response.winner}\n")
                
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/battle/{battle_id}/download")
async def download_battle_log(battle_id: str):
    file_path = f"battles/{battle_id}.txt"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Battle log not found")
    return FileResponse(
        path=file_path, 
        media_type="text/plain", 
        filename=f"battle_{battle_id}.txt"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
