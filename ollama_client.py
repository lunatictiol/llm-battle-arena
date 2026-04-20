import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

async def get_agents() -> list:
    """Fetch available models from Ollama to use as agents."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            response.raise_for_status()
            data = response.json()
            models = data.get("models", [])
            agents = []
            for m in models:
                name = m.get("name", "")
                agents.append({
                    "id": name,
                    "name": name,
                    "model": name
                })
            return agents
        except Exception as e:
            print(f"Error fetching agents from Ollama: {e}")
            return []

async def generate_chat(model: str, messages: list) -> str:
    """Call Ollama /api/chat endpoint."""
    async with httpx.AsyncClient(timeout=180.0) as client:
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        try:
            response = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")
        except httpx.HTTPStatusError as e:
            print(f"Ollama HTTP error: {e}")
            raise
        except Exception as e:
            print(f"Ollama request error: {e}")
            raise
