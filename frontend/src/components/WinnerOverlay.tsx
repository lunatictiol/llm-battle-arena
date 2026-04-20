import { useState } from 'react';
import { downloadBattleLogs } from '../api';

interface WinnerOverlayProps {
  winner: string;
  battleId: string | null;
  yieldReason?: string | null;
  onNewBattle: () => void;
}

export function WinnerOverlay({ winner, battleId, yieldReason, onNewBattle }: WinnerOverlayProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    if (!battleId) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadBattleLogs(battleId);
    } catch (e: unknown) {
      setDownloadError(e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  }

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

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {/* Download logs */}
          {battleId && (
            <button
              id="download-logs-btn"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm
                         border border-secondary border-opacity-40 text-secondary
                         hover:bg-secondary-container hover:bg-opacity-20 hover:border-opacity-70
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Preparing download…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download Battle Logs
                </>
              )}
            </button>
          )}

          {downloadError && (
            <p className="text-xs text-error text-center">{downloadError}</p>
          )}

          {/* New battle */}
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
    </div>
  );
}
