import { useEffect, useState } from 'react';
import { fetchAgents, createBattle, postTurn } from './api';
import type {
  AgentResponse,
  CharacterSheet,
  HistoryEntry,
  ViewState,
  TurnResponse,
  LastAction,
} from './types';
import { AgentCard } from './components/AgentCard';
import { CharacterCard, FighterCard } from './components/CharacterCard';
import { BattleLog } from './components/BattleLog';
import { WinnerOverlay } from './components/WinnerOverlay';

// ─── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<ViewState>('selection');
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [selectedA, setSelectedA] = useState<AgentResponse | null>(null);
  const [selectedB, setSelectedB] = useState<AgentResponse | null>(null);
  const [maxWords, setMaxWords] = useState(80);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [agentA, setAgentA] = useState<CharacterSheet | null>(null);
  const [agentB, setAgentB] = useState<CharacterSheet | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [round, setRound] = useState(1);
  const [currentTurn, setCurrentTurn] = useState<'a' | 'b'>('a');
  const [loading, setLoading] = useState(false);
  const [battleOver, setBattleOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [autoBattle, setAutoBattle] = useState(false);

  // Load agents on mount
  useEffect(() => {
    fetchAgents()
      .then((data) => setAgents(data.agents ?? []))
      .catch((e) => setError(e.message));
  }, []);

  // Auto-battle loop: fire next turn whenever idle and auto mode is on
  useEffect(() => {
    if (!autoBattle || loading || battleOver || view !== 'battle') return;
    const timer = setTimeout(() => {
      handleNextTurn();
    }, 600); // brief pause so the UI can paint the previous state
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBattle, loading, battleOver, view, history.length]);

  // ── Reset all state for a new battle ────────────────────────────────────
  function resetToSelection() {
    setView('selection');
    setSelectedA(null);
    setSelectedB(null);
    setMaxWords(80);
    setBattleId(null);
    setAgentA(null);
    setAgentB(null);
    setHistory([]);
    setRound(1);
    setCurrentTurn('a');
    setBattleOver(false);
    setWinner(null);
    setLastAction(null);
    setError(null);
    setAutoBattle(false);
  }

  // ── Start Battle ─────────────────────────────────────────────────────────
  async function handleStartBattle() {
    if (!selectedA || !selectedB) return;
    setLoading(true);
    setError(null);
    try {
      const data = await createBattle({
        agent_a_model: selectedA.model,
        agent_b_model: selectedB.model,
        max_words: maxWords,
      });
      setBattleId(data.battle_id);
      setAgentA(data.agent_a);
      setAgentB(data.agent_b);
      setView('characters');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // ── Next Turn ────────────────────────────────────────────────────────────
  async function handleNextTurn() {
    if (!battleId || !agentA || !agentB || battleOver) return;
    setLoading(true);
    setError(null);

    const actingIsA = currentTurn === 'a';
    const actingSelf = actingIsA ? agentA : agentB;
    const actingOpponent = actingIsA ? agentB : agentA;
    const actionType = history.length === 0 ? 'attack' : 'counter';

    const body = {
      battle_id: battleId,
      acting_model: actingSelf.model,
      action_type: actionType,
      self_state: actingSelf,
      opponent_state: actingOpponent,
      last_action: lastAction,
      battle_history: history,
      max_words: maxWords,
      round,
    };

    try {
      const resp: TurnResponse = await postTurn(body);

      // Update actor/opponent character sheets
      if (actingIsA) {
        setAgentA(resp.updated_self);
        setAgentB(resp.updated_opponent);
      } else {
        setAgentB(resp.updated_self);
        setAgentA(resp.updated_opponent);
      }

      // Build last action for next round
      const newLastAction: LastAction = {
        type: resp.turn_action.action_type,
        description: resp.turn_action.description,
        mana_spent: resp.turn_action.mana_spent,
        damage_dealt: resp.turn_action.damage_dealt,
      };
      setLastAction(newLastAction);

      // Build history entry
      const newEntry: HistoryEntry = {
        round,
        actor: actingSelf.name,
        spell_name: resp.turn_action.spell_name,
        description: resp.turn_action.description,
        damage_dealt: resp.turn_action.damage_dealt,
        damage_received: resp.turn_action.damage_received,
        mana_spent: resp.turn_action.mana_spent,
      };
      setHistory((prev) => [...prev, newEntry]);

      if (resp.battle_over) {
        setBattleOver(true);
        setWinner(resp.winner ?? actingSelf.name);
      } else {
        // Alternate turns; increment round after both have gone
        if (currentTurn === 'b') setRound((r) => r + 1);
        setCurrentTurn((t) => (t === 'a' ? 'b' : 'a'));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // VIEW: SELECTION
  // ────────────────────────────────────────────────────────────────────────
  if (view === 'selection') {
    const canStart = selectedA && selectedB && selectedA.id !== selectedB.id;

    return (
      <div className="dark min-h-screen">
        {/* Header */}
        <header className="text-center py-12 px-4">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary mb-3">The Arcane Archive</p>
          <h1 className="font-serif text-5xl font-bold text-on-surface mb-2">
            ⚔ LLM Battle Arena
          </h1>
          <p className="text-outline text-sm max-w-md mx-auto">
            Choose your champions. Let the models clash in an arcane duel of wit and power.
          </p>
        </header>

        <main className="max-w-5xl mx-auto px-4 pb-16">
          {/* Agents loading / error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900 bg-opacity-30 border border-red-800 border-opacity-40 text-error text-sm text-center">
              {error}
              <button className="ml-2 underline" onClick={() => fetchAgents().then(d => setAgents(d.agents)).catch(e => setError(e.message))}>
                Retry
              </button>
            </div>
          )}

          {/* Two column agent pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {(['A', 'B'] as const).map((side) => {
              const selected = side === 'A' ? selectedA : selectedB;
              const other = side === 'A' ? selectedB : selectedA;
              const setSelected = side === 'A' ? setSelectedA : setSelectedB;

              return (
                <div key={side} className="space-y-3">
                  <h2 className="section-title flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: 'rgba(224,76,255,0.2)', color: '#f6adff', border: '1px solid rgba(224,76,255,0.4)' }}
                    >
                      {side}
                    </span>
                    Choose Agent {side}
                  </h2>

                  {agents.length === 0 && !error && (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  )}

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {agents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        selected={selected?.id === agent.id}
                        disabled={other?.id === agent.id}
                        onClick={() => setSelected(agent)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Max Words slider */}
          <div className="glass-card p-6 mb-8 max-w-lg mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <label htmlFor="max-words-slider" className="font-semibold text-sm text-on-surface">
                Max Words Per Attack
              </label>
              <span className="font-mono text-primary text-sm font-bold">{maxWords}</span>
            </div>
            <input
              id="max-words-slider"
              type="range"
              min={40}
              max={200}
              step={10}
              value={maxWords}
              onChange={(e) => setMaxWords(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #e04cff ${((maxWords - 40) / 160) * 100}%, rgba(255,255,255,0.1) ${((maxWords - 40) / 160) * 100}%)`,
                accentColor: '#e04cff',
              }}
            />
            <div className="flex justify-between text-xs text-outline font-mono">
              <span>40</span>
              <span>200</span>
            </div>
          </div>

          {/* Selection summary */}
          {(selectedA || selectedB) && (
            <div className="flex justify-center gap-6 mb-6 text-sm">
              <div className="text-center">
                <span className="text-xs text-outline uppercase tracking-wider block mb-1">Agent A</span>
                <span className={selectedA ? 'text-primary font-semibold' : 'text-outline italic'}>
                  {selectedA?.name ?? 'Not selected'}
                </span>
              </div>
              <div className="text-outline flex items-center font-serif text-xl">⚔</div>
              <div className="text-center">
                <span className="text-xs text-outline uppercase tracking-wider block mb-1">Agent B</span>
                <span className={selectedB ? 'text-primary font-semibold' : 'text-outline italic'}>
                  {selectedB?.name ?? 'Not selected'}
                </span>
              </div>
            </div>
          )}

          {/* Start Battle */}
          <div className="flex justify-center">
            <button
              id="start-battle-btn"
              disabled={!canStart || loading}
              onClick={handleStartBattle}
              className="btn-primary text-lg px-12 py-4 flex items-center gap-3"
            >
              {loading ? <><Spinner /> Summoning…</> : '⚔ Start Battle'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // VIEW: CHARACTERS
  // ────────────────────────────────────────────────────────────────────────
  if (view === 'characters') {
    return (
      <div className="dark min-h-screen">
        <header className="text-center py-10 px-4">
          <p className="text-xs uppercase tracking-[0.4em] text-secondary mb-2">The Arena</p>
          <h1 className="font-serif text-4xl font-bold text-on-surface">Champions Revealed</h1>
        </header>

        <main className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
          {/* Character cards */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {agentA && <CharacterCard character={agentA} />}
            <div className="flex flex-col items-center justify-center py-8 shrink-0">
              <span className="font-serif text-4xl text-outline opacity-40">VS</span>
            </div>
            {agentB && <CharacterCard character={agentB} />}
          </div>

          {/* Begin Battle */}
          <div className="flex justify-center">
            <button
              id="begin-battle-btn"
              className="btn-primary text-lg px-12 py-4"
              onClick={() => setView('battle')}
            >
              ⚔ Begin Battle
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // VIEW: BATTLE
  // ────────────────────────────────────────────────────────────────────────
  const activeChar = currentTurn === 'a' ? agentA : agentB;

  return (
    <div className="dark min-h-screen flex flex-col">
      {/* Winner overlay */}
      {battleOver && winner && (
        <WinnerOverlay
          winner={winner}
          battleId={battleId}
          yieldReason={
            history.length > 0
              ? (history[history.length - 1] as HistoryEntry & { yield_reason?: string })?.yield_reason
              : null
          }
          onNewBattle={resetToSelection}
        />
      )}

      {/* Battle header */}
      <header className="text-center py-6 px-4 shrink-0">
        <p className="text-xs uppercase tracking-[0.4em] text-secondary mb-1">Round {round}</p>
        <h1 className="font-serif text-3xl font-bold text-on-surface">⚔ Battle Arena</h1>
        {!battleOver && activeChar && (
          <p className="text-sm text-outline mt-1">
            <span className="text-primary font-semibold">{activeChar.name}</span>'s turn
          </p>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-8 flex flex-col gap-4">
        {/* Fighter cards row */}
        <div className="flex gap-4">
          {agentA && <FighterCard character={agentA} side="left" />}
          <div className="flex flex-col items-center justify-center shrink-0 px-2">
            <span className="font-serif text-2xl text-outline opacity-30">VS</span>
          </div>
          {agentB && <FighterCard character={agentB} side="right" />}
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3 rounded-lg bg-red-900 bg-opacity-30 border border-red-800 border-opacity-40 text-error text-sm flex items-center justify-between">
            <span>{error}</span>
            <button className="underline ml-2 text-xs" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Battle Log */}
        <BattleLog history={history} />

        {/* Action bar */}
        <div className="flex flex-col items-center gap-3 pt-2">
          {battleOver ? (
            <button
              id="new-battle-btn-arena"
              onClick={resetToSelection}
              className="btn-primary text-lg px-10 py-3"
              style={{ background: 'linear-gradient(135deg, #b9881d, #f5be50)', color: '#271900' }}
            >
              ⚔ New Battle
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Manual next-turn (disabled in auto mode) */}
              <button
                id="next-turn-btn"
                disabled={loading || autoBattle}
                onClick={handleNextTurn}
                className="btn-primary text-lg px-8 py-3 flex items-center gap-3"
              >
                {loading && !autoBattle ? (
                  <><Spinner /> <span>Casting spell…</span></>
                ) : (
                  '▶ Next Turn'
                )}
              </button>

              {/* Auto-battle toggle */}
              <button
                id="auto-battle-toggle"
                onClick={() => setAutoBattle((v) => !v)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200
                  ${
                    autoBattle
                      ? 'bg-tertiary text-surface-lowest shadow-glow-gold'
                      : 'btn-secondary'
                  }`}
                title={autoBattle ? 'Stop auto-battle' : 'Run battle automatically'}
              >
                {autoBattle ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-surface-lowest opacity-60" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-surface-lowest" />
                    </span>
                    {loading ? <Spinner /> : null}
                    Auto
                  </>
                ) : (
                  '⚡ Auto'
                )}
              </button>
            </div>
          )}

          {/* Auto-battle status blurb */}
          {autoBattle && !battleOver && (
            <p className="text-xs text-tertiary font-mono animate-shimmer">
              Auto-battle running… watching the arcane unfold
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
