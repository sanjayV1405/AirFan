import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Sliders, Sparkles, RefreshCw } from 'lucide-react';

export const ModeSelector: React.FC = () => {
  const { telemetry, connectionState, setOperatingMode, commandPending } = useAirLoop();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const isConnected = connectionState === 'connected';
  const isAuto = telemetry.activeMode === 'auto';

  const handleSelectMode = async (mode: 'manual' | 'auto') => {
    if (!isConnected || mode === telemetry.activeMode || isTransitioning || commandPending) return;
    setIsTransitioning(true);
    await setOperatingMode(mode);
    setIsTransitioning(false);
  };

  return (
    <div
      className="card-solid"
      style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Room Fan Mode
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {isConnected
            ? (isAuto
              ? 'Automatically adjusts speed based on temperature & presence'
              : 'Manual speed — fixed to your setpoint')
            : 'Waiting for hardware connection…'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isTransitioning && (
          <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={12} className="spin" />
            Updating
          </span>
        )}

        {/* Segmented Control */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 3,
          border: '1px solid var(--border-medium)',
          opacity: isConnected ? 1 : 0.5,
        }}>
          <button
            onClick={() => handleSelectMode('manual')}
            disabled={!isConnected || isTransitioning || commandPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: !isAuto ? '1px solid rgba(57, 121, 216, 0.30)' : '1px solid transparent',
              background: !isAuto ? '#FAFCFE' : 'transparent',
              color: !isAuto ? 'var(--accent-secondary)' : 'var(--text-muted)',
              boxShadow: !isAuto ? 'var(--shadow-xs)' : 'none',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontWeight: !isAuto ? 600 : 500,
              fontSize: '0.82rem',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Sliders size={13} />
            <span>Manual</span>
          </button>

          <button
            onClick={() => handleSelectMode('auto')}
            disabled={!isConnected || isTransitioning || commandPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: isAuto ? '1px solid rgba(8, 127, 140, 0.30)' : '1px solid transparent',
              background: isAuto ? '#FAFCFE' : 'transparent',
              color: isAuto ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: isAuto ? 'var(--shadow-xs)' : 'none',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontWeight: isAuto ? 600 : 500,
              fontSize: '0.82rem',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Sparkles size={13} />
            <span>Automatic</span>
          </button>
        </div>
      </div>
    </div>
  );
};
