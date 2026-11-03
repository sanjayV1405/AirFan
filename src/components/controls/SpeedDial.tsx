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
      padding: '24px',
      borderRadius: '18px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--accent-primary-dim)',
            border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-primary)',
            boxShadow: '0 0 16px rgba(0, 242, 254, 0.15)'
          }}>
            <Wind size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Ceiling Fan Controls
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {isConnected ? (isManual ? 'Manual Target Setpoint' : 'Automatic Autonomous Speed') : 'Hardware Offline'}
            </span>
          </div>
        </div>

        {/* Speed / Hardware Output Pill */}
        <div style={{
          fontSize: '0.76rem',
          fontWeight: 700,
          color: isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 
            ? 'var(--accent-primary)' 
            : 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          background: isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 
            ? 'var(--accent-primary-dim)' 
            : 'var(--surface-3)',
          border: `1px solid ${isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
          padding: '4px 12px',
          borderRadius: 8
        }}>
          {isConnected 
            ? (telemetry.hardwarePwmPercent !== null ? `${telemetry.hardwarePwmPercent}% Output` : `${telemetry.requestedFanSpeedPercent}% Target`)
            : 'Offline'}
        </div>
      </div>

      {/* Main Stepper & Display */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0 18px 0',
        opacity: isConnected ? 1 : 0.55
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button
            onClick={() => handleStep(-5)}
            disabled={!isConnected || stagedSpeed <= 0 || isApplying || commandPending}
            title="Decrease 5%"
            aria-label="Decrease speed"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(20, 31, 56, 0.7)',
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

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3.8rem',
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : stagedSpeed > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textShadow: isConnected && stagedSpeed > 0 ? '0 0 20px rgba(0, 242, 254, 0.35)' : 'none'
            }}>
              {isConnected ? stagedSpeed : '--'}
            </span>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>%</span>
          </div>

          <button
            onClick={() => handleStep(5)}
            disabled={!isConnected || stagedSpeed >= 100 || isApplying || commandPending}
            title="Increase 5%"
            aria-label="Increase speed"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(20, 31, 56, 0.7)',
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

        {/* Smooth Linear Slider */}
        <div style={{ width: '100%', maxWidth: 420, marginTop: 22 }}>
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
                ? `linear-gradient(to right, #00F2FE 0%, #3B82F6 ${stagedSpeed}%, rgba(255, 255, 255, 0.08) ${stagedSpeed}%, rgba(255, 255, 255, 0.08) 100%)`
                : 'rgba(255, 255, 255, 0.08)'
            }}
          />
        </div>
      </div>

      {/* Preset Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
        marginTop: 6
      }}>
        {PRESETS.map(p => {
          const isSelected = isConnected && stagedSpeed === p.value;
          return (
            <button
              key={p.value}
              onClick={() => handlePresetClick(p.value)}
              disabled={!isConnected}
              style={{
                padding: '9px 4px',
                borderRadius: '10px',
                border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--accent-primary-dim)' : 'rgba(20, 31, 56, 0.45)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: isSelected ? '0 0 16px rgba(0, 242, 254, 0.2)' : 'none',
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.82rem',
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
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {!isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--color-error)' }}>
            <AlertCircle size={15} />
            <span>Connect hardware to adjust ceiling fan speed.</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {hasUnappliedChanges
              ? 'Click Apply to transmit PWM setpoint to ceiling fan.'
              : isManual ? 'Ceiling fan operating at manual setpoint.' : 'Autonomous climate algorithm actively modulating airflow.'}
          </span>
        )}

        <button
          onClick={handleApplySpeed}
          disabled={!isConnected || isApplying || commandPending || (!hasUnappliedChanges && isManual)}
          style={{
            background: isConnected && (hasUnappliedChanges || !isManual) 
              ? 'linear-gradient(135deg, #00F2FE 0%, #3B82F6 100%)' 
              : 'var(--surface-3)',
            color: isConnected && (hasUnappliedChanges || !isManual) ? '#070B14' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 22px',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: isConnected && (hasUnappliedChanges || !isManual) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: isConnected && (hasUnappliedChanges || !isManual) ? '0 0 20px rgba(0, 242, 254, 0.35)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
        >
          {isApplying || commandPending ? (
            <>
              <RefreshCw size={15} className="spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Apply Speed</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
