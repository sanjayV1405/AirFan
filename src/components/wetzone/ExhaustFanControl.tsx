import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { ExhaustFanVisualizer } from './ExhaustFanVisualizer';
import { Power, Timer, RefreshCw, AlertCircle, Droplets } from 'lucide-react';

export const ExhaustFanControl: React.FC = () => {
  const { telemetry, connectionState, setExhaustFan, commandPending } = useAirLoop();
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [exhaustMode, setExhaustMode] = useState<'auto' | 'manual'>('auto');

  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && telemetry.exhaustFanState;
  const runtimeSec = isConnected ? telemetry.exhaustFanRuntimeSeconds : 0;
  const runtimeMin = Math.floor(runtimeSec / 60);
  const runtimeRemSec = runtimeSec % 60;
  const currentHumidity = isConnected ? telemetry.wetZoneHumidityPercent : null;

  const handleToggle = async () => {
    if (!isConnected) return;
    setIsToggling(true);
    await setExhaustFan(!isRunning);
    setIsToggling(false);
  };

  const isBusy = isToggling || commandPending;

  return (
    <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="icon-container"
            style={{
              width: 36, height: 36,
              background: isRunning ? 'rgba(192, 123, 43, 0.12)' : 'var(--bg-secondary)',
              color: isRunning ? 'var(--color-warning)' : 'var(--text-secondary)',
              border: `1px solid ${isRunning ? 'rgba(192, 123, 43, 0.22)' : 'var(--border-medium)'}`,
              transition: 'all var(--transition-normal)',
            }}
          >
            <Power size={17} />
          </div>
          <div>
            <div className="section-heading">Exhaust Fan</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 1 }}>
              Moisture extraction & air renewal
            </div>
          </div>
        </div>

        <span style={{
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.72rem',
          fontWeight: 600,
          background: isRunning ? 'rgba(192, 123, 43, 0.10)' : 'var(--bg-secondary)',
          color: isRunning ? 'var(--color-warning)' : 'var(--text-muted)',
          border: `1px solid ${isRunning ? 'rgba(192, 123, 43, 0.22)' : 'var(--border-medium)'}`,
        }}>
          {!isConnected ? 'Offline' : isRunning ? 'Ventilating' : 'Standby'}
        </span>
      </div>

      {/* Visualizer + Runtime */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 16,
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ExhaustFanVisualizer size={130} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Runtime */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.70rem', color: 'var(--text-muted)', marginBottom: 2 }}>
              <Timer size={12} />
              <span>Active Runtime</span>
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: isRunning ? 'var(--color-warning)' : 'var(--text-muted)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {isRunning
                ? `${runtimeMin.toString().padStart(2, '0')}:${runtimeRemSec.toString().padStart(2, '0')}`
                : '—'}
            </div>
          </div>

          {/* Humidity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <Droplets size={13} color="var(--accent-primary)" />
            <span>Moisture: <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{currentHumidity !== null ? `${currentHumidity}%` : '—'}</strong></span>
          </div>

          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {isRunning
              ? 'Extracting moist air to restore balance.'
              : 'Triggers when humidity rises suddenly.'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '3px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-medium)',
        }}>
          {(['auto', 'manual'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setExhaustMode(m)}
              style={{
                padding: '5px 12px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                border: exhaustMode === m ? '1px solid var(--border-medium)' : '1px solid transparent',
                background: exhaustMode === m ? '#FAFCFE' : 'transparent',
                color: exhaustMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.76rem',
                fontWeight: exhaustMode === m ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
                boxShadow: exhaustMode === m ? 'var(--shadow-xs)' : 'none',
              }}
            >
              {m === 'auto' ? 'Auto' : 'Manual'}
            </button>
          ))}
        </div>

        {/* Power toggle */}
        <button
          onClick={handleToggle}
          disabled={!isConnected || isBusy}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${isRunning ? 'rgba(192, 57, 43, 0.30)' : isConnected ? 'rgba(8, 127, 140, 0.30)' : 'var(--border-medium)'}`,
            background: isRunning
              ? 'rgba(192, 57, 43, 0.08)'
              : isConnected
              ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              : 'var(--bg-secondary)',
            color: isRunning ? 'var(--color-error)' : isConnected ? '#FFFFFF' : 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            cursor: isConnected ? 'pointer' : 'not-allowed',
            boxShadow: !isRunning && isConnected ? 'var(--shadow-teal)' : 'none',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {isBusy ? (
            <><RefreshCw size={14} className="spin" /><span>Sending…</span></>
          ) : (
            <><Power size={14} /><span>{isRunning ? 'Turn Off' : 'Turn On'}</span></>
          )}
        </button>
      </div>

      {!isConnected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--color-error)', marginTop: 12 }}>
          <AlertCircle size={13} />
          <span>Hardware disconnected — exhaust fan controls disabled.</span>
        </div>
      )}
    </div>
  );
};
