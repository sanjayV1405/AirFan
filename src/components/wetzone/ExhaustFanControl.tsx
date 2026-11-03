import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Power, Timer, RefreshCw, Wind, AlertCircle } from 'lucide-react';

export const ExhaustFanControl: React.FC = () => {
  const { telemetry, connectionState, setExhaustFan, commandPending } = useAirLoop();
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && telemetry.exhaustFanState;
  const runtimeSec = isConnected ? telemetry.exhaustFanRuntimeSeconds : 0;
  const runtimeMinutes = Math.floor(runtimeSec / 60);
  const runtimeRemainingSeconds = runtimeSec % 60;

  const handleToggle = async () => {
    if (!isConnected) return;
    setIsToggling(true);
    await setExhaustFan(!isRunning);
    setIsToggling(false);
  };

  return (
    <div className="glass-panel" style={{
      padding: '22px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-secondary)'
          }}>
            <Wind size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ventilation Fan Control
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Air extraction &amp; moisture exhaust
            </span>
          </div>
        </div>

        <span style={{
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: '0.74rem',
          fontWeight: 700,
          background: isRunning ? 'var(--color-success-dim)' : 'var(--surface-3)',
          color: isRunning ? 'var(--color-success)' : 'var(--text-muted)',
          border: `1px solid ${isRunning ? 'rgba(5, 150, 105, 0.25)' : 'var(--border-subtle)'}`
        }}>
          {isRunning ? 'FAN RUNNING' : 'FAN STANDBY'}
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
        borderRadius: 14,
        marginBottom: 12
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Timer size={14} />
            <span>Active Run Time</span>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.8rem',
            fontWeight: 800,
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
          disabled={!isConnected || isToggling || commandPending}
          style={{
            padding: '10px 22px',
            borderRadius: 10,
            border: isRunning ? '1px solid rgba(220, 38, 38, 0.3)' : 'none',
            background: isRunning ? 'var(--color-error-dim)' : isConnected ? 'var(--accent-secondary)' : 'var(--surface-3)',
            color: isRunning ? 'var(--color-error)' : isConnected ? '#FFFFFF' : 'var(--text-muted)',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: isConnected ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-fast)',
            boxShadow: isRunning ? 'none' : isConnected ? 'var(--shadow-sm)' : 'none'
          }}
        >
          {isToggling || commandPending ? (
            <>
              <RefreshCw size={14} className="spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Power size={15} />
              <span>{isRunning ? 'Stop Ventilation' : 'Start Ventilation'}</span>
            </>
          )}
        </button>
      </div>

      {!isConnected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--color-error)' }}>
          <AlertCircle size={14} />
          <span>Hardware is disconnected. Ventilation control unavailable.</span>
        </div>
      ) : (
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {isRunning
            ? 'Ventilation fan is commanded to run by the system or user.'
            : 'Ventilation fan starts automatically when room moisture spikes.'}
        </div>
      )}
    </div>
  );
};
