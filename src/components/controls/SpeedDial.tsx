import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Minus, Plus, Check, RefreshCw, Wind } from 'lucide-react';

const PRESETS = [
  { label: 'Off', value: 0 },
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: 'Max', value: 100 },
];

export const SpeedDial: React.FC = () => {
  const { telemetry, setFanSpeed, commandPending, setOperatingMode } = useAirLoop();
  const [stagedSpeed, setStagedSpeed] = useState<number>(telemetry.requestedFanSpeedPercent);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (!hasUnappliedChanges) {
      setStagedSpeed(telemetry.requestedFanSpeedPercent);
    }
  }, [telemetry.requestedFanSpeedPercent, hasUnappliedChanges]);

  const isManual = telemetry.activeMode === 'manual';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setStagedSpeed(val);
    setHasUnappliedChanges(val !== telemetry.requestedFanSpeedPercent);
  };

  const handlePresetClick = (val: number) => {
    setStagedSpeed(val);
    setHasUnappliedChanges(val !== telemetry.requestedFanSpeedPercent);
  };

  const handleStep = (delta: number) => {
    const next = Math.max(0, Math.min(100, stagedSpeed + delta));
    setStagedSpeed(next);
    setHasUnappliedChanges(next !== telemetry.requestedFanSpeedPercent);
  };

  const handleApplySpeed = async () => {
    setIsApplying(true);
    if (!isManual) {
      await setOperatingMode('manual');
    }
    const success = await setFanSpeed(stagedSpeed);
    setIsApplying(false);
    if (success) {
      setHasUnappliedChanges(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wind size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            PWM Fan Control
          </h3>
        </div>

        <div className="tabular-nums" style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--accent-primary)',
          fontFamily: 'var(--font-mono)',
          background: 'var(--accent-primary-dim)',
          border: '1px solid var(--border-accent)',
          padding: '2px 8px',
          borderRadius: 6
        }}>
          {telemetry.hardwarePwmPercent !== null ? `${telemetry.hardwarePwmPercent}% PWM` : `${telemetry.requestedFanSpeedPercent}%`}
        </div>
      </div>

      {/* Main Stepper & Display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px 0 16px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => handleStep(-5)}
            disabled={stagedSpeed <= 0 || isApplying || commandPending}
            title="Decrease 5%"
            aria-label="Decrease speed"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: stagedSpeed <= 0 ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Minus size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 700,
              color: stagedSpeed > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
              lineHeight: 1
            }}>
              {stagedSpeed}
            </span>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
          </div>

          <button
            onClick={() => handleStep(5)}
            disabled={stagedSpeed >= 100 || isApplying || commandPending}
            title="Increase 5%"
            aria-label="Increase speed"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: stagedSpeed >= 100 ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Linear Range Slider */}
        <div style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={stagedSpeed}
            onChange={handleSliderChange}
            aria-label="Speed Slider"
            style={{
              width: '100%',
              background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-secondary) ${stagedSpeed}%, var(--surface-3) ${stagedSpeed}%, var(--surface-3) 100%)`
            }}
          />
        </div>
      </div>

      {/* Preset Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 6,
        marginTop: 4
      }}>
        {PRESETS.map(p => {
          const isSelected = stagedSpeed === p.value;
          return (
            <button
              key={p.value}
              onClick={() => handlePresetClick(p.value)}
              style={{
                padding: '7px 4px',
                borderRadius: '8px',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--accent-primary-dim)' : 'var(--surface-2)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Apply Speed Action */}
      <div style={{
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {hasUnappliedChanges ? 'Ready to transmit PWM value' : isManual ? 'Synced with MOSFET driver' : 'Autonomous auto regulation'}
        </span>

        <button
          onClick={handleApplySpeed}
          disabled={isApplying || commandPending || (!hasUnappliedChanges && isManual)}
          style={{
            background: hasUnappliedChanges || !isManual ? 'var(--accent-primary)' : 'var(--surface-3)',
            color: hasUnappliedChanges || !isManual ? 'var(--text-on-accent)' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: hasUnappliedChanges || !isManual ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: hasUnappliedChanges || !isManual ? '0 0 16px var(--accent-primary-glow)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
        >
          {isApplying || commandPending ? (
            <>
              <RefreshCw size={14} className="spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>Apply Speed</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
