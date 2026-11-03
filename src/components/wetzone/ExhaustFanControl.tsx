import React, { useState } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { ExhaustFanVisualizer } from './ExhaustFanVisualizer';
import { Power, Timer, RefreshCw, Wind, AlertCircle, Droplets, ShieldCheck } from 'lucide-react';

export const ExhaustFanControl: React.FC = () => {
  const { telemetry, connectionState, setExhaustFan, commandPending } = useAirLoop();
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [exhaustMode, setExhaustMode] = useState<'auto' | 'manual'>('auto');

  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && telemetry.exhaustFanState;
  const runtimeSec = isConnected ? telemetry.exhaustFanRuntimeSeconds : 0;
  const runtimeMinutes = Math.floor(runtimeSec / 60);
  const runtimeRemainingSeconds = runtimeSec % 60;
  const currentHumidity = isConnected ? telemetry.wetZoneHumidityPercent : null;

  const handleToggle = async () => {
    if (!isConnected) return;
    setIsToggling(true);
    await setExhaustFan(!isRunning);
    setIsToggling(false);
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
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-amber)',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.12)'
          }}>
            <Wind size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Exhaust Ventilation Fan
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Moisture extraction &amp; air renewal
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span style={{
          padding: '5px 12px',
          borderRadius: 8,
          fontSize: '0.74rem',
          fontWeight: 800,
          background: isRunning ? 'var(--accent-amber-dim)' : 'rgba(255, 255, 255, 0.05)',
          color: isRunning ? 'var(--accent-amber)' : 'var(--text-muted)',
          border: `1px solid ${isRunning ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)'}`,
          boxShadow: isRunning ? '0 0 14px rgba(245, 158, 11, 0.2)' : 'none'
        }}>
          {isRunning ? 'VENTILATING' : 'STANDBY'}
        </span>
      </div>

      {/* Visualizer & Runtime Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        alignItems: 'center',
        background: 'rgba(11, 17, 32, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        padding: '18px',
        marginBottom: 16
      }}>
        {/* Dedicated Turbine Visualizer */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ExhaustFanVisualizer size={160} />
        </div>

        {/* Runtime & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <Timer size={14} color="var(--accent-amber)" />
              <span>Continuous Active Run Time</span>
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2rem',
              fontWeight: 800,
              color: isRunning ? 'var(--accent-amber)' : 'var(--text-muted)',
              marginTop: 2
            }}>
              {isRunning 
                ? `${runtimeMinutes.toString().padStart(2, '0')}:${runtimeRemainingSeconds.toString().padStart(2, '0')}`
                : '00:00'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <Droplets size={14} color="var(--accent-primary)" />
            <span>Room Moisture: <strong style={{ color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>{currentHumidity !== null ? `${currentHumidity}%` : '--'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={14} color="var(--color-success)" />
            <span>Hardware Relay: <strong style={{ color: isRunning ? 'var(--color-success)' : 'var(--text-muted)' }}>{isRunning ? 'Engaged (GPIO 26)' : 'Open'}</strong></span>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        paddingTop: 8
      }}>
        {/* Mode Selector for Exhaust */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-3)',
          padding: 3,
          borderRadius: 8,
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setExhaustMode('auto')}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: exhaustMode === 'auto' ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
              background: exhaustMode === 'auto' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
              color: exhaustMode === 'auto' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Auto Moisture
          </button>
          <button
            type="button"
            onClick={() => setExhaustMode('manual')}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: exhaustMode === 'manual' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
              background: exhaustMode === 'manual' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: exhaustMode === 'manual' ? 'var(--accent-amber)' : 'var(--text-muted)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Manual Override
          </button>
        </div>

        {/* ON / OFF Power Button */}
        <button
          onClick={handleToggle}
          disabled={!isConnected || isToggling || commandPending}
          style={{
            padding: '10px 22px',
            borderRadius: 10,
            border: isRunning ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
            background: isRunning 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.15) 100%)' 
              : isConnected 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)' 
                : 'var(--surface-3)',
            color: isRunning ? '#EF4444' : isConnected ? '#F59E0B' : 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: isConnected ? 'pointer' : 'not-allowed',
            boxShadow: isRunning ? '0 0 16px rgba(239, 68, 68, 0.2)' : isConnected ? '0 0 16px rgba(245, 158, 11, 0.15)' : 'none',
            transition: 'all var(--transition-fast)'
          }}
        >
          {isToggling || commandPending ? (
            <>
              <RefreshCw size={15} className="spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <Power size={15} />
              <span>{isRunning ? 'Disengage Exhaust' : 'Engage Exhaust'}</span>
            </>
          )}
        </button>
      </div>

      {!isConnected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--color-error)', marginTop: 12 }}>
          <AlertCircle size={14} />
          <span>Hardware is disconnected. Exhaust ventilation is disabled.</span>
        </div>
      ) : (
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.4 }}>
          {isRunning
            ? 'Ventilation fan is actively operating to extract moist room air and restore baseline balance.'
            : 'Ventilation triggers automatically whenever sudden steam or elevated moisture is detected.'}
        </div>
      )}
    </div>
  );
};
