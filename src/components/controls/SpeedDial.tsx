import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Minus, Plus, Check, RefreshCw, Wind, AlertCircle } from 'lucide-react';

const PRESETS = [
  { label: 'Off',    value: 0   },
  { label: 'Low',    value: 25  },
  { label: 'Medium', value: 50  },
  { label: 'High',   value: 75  },
  { label: 'Max',    value: 100 },
];

export const SpeedDial: React.FC = () => {
  const { telemetry, connectionState, setFanSpeed, commandPending, setOperatingMode } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const [stagedSpeed, setStagedSpeed] = useState<number>(telemetry.requestedFanSpeedPercent);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [hasUnapplied, setHasUnapplied] = useState<boolean>(false);

  useEffect(() => {
    if (!hasUnapplied && isConnected) {
      setStagedSpeed(telemetry.requestedFanSpeedPercent);
    }
  }, [telemetry.requestedFanSpeedPercent, hasUnapplied, isConnected]);

  const isManual = telemetry.activeMode === 'manual';
  const isRunning = isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isConnected) return;
    const v = Number(e.target.value);
    setStagedSpeed(v);
    setHasUnapplied(v !== telemetry.requestedFanSpeedPercent);
  };

  const handlePreset = (v: number) => {
    if (!isConnected) return;
    setStagedSpeed(v);
    setHasUnapplied(v !== telemetry.requestedFanSpeedPercent);
  };

  const handleStep = (delta: number) => {
    if (!isConnected) return;
    const next = Math.max(0, Math.min(100, stagedSpeed + delta));
    setStagedSpeed(next);
    setHasUnapplied(next !== telemetry.requestedFanSpeedPercent);
  };

  const handleApply = async () => {
    if (!isConnected) return;
    setIsApplying(true);
    if (!isManual) await setOperatingMode('manual');
    const ok = await setFanSpeed(stagedSpeed);
    setIsApplying(false);
    if (ok) setHasUnapplied(false);
  };

  const isActionable = isConnected && (hasUnapplied || !isManual);
  const isBusy = isApplying || commandPending;

  return (
    <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="icon-container icon-container-teal"
            style={{ width: 36, height: 36 }}
          >
            <Wind size={18} />
          </div>
          <div>
            <div className="section-heading">Ceiling Fan Speed</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 1 }}>
              {isConnected ? (isManual ? 'Manual setpoint' : 'Automatic mode') : 'Hardware offline'}
            </div>
          </div>
        </div>

        {/* Running status badge */}
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: isRunning ? 'var(--accent-primary-dim)' : 'var(--bg-secondary)',
          color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
          border: `1px solid ${isRunning ? 'rgba(8, 127, 140, 0.25)' : 'var(--border-medium)'}`,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {isConnected
            ? (telemetry.hardwarePwmPercent !== null ? `${telemetry.hardwarePwmPercent}% PWM` : `${telemetry.requestedFanSpeedPercent}%`)
            : 'Offline'}
        </div>
      </div>

      {/* Main stepper */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0 16px 0',
        opacity: isConnected ? 1 : 0.5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Decrease */}
          <button
            onClick={() => handleStep(-5)}
            disabled={!isConnected || stagedSpeed <= 0 || isBusy}
            aria-label="Decrease 5%"
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              border: '1px solid var(--border-medium)',
              background: 'var(--surface-1)',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: (!isConnected || stagedSpeed <= 0) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Minus size={16} />
          </button>

          {/* Big speed number */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.6rem',
              fontWeight: 700,
              color: !isConnected ? 'var(--text-muted)' : stagedSpeed > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
            }}>
              {isConnected ? stagedSpeed : '--'}
            </span>
            <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
          </div>

          {/* Increase */}
          <button
            onClick={() => handleStep(5)}
            disabled={!isConnected || stagedSpeed >= 100 || isBusy}
            aria-label="Increase 5%"
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              border: '1px solid var(--border-medium)',
              background: 'var(--surface-1)',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: (!isConnected || stagedSpeed >= 100) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Slider */}
        <div style={{ width: '100%', maxWidth: 380, marginTop: 20 }}>
          <input
            type="range"
            min="0" max="100" step="1"
            value={isConnected ? stagedSpeed : 0}
            onChange={handleSlider}
            disabled={!isConnected}
            aria-label="Fan Speed"
            style={{
              width: '100%',
              background: isConnected
                ? `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-secondary) ${stagedSpeed}%, var(--bg-secondary) ${stagedSpeed}%, var(--bg-secondary) 100%)`
                : 'var(--bg-secondary)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>Off</span>
            <span>Max</span>
          </div>
        </div>
      </div>

      {/* Preset pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 4 }}>
        {PRESETS.map(p => {
          const sel = isConnected && stagedSpeed === p.value;
          return (
            <button
              key={p.value}
              onClick={() => handlePreset(p.value)}
              disabled={!isConnected}
              style={{
                padding: '7px 2px',
                borderRadius: 'var(--radius-sm)',
                border: sel ? '1px solid rgba(8, 127, 140, 0.30)' : '1px solid var(--border-medium)',
                background: sel ? 'var(--accent-primary-dim)' : 'var(--bg-secondary)',
                color: sel ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: sel ? 600 : 500,
                fontSize: '0.78rem',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Footer / Apply */}
      <div style={{
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        {!isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-error)' }}>
            <AlertCircle size={14} />
            <span>Connect hardware to control fan speed.</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasUnapplied
              ? 'Tap Apply to send new speed to hardware.'
              : isManual ? 'Fan running at manual setpoint.' : 'Auto mode — system managing speed.'}
          </span>
        )}

        <button
          onClick={handleApply}
          disabled={!isActionable || isBusy}
          className={isActionable && !isBusy ? 'btn-primary' : ''}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 20px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: isActionable && !isBusy
              ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
              : 'var(--bg-secondary)',
            color: isActionable && !isBusy ? '#FFFFFF' : 'var(--text-muted)',
            cursor: isActionable && !isBusy ? 'pointer' : 'not-allowed',
            fontSize: '0.84rem',
            fontWeight: 600,
            boxShadow: isActionable && !isBusy ? 'var(--shadow-teal)' : 'none',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {isBusy ? (
            <><RefreshCw size={14} className="spin" /><span>Sending…</span></>
          ) : (
            <><Check size={15} /><span>Apply Speed</span></>
          )}
        </button>
      </div>
    </div>
  );
};
