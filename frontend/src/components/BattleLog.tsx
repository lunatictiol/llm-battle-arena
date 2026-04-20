import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../types';

interface BattleLogProps {
  history: HistoryEntry[];
}

function getDamageColor(dmg: number) {
  if (dmg >= 30) return 'text-red-400';
  if (dmg >= 15) return 'text-orange-400';
  return 'text-yellow-400';
}

export function BattleLog({ history }: BattleLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex-1 glass-card p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-outline text-sm italic">The arena awaits… Commence battle.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 glass-card overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-outline-variant border-opacity-20">
        <h3 className="font-serif text-sm font-semibold text-secondary uppercase tracking-widest">Battle Chronicle</h3>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-2 max-h-[340px]">
        {history.map((entry, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-surface-lowest bg-opacity-80 animate-slideDown"
            style={{ animationDelay: `0ms` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-outline">Round {entry.round}</span>
              <span className="text-xs font-mono font-semibold text-primary">{entry.actor}</span>
              <span className="ml-auto text-xs text-outline">casts</span>
              <span className="text-xs font-semibold text-secondary">{entry.spell_name}</span>
            </div>
            <p className="text-xs text-on-surface opacity-75 leading-relaxed mb-2">{entry.description}</p>
            <div className="flex gap-4 text-xs font-mono">
              <span className={`${getDamageColor(entry.damage_dealt)}`}>
                ⚔ {entry.damage_dealt} dealt
              </span>
              <span className="text-outline">
                🛡 {entry.damage_received} received
              </span>
              {entry.mana_spent > 0 && (
                <span className="text-blue-400">
                  ◈ {entry.mana_spent} MP
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
