import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Minus, Plus, Check, RefreshCw, Wind, AlertCircle } from 'lucide-react';

const PRESETS = [
  { label: 'Off', value: 0 },
  { label: 'Low', value: 25 },
  { label: 'Medium', value: 50 },
  { label: 'High', value: 75 },
  { label: 'Max', value: 100 },
];

export const SpeedDial: React.FC = () => {
  const { telemetry, connectionState, setFanSpeed, commandPending, setOperatingMode } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const [stagedSpeed, setStagedSpeed] = useState<number>(telemetry.requestedFanSpeedPercent);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (!hasUnappliedChanges && isConnected) {
      setStagedSpeed(telemetry.requestedFanSpeedPercent);
    }
  }, [telemetry.requestedFanSpeedPercent, hasUnappliedChanges, isConnected]);

  const isManual = telemetry.activeMode === 'manual';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isConnected) return;
    const val = Number(e.target.value);
    setStagedSpeed(val);
    setHasUnappliedChanges(val !== telemetry.requestedFanSpeedPercent);
  };

  const handlePresetClick = (val: number) => {
    if (!isConnected) return;
    setStagedSpeed(val);
    setHasUnappliedChanges(val !== telemetry.requestedFanSpeedPercent);
  };

  const handleStep = (delta: number) => {
    if (!isConnected) return;
    const next = Math.max(0, Math.min(100, stagedSpeed + delta));
    setStagedSpeed(next);
    setHasUnappliedChanges(next !== telemetry.requestedFanSpeedPercent);
  };

  const handleApplySpeed = async () => {
    if (!isConnected) return;
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
      padding: '22px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent-primary-dim)',
            border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Wind size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Room Fan Speed
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {isConnected ? (isManual ? 'Manual Control' : 'Automatic Regulation') : 'Hardware Disconnected'}
            </span>
          </div>
        </div>

        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 
            ? 'var(--accent-primary)' 
            : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          background: isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 
            ? 'var(--accent-primary-dim)' 
            : 'var(--surface-3)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 10px',
          borderRadius: 8
        }}>
          {isConnected 
            ? (telemetry.hardwarePwmPercent !== null ? `${telemetry.hardwarePwmPercent}% Active` : `${telemetry.requestedFanSpeedPercent}% Target`)
            : 'Offline'}
        </div>
      </div>

      {/* Main Stepper & Display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0 16px 0',
        opacity: isConnected ? 1 : 0.6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            onClick={() => handleStep(-5)}
            disabled={!isConnected || stagedSpeed <= 0 || isApplying || commandPending}
            title="Decrease by 5%"
            aria-label="Decrease speed"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: (!isConnected || stagedSpeed <= 0) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Minus size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.4rem',
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : stagedSpeed > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
              lineHeight: 1
            }}>
              {isConnected ? stagedSpeed : '--'}
            </span>
            <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
          </div>

          <button
            onClick={() => handleStep(5)}
            disabled={!isConnected || stagedSpeed >= 100 || isApplying || commandPending}
            title="Increase by 5%"
            aria-label="Increase speed"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: (!isConnected || stagedSpeed >= 100) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Smooth Slider */}
        <div style={{ width: '100%', maxWidth: 380, marginTop: 18 }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isConnected ? stagedSpeed : 0}
            onChange={handleSliderChange}
            disabled={!isConnected}
            aria-label="Fan Speed Slider"
            style={{
              width: '100%',
              background: isConnected
                ? `linear-gradient(to right, #0891B2 0%, #2563EB ${stagedSpeed}%, #E2E8F0 ${stagedSpeed}%, #E2E8F0 100%)`
                : '#E2E8F0'
            }}
          />
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
        marginTop: 4
      }}>
        {PRESETS.map(p => {
          const isSelected = isConnected && stagedSpeed === p.value;
          return (
            <button
              key={p.value}
              onClick={() => handlePresetClick(p.value)}
              disabled={!isConnected}
              style={{
                padding: '8px 4px',
                borderRadius: '8px',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--accent-primary-dim)' : '#FFFFFF',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.8rem',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Footer / Apply Action */}
      <div style={{
        marginTop: 18,
        paddingTop: 16,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {!isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--color-error)' }}>
            <AlertCircle size={15} />
            <span>Connect hardware to adjust fan speed.</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            {hasUnappliedChanges
              ? 'Click Apply to transmit speed to room fan.'
              : isManual ? 'Fan running at selected setpoint.' : 'Autonomous automatic climate regulation active.'}
          </span>
        )}

        <button
          onClick={handleApplySpeed}
          disabled={!isConnected || isApplying || commandPending || (!hasUnappliedChanges && isManual)}
          style={{
            background: isConnected && (hasUnappliedChanges || !isManual) ? 'var(--accent-primary)' : 'var(--surface-3)',
            color: isConnected && (hasUnappliedChanges || !isManual) ? '#FFFFFF' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '9px',
            padding: '9px 20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: isConnected && (hasUnappliedChanges || !isManual) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: isConnected && (hasUnappliedChanges || !isManual) ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
        >
          {isApplying || commandPending ? (
            <>
              <RefreshCw size={14} className="spin" />
              <span>Updating Hardware...</span>
            </>
          ) : (
            <>
              <Check size={15} />
              <span>Apply Speed</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
