import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Droplets } from 'lucide-react';

export const MoistureIndicator: React.FC = () => {
  const { telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const currentHumidity = isConnected ? telemetry.wetZoneHumidityPercent : null;
  const baseline = isConnected ? telemetry.humidityBaselinePercent : null;
  const isVentilating = isConnected && telemetry.exhaustFanState;

  const getMoistureStatus = () => {
    if (!isConnected || currentHumidity === null) return 'Hardware Offline';
    if (isVentilating) return 'Ventilation Active';
    if (currentHumidity > 70) return 'Elevated Moisture';
    if (currentHumidity > 55) return 'Moderate Humidity';
    return 'Optimal Humidity';
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
            <Droplets size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Humidity &amp; Moisture
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Real-time room moisture level
            </span>
          </div>
        </div>

        <span style={{
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: '0.74rem',
          fontWeight: 700,
          background: isVentilating 
            ? 'var(--accent-amber-dim)' 
            : isConnected ? 'var(--color-success-dim)' : 'var(--surface-3)',
          color: isVentilating 
            ? 'var(--accent-amber)' 
            : isConnected ? 'var(--color-success)' : 'var(--text-muted)',
          border: `1px solid ${isVentilating ? 'rgba(217, 119, 6, 0.25)' : 'var(--border-subtle)'}`
        }}>
          {getMoistureStatus()}
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 16
      }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: 12 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Humidity</div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
            {currentHumidity !== null ? `${currentHumidity}%` : '--'}
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: 12 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target Baseline</div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: 2 }}>
            {baseline !== null ? `${baseline}%` : '50%'}
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: 12 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ventilation Status</div>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: isVentilating ? 'var(--accent-amber)' : 'var(--color-success)',
            marginTop: 6
          }}>
            {!isConnected ? 'Offline' : isVentilating ? 'Clearing' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'var(--surface-3)',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, currentHumidity ?? 0)}%`,
          background: isVentilating 
            ? 'linear-gradient(90deg, #F59E0B, #DC2626)' 
            : 'linear-gradient(90deg, #0891B2, #2563EB)',
          borderRadius: 4,
          transition: 'width var(--transition-normal)'
        }} />
      </div>

      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 10 }}>
        {isConnected
          ? (isVentilating 
              ? 'Ventilation fan is actively operating to expel humid air.'
              : 'Room moisture is comfortable. Automatic ventilation on standby.')
          : 'Waiting for connection to humidity sensor...'}
      </div>
    </div>
  );
};
