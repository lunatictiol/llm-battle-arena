import type { CharacterSheet } from '../types';

interface HPBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
}

export function HPBar({ current, max, showLabel = true }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color =
    pct > 50
      ? '#22c55e'   // green
      : pct > 20
        ? '#eab308'   // yellow
        : '#ef4444';  // red

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-mono">
          <span className="text-outline">HP</span>
          <span style={{ color }}>{current} / {max}</span>
        </div>
      )}
      <div className="bar-track">
        <div
          className="hp-bar-fill h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
    </div>
  );
}

interface ManaBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
}

export function ManaBar({ current, max, showLabel = true }: ManaBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-mono">
          <span className="text-outline">MP</span>
          <span className="text-blue-400">{current} / {max}</span>
        </div>
      )}
      <div className="bar-track">
        <div
          className="hp-bar-fill h-full rounded-full bg-blue-500"
          style={{ width: `${pct}%`, boxShadow: '0 0 6px rgba(59,130,246,0.6)' }}
        />
      </div>
    </div>
  );
}

interface FighterCardProps {
  character: CharacterSheet;
  side: 'left' | 'right';
}

export function FighterCard({ character, side }: FighterCardProps) {
  return (
    <div className={`glass-card p-4 flex-1 ${side === 'right' ? 'text-right' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={side === 'right' ? 'order-2 text-right' : ''}>
          <h3 className="font-serif text-xl font-bold text-on-surface leading-tight">{character.name}</h3>
          <p className="text-xs text-secondary uppercase tracking-widest mt-0.5">{character.archetype}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-mono text-outline bg-surface-lowest ${side === 'right' ? 'order-1' : ''}`}>
          {character.model.split('/').pop()?.slice(0, 12)}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <HPBar current={character.hp} max={character.max_hp} />
        <ManaBar current={character.mana} max={character.max_mana} />
      </div>
      {character.special_ability.used && (
        <div className="mt-2 text-xs text-outline italic">
          ⚡ {character.special_ability.name} — used
        </div>
      )}
    </div>
  );
}

interface CharacterCardProps {
  character: CharacterSheet;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div className="glass-card p-6 flex-1 min-w-0 space-y-4 animate-floatIn">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-block px-3 py-0.5 rounded-full bg-secondary-container text-xs uppercase tracking-widest text-secondary mb-2">
          {character.archetype}
        </div>
        <h2 className="font-serif text-3xl font-bold text-on-surface">{character.name}</h2>
        <p className="text-xs font-mono text-outline">{character.model}</p>
      </div>

      {/* Lore */}
      <p className="text-sm text-on-surface leading-relaxed opacity-80 italic text-center">"{character.lore}"</p>

      {/* Stats */}
      <div className="space-y-3">
        <HPBar current={character.hp} max={character.max_hp} />
        <ManaBar current={character.mana} max={character.max_mana} />
      </div>

      {/* Special Ability */}
      <div className="rounded-lg bg-surface-lowest p-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm">✦</span>
          <span className="font-semibold text-sm text-primary">{character.special_ability.name}</span>
          <span className="ml-auto text-xs text-outline font-mono">{character.special_ability.mana_cost} MP</span>
        </div>
        <p className="text-xs text-on-surface opacity-70 leading-relaxed">{character.special_ability.description}</p>
      </div>
    </div>
  );
}
