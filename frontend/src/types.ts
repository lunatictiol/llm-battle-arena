// Mirror of backend Pydantic models — do not rename fields

export interface SpecialAbility {
  name: string;
  description: string;
  mana_cost: number;
  used: boolean;
}

export interface CharacterSheet {
  name: string;
  archetype: string;
  lore: string;
  max_hp: number;
  max_mana: number;
  hp: number;
  mana: number;
  special_ability: SpecialAbility;
  model: string;
}

export interface LastAction {
  type: string; // attack | counter | yield
  description: string;
  mana_spent: number;
  damage_dealt: number;
}

export interface HistoryEntry {
  round: number;
  actor: string;
  spell_name: string;
  description: string;
  damage_dealt: number;
  damage_received: number;
  mana_spent: number;
}

export interface TurnRequest {
  battle_id: string;
  acting_model: string;
  action_type: 'attack' | 'counter';
  self_state: CharacterSheet;
  opponent_state: CharacterSheet;
  last_action: LastAction | null;
  battle_history: HistoryEntry[];
  max_words: number;
  round: number;
}

export interface TurnAction {
  action_type: string;
  spell_name: string;
  description: string;
  mana_spent: number;
  damage_dealt: number;
  damage_received: number;
  word_count: number;
  used_special: boolean;
  yield_reason?: string | null;
}

export interface TurnResponse {
  battle_id: string;
  turn_action: TurnAction;
  updated_self: CharacterSheet;
  updated_opponent: CharacterSheet;
  battle_over: boolean;
  winner?: string | null;
}

export interface AgentResponse {
  id: string;
  name: string;
  model: string;
}

export interface GetAgentsResponse {
  agents: AgentResponse[];
}

export interface CreateBattleRequest {
  agent_a_model: string;
  agent_b_model: string;
  max_words: number;
}

export interface CreateBattleResponse {
  battle_id: string;
  agent_a: CharacterSheet;
  agent_b: CharacterSheet;
  max_words: number;
}

// App state
export type ViewState = 'selection' | 'characters' | 'battle';

export interface AppState {
  view: ViewState;
  agents: AgentResponse[];
  selectedA: AgentResponse | null;
  selectedB: AgentResponse | null;
  maxWords: number;
  battleId: string | null;
  agentA: CharacterSheet | null;
  agentB: CharacterSheet | null;
  history: HistoryEntry[];
  round: number;
  currentTurn: 'a' | 'b';
  loading: boolean;
  battleOver: boolean;
  winner: string | null;
}
