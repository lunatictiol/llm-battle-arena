import type { AgentResponse } from '../types';

interface AgentCardProps {
  agent: AgentResponse;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function AgentCard({ agent, selected, disabled, onClick }: AgentCardProps) {
  return (
    <button
      id={`agent-card-${agent.id}`}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group
        ${selected
          ? 'glass-card-selected animate-pulse_glow'
          : 'glass-card hover:border-primary hover:border-opacity-30 hover:shadow-glow-sm'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold text-on-surface leading-snug truncate">{agent.name}</p>
          <p className="text-xs font-mono text-outline mt-1 truncate">{agent.model}</p>
        </div>
        {selected && (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-container flex items-center justify-center">
            <svg className="w-3 h-3 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}
