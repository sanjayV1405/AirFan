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
    <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="icon-container"
            style={{
              width: 38, height: 38,
              borderRadius: 'var(--radius-sm)',
              background: isRunning ? 'var(--color-warning-bg)' : 'var(--bg-secondary)',
              color: isRunning ? 'var(--color-warning)' : 'var(--text-secondary)',
              border: `1.5px solid ${isRunning ? 'rgba(181, 112, 10, 0.28)' : 'var(--border-card)'}`,
              transition: 'all var(--transition-normal)',
            }}
          >
            <Power size={18} />
          </div>
          <div>
            <div className="section-heading">Exhaust Ventilation Fan</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Moisture extraction &amp; air renewal system
            </div>
          </div>
        </div>

        <span style={{
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.74rem',
          fontWeight: 700,
          background: isRunning ? 'var(--color-warning-bg)' : 'var(--bg-secondary)',
          color: isRunning ? 'var(--color-warning)' : 'var(--text-muted)',
          border: `1.5px solid ${isRunning ? 'rgba(181, 112, 10, 0.28)' : 'var(--border-card)'}`,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {!isConnected ? 'Offline' : isRunning ? 'Ventilating' : 'Standby'}
        </span>
      </div>

      {/* Visualizer + Runtime */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 18,
        alignItems: 'center',
        background: 'var(--surface-2)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ExhaustFanVisualizer size={135} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Runtime */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
              <Timer size={13} />
              <span>Active Cycle Runtime</span>
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: isRunning ? 'var(--color-warning)' : 'var(--text-muted)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}>
              {isRunning
                ? `${runtimeMin.toString().padStart(2, '0')}:${runtimeRemSec.toString().padStart(2, '0')}`
                : '—'}
            </div>
          </div>

          {/* Humidity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
            <Droplets size={14} color="var(--accent-primary)" />
            <span>Zone Moisture: <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{currentHumidity !== null ? `${currentHumidity}%` : '—'}</strong></span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {isRunning
              ? 'Relay active — extracting damp air until baseline is reached.'
              : 'Relay open — automatic trigger armed for moisture spikes.'}
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
          border: '1.5px solid var(--border-card)',
        }}>
          {(['auto', 'manual'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setExhaustMode(m)}
              style={{
                padding: '6px 14px',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                border: exhaustMode === m ? '1px solid var(--border-medium)' : '1px solid transparent',
                background: exhaustMode === m ? 'var(--surface-card)' : 'transparent',
                color: exhaustMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '0.80rem',
                fontWeight: exhaustMode === m ? 700 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
                boxShadow: exhaustMode === m ? 'var(--shadow-xs)' : 'none',
              }}
            >
              {m === 'auto' ? 'Auto Trigger' : 'Manual'}
            </button>
          ))}
        </div>

        {/* Power toggle */}
        <button
          onClick={handleToggle}
          disabled={!isConnected || isBusy}
          style={{
            padding: '10px 22px',
            borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${isRunning ? 'rgba(184, 50, 50, 0.35)' : isConnected ? 'rgba(8, 127, 140, 0.35)' : 'var(--border-card)'}`,
            background: isRunning
              ? 'rgba(184, 50, 50, 0.10)'
              : isConnected
              ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              : 'var(--bg-secondary)',
            color: isRunning ? 'var(--color-error)' : isConnected ? '#FFFFFF' : 'var(--text-muted)',
            fontSize: '0.86rem',
            fontWeight: 700,
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
            <><Power size={15} /><span>{isRunning ? 'Stop Exhaust' : 'Start Exhaust'}</span></>
          )}
        </button>
      </div>

      {!isConnected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-error)', marginTop: 14 }}>
          <AlertCircle size={14} />
          <span>Hardware disconnected — exhaust fan actuator is offline.</span>
        </div>
      )}
    </div>
  );
};
