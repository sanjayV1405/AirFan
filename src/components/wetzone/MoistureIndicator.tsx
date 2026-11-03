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
    if (isVentilating) return 'Exhaust Active — Clearing';
    if (currentHumidity > 70) return 'High Moisture Detected';
    if (currentHumidity > 55) return 'Normal Humidity';
    return 'Dry & Comfortable';
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
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#38BDF8',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.15)'
          }}>
            <Droplets size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Humidity &amp; Moisture Dynamics
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Real-time room moisture monitoring
            </span>
          </div>
        </div>

        <span style={{
          padding: '5px 12px',
          borderRadius: 8,
          fontSize: '0.74rem',
          fontWeight: 800,
          background: isVentilating 
            ? 'var(--accent-amber-dim)' 
            : isConnected ? 'var(--color-success-dim)' : 'var(--surface-3)',
          color: isVentilating 
            ? 'var(--accent-amber)' 
            : isConnected ? 'var(--color-success)' : 'var(--text-muted)',
          border: `1px solid ${isVentilating ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)'}`,
          boxShadow: isVentilating ? '0 0 14px rgba(245, 158, 11, 0.2)' : 'none'
        }}>
          {getMoistureStatus()}
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        marginBottom: 18
      }}>
        <div style={{ background: 'rgba(11, 17, 32, 0.65)', border: '1px solid var(--border-subtle)', padding: '14px 16px', borderRadius: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Humidity</div>
          <div className="tabular-nums" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
            {currentHumidity !== null ? `${currentHumidity}%` : '--'}
          </div>
        </div>

        <div style={{ background: 'rgba(11, 17, 32, 0.65)', border: '1px solid var(--border-subtle)', padding: '14px 16px', borderRadius: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target Baseline</div>
          <div className="tabular-nums" style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
            {baseline !== null ? `${baseline}%` : '50%'}
          </div>
        </div>

        <div style={{ background: 'rgba(11, 17, 32, 0.65)', border: '1px solid var(--border-subtle)', padding: '14px 16px', borderRadius: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ventilation Status</div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: isVentilating ? 'var(--accent-amber)' : 'var(--color-success)',
            marginTop: 7,
            letterSpacing: '-0.01em'
          }}>
            {!isConnected ? 'Offline' : isVentilating ? 'Active' : 'Standby'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'rgba(11, 17, 32, 0.8)',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, currentHumidity ?? 0)}%`,
          background: isVentilating 
            ? 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)' 
            : 'linear-gradient(90deg, #00F2FE 0%, #3B82F6 100%)',
          borderRadius: 4,
          boxShadow: isVentilating ? '0 0 12px rgba(245, 158, 11, 0.5)' : '0 0 12px rgba(0, 242, 254, 0.4)',
          transition: 'width var(--transition-normal)'
        }} />
      </div>

      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.4 }}>
        {isConnected
          ? (isVentilating 
              ? 'Exhaust ventilation fan is running to purge excess steam and restore clean airflow.'
              : 'Room moisture levels are within comfortable bounds. Automatic moisture extraction on standby.')
          : 'Waiting for live connection to humidity sensor...'}
      </div>
    </div>
  );
};
