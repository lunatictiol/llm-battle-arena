const BASE_URL = 'http://localhost:8000';

export async function fetchAgents() {
  const res = await fetch(`${BASE_URL}/agents`);
  if (!res.ok) throw new Error(`Failed to fetch agents: ${res.status}`);
  return res.json();
}

export async function createBattle(body: {
  agent_a_model: string;
  agent_b_model: string;
  max_words: number;
}) {
  const res = await fetch(`${BASE_URL}/battle/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to create battle: ${res.status}`);
  return res.json();
}

export async function postTurn(body: object) {
  const res = await fetch(`${BASE_URL}/battle/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to post turn: ${res.status}`);
  return res.json();
}
