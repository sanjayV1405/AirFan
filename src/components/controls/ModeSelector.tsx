import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Sliders, Cpu, RefreshCw } from 'lucide-react';

export const ModeSelector: React.FC = () => {
  const { telemetry, setOperatingMode, commandPending } = useAirLoop();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleSelectMode = async (mode: 'manual' | 'auto') => {
    if (mode === telemetry.activeMode || isTransitioning || commandPending) return;
    setIsTransitioning(true);
    await setOperatingMode(mode);
    setIsTransitioning(false);
  };

  const isAuto = telemetry.activeMode === 'auto';

  return (
    <div className="glass-panel" style={{
      padding: '12px 16px',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Operating Mode
        </span>
        {isTransitioning && (
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={11} className="spin" /> Switching...
          </span>
        )}
      </div>

      {/* Segmented toggle */}
      <div style={{
        background: 'var(--surface-3)',
        padding: '3px',
        borderRadius: 9,
        display: 'flex',
        gap: 3,
        border: '1px solid var(--border-subtle)',
        transition: 'background var(--transition-normal), border-color var(--transition-normal)'
      }}>
        <button
          onClick={() => handleSelectMode('manual')}
          disabled={isTransitioning || commandPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 7,
            border: !isAuto ? '1px solid var(--accent-secondary)' : '1px solid transparent',
            background: !isAuto ? 'var(--accent-secondary-dim)' : 'transparent',
            color: !isAuto ? 'var(--accent-secondary)' : 'var(--text-muted)',
            boxShadow: !isAuto ? '0 0 10px var(--accent-secondary-dim)' : 'none',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            fontWeight: !isAuto ? 600 : 500,
            fontSize: '0.78rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Sliders size={13} color={!isAuto ? 'var(--accent-secondary)' : 'currentColor'} />
          <span>Manual</span>
        </button>

        <button
          onClick={() => handleSelectMode('auto')}
          disabled={isTransitioning || commandPending}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 7,
            border: isAuto ? '1px solid var(--border-accent)' : '1px solid transparent',
            background: isAuto ? 'var(--accent-primary-dim)' : 'transparent',
            color: isAuto ? 'var(--accent-primary)' : 'var(--text-muted)',
            boxShadow: isAuto ? '0 0 10px var(--accent-primary-dim)' : 'none',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            fontWeight: isAuto ? 600 : 500,
            fontSize: '0.78rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Cpu size={13} color={isAuto ? 'var(--accent-primary)' : 'currentColor'} />
          <span>Automatic</span>
        </button>
      </div>
    </div>
  );
};
