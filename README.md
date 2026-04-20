# ⚔️ LLM Battle Arena

> Two AI agents. One arena. Different souls.

A turn-based multi-agent battle system where local LLMs fight each other through spell combat. Each model self-generates its character, narrates attacks within a strict word limit, finds weaknesses in the opponent's moves, and honestly self-reports the damage it receives. Built to showcase how different AI models develop distinct combat personalities when given identical rules and prompts.

![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)
![Python](https://img.shields.io/badge/python-3.12+-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/fastapi-latest-009688?style=flat-square&logo=fastapi)
![Ollama](https://img.shields.io/badge/ollama-local-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/tailwind-css-38BDF8?style=flat-square&logo=tailwindcss)

---

## What is this?

LLM Battle Arena pits two locally-running LLMs against each other in a turn-based spell battle. Each agent:

- **Creates its own character** on first encounter — name, archetype, lore, HP, mana, and a unique special ability
- **Narrates spell attacks** within a strict word limit set before the battle begins
- **Self-reports damage received** honestly, with a backend-enforced 10% minimum — no full counters, ever
- **Depletes mana** with every move, falling back to desperation strikes when it runs out
- **Yields** dramatically when HP drops too low, delivering a farewell monologue

The same prompt given to different models produces completely different fights. `llama3.1` plays like a strategist — measured, calculated, conserves mana. `mistral` opens with the most expensive fireball it can justify and narrates like it's writing a novel. Same rules. Same prompt. Different souls.

That emergent personality difference is what multi-agent systems are actually about.

---

## Features

- **Agent Selection** — Choose from all models available in your local Ollama instance
- **Character Cards** — Each LLM self-generates its character sheet: name, archetype, HP, mana, lore, and special ability
- **Turn-based Combat** — Prompt-engineered battle loop with full battle history passed on every turn
- **Live Battle Arena** — Real-time HP and mana bar updates with a scrollable spell log
- **Damage Enforcement** — Backend validates a minimum 10% damage is always received — no godmode counters
- **Local AI execution** — Fully offline via Ollama, no API keys, no costs

---

## Tech Stack

### Backend
| | |
|---|---|
| **Python 3.12+** | |
| **FastAPI** + **Uvicorn** | High-performance async API and web server |
| **Pydantic** | Data validation and frontend-backend contract management |
| **Httpx** | Async HTTP client for Ollama communication |
| **uv** | Ultrafast Python package and project manager |

### Frontend
| | |
|---|---|
| **React 19** | Component-based UI framework |
| **TypeScript** | Strict type definitions mirroring backend Pydantic schemas |
| **Vite** | Fast development server and build tool |
| **Tailwind CSS** | Utility-first styling |

---

## Project Structure

```
llm-battle-arena/
├── frontend/
│   ├── src/                  # React components, App, TypeScript types
│   ├── index.html            # Vite entry point
│   ├── package.json
│   └── tailwind.config.ts
├── main.py                   # FastAPI app entry point and route definitions
├── battle_engine.py          # Core battle logic, turn calculation, prompt construction
├── ollama_client.py          # Local Ollama HTTP service client
├── models.py                 # Pydantic schemas — CharacterSheet, TurnRequest, TurnResponse
├── pyproject.toml            # uv config and Python constraints
└── README.md
```

---

## Battle Flow

```
1. Agent Selection
   └── Pick two models from your local Ollama instance
   └── Set max words per attack (40–200)

2. Character Creation
   └── Each model generates its own character sheet as JSON
   └── Name, archetype, lore, HP (80–150), mana (60–120), special ability (one use)

3. Battle Loop
   ├── Attacker narrates a spell — within word limit, costs mana
   ├── Defender receives: attack description + own HP/mana + full battle history
   ├── Defender self-reports damage received (min 10% enforced by backend)
   ├── Defender counters — also costs mana
   └── Repeat until HP = 0 or agent yields

4. Victory
   └── Winner declared 
```

---

## Standard Turn Payload

Every `/battle/turn` call carries this contract. Frontend and backend are built independently against this schema — types on the frontend mirror the Pydantic models exactly.

```json
{
  "battle_id": "uuid",
  "acting_model": "llama3.1:8b",
  "action_type": "attack | counter | yield",
  "self_state": {
    "name": "Void Wraith",
    "archetype": "Shadow",
    "hp": 74,
    "mana": 55,
    "max_hp": 90,
    "max_mana": 120
  },
  "opponent_state": {
    "name": "Ember Knight",
    "archetype": "Fire",
    "hp": 110,
    "mana": 40
  },
  "last_action": {
    "type": "attack",
    "description": "...",
    "mana_spent": 20,
    "damage_dealt": 18
  },
  "battle_history": [],
  "max_words": 80,
  "round": 3
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/agents` | List all available models from local Ollama |
| `POST` | `/battle/create` | Send system prompt to both models, return character sheets |
| `POST` | `/battle/turn` | Execute one battle turn — attack or counter |

---

## Prerequisites

- **[Ollama](https://ollama.com)** installed and running locally
- **[uv](https://github.com/astral-sh/uv)** for Python dependency management
- **[Node.js](https://nodejs.org) v20+** and npm
- **Python 3.12+**

---

## Installation & Running

### 1. Pull your models

```bash
ollama pull llama3.1:8b
ollama pull mistral:7b
```

### 2. Backend

From the project root:

```bash
uv sync
uv run uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Recommended Models

| Model | Pull command | Personality in battle |
|---|---|---|
| `llama3.1:8b` | `ollama pull llama3.1:8b` | Strategic, measured, conserves mana early |
| `mistral:7b` | `ollama pull mistral:7b` | Aggressive, theatrical, high mana spends |
| `gemma2:9b` | `ollama pull gemma2:9b` | Strong character consistency and archetype roleplay |
| `phi4:14b` | `ollama pull phi4:14b` | Most honest damage reporting, methodical counters |

Start with `llama3.1:8b` vs `mistral:7b` for the most distinct personality contrast.

---

## Built With

- **[Google Antigravity](https://antigravity.google)** — agent-first IDE used to build frontend and backend in parallel with autonomous coding agents
- **[Stitch MCP](https://stitch.withgoogle.com)** — UI component generation and design system consistency across the arena
- **[Ollama](https://ollama.com)** — local LLM inference
- **[FastAPI](https://fastapi.tiangolo.com)** — backend API
- **[React 19](https://react.dev)** + **[Vite](https://vitejs.dev)** + **[Tailwind CSS](https://tailwindcss.com)** — frontend
- **[uv](https://github.com/astral-sh/uv)** — Python package management

---

