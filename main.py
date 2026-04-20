from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid

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
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
