# LLM Battle Arena

LLM Battle Arena is a turn-based game where different Large Language Models (LLMs) and AI agents battle against each other. The backend is powered by FastAPI and a local Ollama instance, while the frontend provides an interactive, state-managed React interface styled with Tailwind CSS.

## 🌟 Features

- **Agent Selection**: Choose from a list of various AI agents/models provided by local Ollama instances.
- **Character Cards**: View detailed stats and specifications of various agents.
- **Turn-based Combat**: Backend logic orchestrated via specific prompt engineering and response parsing for seamless battles.
- **Real-time Battle Arena**: Real-time HP, mana bar updates, and a scrollable battle log.
- **Local AI execution**: Models run locally with privacy via Ollama.

## 🛠 Tech Stack

### Backend
- **Python 3.12+**
- **FastAPI** & **Uvicorn**: High-performance backend API and web server.
- **Pydantic**: Robust data validation and API contract management.
- **Httpx**: Asynchronous HTTP client for fast Ollama interaction.
- **uv**: Ultrafast Python package and project manager.

### Frontend
- **React 19**: Modern component-based web UI framework.
- **TypeScript**: Strict type definitions for frontend-backend contracts.
- **Vite**: Blazing-fast development server.
- **Tailwind CSS**: Utility-first CSS framework for slick styling.

## 📋 Prerequisites

Before you start setting up the application, ensure you have the following installed on your machine:
- **[Ollama](https://ollama.com/)**: Installed and running locally, with required models pulled to process battle turns. Ensure Ollama is configured to leverage your hardware (like an NVIDIA GPU) if applicable.
- **[uv](https://github.com/astral-sh/uv)**: For managing the Python dependencies.
- **[Node.js](https://nodejs.org/) & npm**: For managing frontend dependencies (ideally V20 or later).
- **Python >= 3.12**

## 💻 Installation

### Backend Setup
1. Clone the repository and navigate to the project directory.
2. The project utilizes `uv` to manage Python configurations via `pyproject.toml`. Install the specific packages and create the environment automatically:
```bash
uv sync
```
This automatically sets up an isolated environment (`.venv`) and installs everything detailed in the `pyproject.toml` and `uv.lock`.

### Frontend Setup
1. Open a new terminal instance and navigate to the frontend directory:
```bash
cd frontend
```
2. Install frontend `npm` dependencies:
```bash
npm install
```

## 🚀 Running the Application

To run the application, you need to spin up the local Ollama instance, the FastAPI backend, and the Vite frontend server.

### 1. Ensure Ollama is running
Open your terminal and start Ollama (or manage its service according to your OS standard). Pull your preferred models (e.g., `ollama pull llama3`, etc.)

### 2. Start the Backend Server
From the root of the project directory, run:
```bash
uv run uvicorn main:app --reload
```
The backend API will start securely on `http://127.0.0.1:8000` (or `http://localhost:8000`).

### 3. Start the Frontend Server
From the `frontend` directory, launch the Vite development server:
```bash
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`. 

## 📁 Project Structure

```text
llm-battle-arena/
├── frontend/               # React frontend repository using TypeScript & Vite
│   ├── src/                # Frontend source code (React components, App, etc.)
│   ├── index.html          # Vite Entry point
│   ├── package.json        
│   └── tailwind.config.ts  # Tailwind CSS Settings
├── main.py                 # FastAPI application entry point
├── battle_engine.py        # Core battle logic, turn calculation, prompts construction
├── ollama_client.py        # Connects with your local Ollama HTTP Service
├── models.py               # Pydantic schemas validating API Request/Response
├── pyproject.toml          # uv configurations and system constraints
└── README.md
```
