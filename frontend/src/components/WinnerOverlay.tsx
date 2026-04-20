interface WinnerOverlayProps {
  winner: string;
  yieldReason?: string | null;
  onNewBattle: () => void;
}

export function WinnerOverlay({ winner, yieldReason, onNewBattle }: WinnerOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div
        className="glass-card max-w-md w-full mx-4 p-8 text-center space-y-6 animate-floatIn"
        style={{ boxShadow: '0 0 60px rgba(245, 190, 80, 0.4), 0 0 120px rgba(245, 190, 80, 0.15)' }}
      >
        {/* Crown icon */}
        <div className="text-6xl">👑</div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-tertiary font-semibold">Victory</p>
          <h2 className="font-serif text-4xl font-bold text-tertiary leading-tight">{winner}</h2>
          <p className="text-sm text-outline">has won the battle</p>
        </div>

        {yieldReason && (
          <div className="bg-surface-lowest rounded-lg p-4 text-sm text-on-surface opacity-80 italic leading-relaxed">
            "{yieldReason}"
          </div>
        )}

        <button
          id="new-battle-btn"
          onClick={onNewBattle}
          className="btn-primary w-full text-center"
          style={{ background: 'linear-gradient(135deg, #b9881d, #f5be50)', color: '#271900' }}
        >
          ⚔ New Battle
        </button>
      </div>
    </div>
  );
}
