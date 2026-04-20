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

export async function downloadBattleLogs(battleId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/battle/${battleId}/download`);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const blob = await res.blob();

  // Prefer the filename from Content-Disposition, fall back to battle_id
  const disposition = res.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename[^;=\n]*=(['"])?(.*?)\1/);
  const filename = match?.[2] ?? `battle_${battleId}.log`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
