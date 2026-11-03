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
      padding: '14px 18px',
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Fan Operation Mode
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
            {isConnected
              ? (isAuto ? 'Automatic fan speed based on room conditions' : 'Custom fixed speed chosen by user')
              : 'Waiting for hardware connection...'}
          </div>
        </div>

        {isTransitioning && (
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={12} className="spin" /> Updating...
          </span>
        )}
      </div>

      {/* Segmented Switch */}
      <div style={{
        background: 'var(--surface-3)',
        padding: '3px',
        borderRadius: 10,
        display: 'flex',
        gap: 3,
        border: '1px solid var(--border-subtle)',
        opacity: isConnected ? 1 : 0.6
      }}>
        <button
          onClick={() => handleSelectMode('manual')}
          disabled={!isConnected || isTransitioning || commandPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 8,
            border: !isAuto ? '1px solid var(--border-subtle)' : '1px solid transparent',
            background: !isAuto ? '#FFFFFF' : 'transparent',
            color: !isAuto ? 'var(--accent-secondary)' : 'var(--text-muted)',
            boxShadow: !isAuto ? 'var(--shadow-sm)' : 'none',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            fontWeight: !isAuto ? 700 : 500,
            fontSize: '0.8rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Sliders size={14} color={!isAuto ? 'var(--accent-secondary)' : 'currentColor'} />
          <span>Manual</span>
        </button>

        <button
          onClick={() => handleSelectMode('auto')}
          disabled={!isConnected || isTransitioning || commandPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 8,
            border: isAuto ? '1px solid var(--border-subtle)' : '1px solid transparent',
            background: isAuto ? '#FFFFFF' : 'transparent',
            color: isAuto ? 'var(--accent-primary)' : 'var(--text-muted)',
            boxShadow: isAuto ? 'var(--shadow-sm)' : 'none',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            fontWeight: isAuto ? 700 : 500,
            fontSize: '0.8rem',
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
