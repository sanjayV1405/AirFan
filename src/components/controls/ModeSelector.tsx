import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Sliders, Sparkles, RefreshCw } from 'lucide-react';

export const ModeSelector: React.FC = () => {
  const { telemetry, connectionState, setOperatingMode, commandPending } = useAirLoop();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const isConnected = connectionState === 'connected';

  const handleSelectMode = async (mode: 'manual' | 'auto') => {
    if (!isConnected || mode === telemetry.activeMode || isTransitioning || commandPending) return;
    setIsTransitioning(true);
    await setOperatingMode(mode);
    setIsTransitioning(false);
  };

  const isAuto = telemetry.activeMode === 'auto';

  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 14
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Room Fan Mode
          </span>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {isConnected
              ? (isAuto ? 'Automatic speed modulation based on temperature and presence' : 'Manual speed fixed by user')
              : 'Waiting for hardware connection...'}
          </div>
        </div>

        {isTransitioning && (
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RefreshCw size={13} className="spin" /> Updating...
          </span>
        )}
      </div>

      {/* Frosted Segmented Switch */}
      <div style={{
        background: 'rgba(11, 17, 32, 0.75)',
        padding: '3px',
        borderRadius: 12,
        display: 'flex',
        gap: 4,
        border: '1px solid var(--border-subtle)',
        opacity: isConnected ? 1 : 0.55
      }}>
        <button
          onClick={() => handleSelectMode('manual')}
          disabled={!isConnected || isTransitioning || commandPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 18px', borderRadius: 9,
            border: !isAuto ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
            background: !isAuto ? 'rgba(59, 130, 246, 0.22)' : 'transparent',
            color: !isAuto ? '#60A5FA' : 'var(--text-muted)',
            boxShadow: !isAuto ? '0 0 16px rgba(59, 130, 246, 0.25)' : 'none',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            fontWeight: !isAuto ? 800 : 600,
            fontSize: '0.82rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Sliders size={14} color={!isAuto ? '#60A5FA' : 'currentColor'} />
          <span>Manual</span>
        </button>

        <button
          onClick={() => handleSelectMode('auto')}
          disabled={!isConnected || isTransitioning || commandPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 18px', borderRadius: 9,
            border: isAuto ? '1px solid var(--border-accent)' : '1px solid transparent',
            background: isAuto ? 'var(--accent-primary-dim)' : 'transparent',
            color: isAuto ? 'var(--accent-primary)' : 'var(--text-muted)',
            boxShadow: isAuto ? '0 0 16px rgba(0, 242, 254, 0.25)' : 'none',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            fontWeight: isAuto ? 800 : 600,
            fontSize: '0.82rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Sparkles size={14} color={isAuto ? 'var(--accent-primary)' : 'currentColor'} />
          <span>Automatic</span>
        </button>
      </div>
    </div>
  );
};
