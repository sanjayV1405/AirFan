import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Sparkles, Droplets, UserCheck, Flame, ArrowRight } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const {
    config,
    toggleDemoMode,
    triggerMoistureSpike,
    triggerMotionToggle,
    adjustSimTemp,
    telemetry,
    reconnect
  } = useAirLoop();

  if (!config.demoMode) return null;

  return (
    <div style={{
      background: 'var(--banner-bg)',
      borderBottom: '1px solid var(--banner-border)',
      padding: '6px 20px',
      position: 'relative',
      zIndex: 25,
      transition: 'background var(--transition-normal), border-color var(--transition-normal)'
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--banner-text)' }}>
          <Sparkles size={13} />
          <strong style={{ fontWeight: 600 }}>Simulation Engine</strong>
          <span style={{ color: 'var(--banner-subtext)' }}>— interactive test bench</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => adjustSimTemp(1.0)}
            style={{
              background: 'var(--accent-amber-dim)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: 'var(--accent-amber)',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <Flame size={11} /> +1°C
          </button>
          <button
            onClick={() => adjustSimTemp(-1.0)}
            style={{
              background: 'var(--accent-amber-dim)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: 'var(--accent-amber)',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            -1°C
          </button>
          <button
            onClick={triggerMoistureSpike}
            style={{
              background: 'var(--accent-secondary-dim)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--accent-secondary)',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <Droplets size={11} /> Moisture
          </button>
          <button
            onClick={triggerMotionToggle}
            style={{
              background: 'var(--accent-primary-dim)',
              border: '1px solid var(--border-accent)',
              color: 'var(--accent-primary)',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <UserCheck size={11} /> {telemetry.occupancyDetected ? 'Occupied' : 'Vacant'}
          </button>
          <button
            onClick={() => { toggleDemoMode(false); reconnect(); }}
            style={{
              background: 'var(--accent-primary-dim)',
              border: '1px solid var(--border-accent)',
              color: 'var(--accent-primary)',
              borderRadius: 6,
              padding: '3px 10px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              marginLeft: 4
            }}
          >
            Connect ESP32 <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
