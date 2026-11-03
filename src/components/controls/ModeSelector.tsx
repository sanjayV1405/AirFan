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
    <div className="card-solid" style={{
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      {/* Left: description */}
      <div>
        <div style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
        }}>
          Fan Operation Mode
        </div>
        <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
          {isConnected
            ? (isAuto
              ? 'Automatically adjusts speed based on temperature & occupancy'
              : 'Manual speed — fixed to your chosen setpoint')
            : 'Connect hardware to control the operating mode'}
        </div>
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isTransitioning && (
          <span style={{
            fontSize: '0.76rem',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontWeight: 600,
          }}>
            <RefreshCw size={12} className="spin" />
            Switching…
          </span>
        )}

        {/* Segmented pill control */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: 3,
          border: '1.5px solid var(--border-card)',
          boxShadow: 'var(--shadow-xs)',
          opacity: isConnected ? 1 : 0.5,
        }}>
          <button
            onClick={() => handleSelectMode('manual')}
            disabled={!isConnected || isTransitioning || commandPending}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: !isAuto ? '1px solid rgba(8,127,140,0.28)' : '1px solid transparent',
              background: !isAuto
                ? 'linear-gradient(135deg, var(--surface-card) 0%, #F0F8F5 100%)'
                : 'transparent',
              color: !isAuto ? 'var(--accent-primary)' : 'var(--text-muted)',
              boxShadow: !isAuto ? 'var(--shadow-xs)' : 'none',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontWeight: !isAuto ? 700 : 500,
              fontSize: '0.84rem',
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
              padding: '8px 18px',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: isAuto ? '1px solid rgba(8,127,140,0.28)' : '1px solid transparent',
              background: isAuto
                ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
                : 'transparent',
              color: isAuto ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: isAuto ? 'var(--shadow-teal)' : 'none',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              fontWeight: isAuto ? 700 : 500,
              fontSize: '0.84rem',
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
