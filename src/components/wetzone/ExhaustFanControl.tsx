import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Power, Timer, RefreshCw, Wind } from 'lucide-react';

export const ExhaustFanControl: React.FC = () => {
  const { telemetry, setExhaustFan, commandPending } = useAirLoop();
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const isRunning = telemetry.exhaustFanState;
  const runtimeSec = telemetry.exhaustFanRuntimeSeconds;
  const runtimeMinutes = Math.floor(runtimeSec / 60);
  const runtimeRemainingSeconds = runtimeSec % 60;

  const handleToggle = async () => {
    setIsToggling(true);
    await setExhaustFan(!isRunning);
    setIsToggling(false);
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wind size={18} color="var(--accent-secondary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Exhaust Ventilation Driver
          </h3>
        </div>

        <span style={{
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: '0.72rem',
          fontWeight: 600,
          background: isRunning ? 'var(--color-success-dim)' : 'var(--surface-3)',
          color: isRunning ? 'var(--color-success)' : 'var(--text-muted)',
          border: `1px solid ${isRunning ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`
        }}>
          {isRunning ? 'RELAY ACTIVE' : 'RELAY OPEN'}
        </span>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        padding: '16px 20px',
        borderRadius: 12,
        marginBottom: 12,
        transition: 'background-color var(--transition-fast), border-color var(--transition-fast)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <Timer size={13} />
            <span>Active Run Time</span>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
            marginTop: 2
          }}>
            {isRunning 
              ? `${runtimeMinutes.toString().padStart(2, '0')}:${runtimeRemainingSeconds.toString().padStart(2, '0')}`
              : '00:00'}
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isToggling || commandPending}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: isRunning ? '1px solid var(--color-error)' : 'none',
            background: isRunning ? 'var(--color-error-dim)' : 'var(--accent-secondary)',
            color: isRunning ? 'var(--color-error)' : '#FFFFFF',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: isToggling ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: isRunning ? '0 0 14px var(--color-error-dim)' : '0 0 14px var(--accent-secondary-dim)'
          }}
        >
          {isToggling || commandPending ? (
            <>
              <RefreshCw size={14} className="spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Power size={14} />
              <span>{isRunning ? 'Disengage Exhaust' : 'Engage Exhaust'}</span>
            </>
          )}
        </button>
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        Hardware driver via ESP32 GPIO 26 digital output relay.
      </div>
    </div>
  );
};
