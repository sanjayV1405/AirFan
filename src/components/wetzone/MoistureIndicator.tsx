import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Droplets } from 'lucide-react';

export const MoistureIndicator: React.FC = () => {
  const { telemetry, config } = useAirLoop();
  const currentHumidity = telemetry.wetZoneHumidityPercent ?? 0;
  const riseRate = telemetry.humidityRiseRatePercentPerMinute ?? 0;
  const isVentilating = telemetry.exhaustFanState;

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Droplets size={18} color="var(--accent-secondary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Wet Zone Humidity Dynamics
          </h3>
        </div>

        <span style={{
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: '0.72rem',
          fontWeight: 600,
          background: isVentilating ? 'var(--accent-amber-dim)' : 'var(--accent-secondary-dim)',
          color: isVentilating ? 'var(--accent-amber)' : 'var(--accent-secondary)',
          border: `1px solid ${isVentilating ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
        }}>
          {isVentilating ? 'Exhaust Active' : 'Baseline Stable'}
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 14
      }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 10, transition: 'background-color var(--transition-fast), border-color var(--transition-fast)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Current RH</div>
          <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}%` : '--'}
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 10, transition: 'background-color var(--transition-fast), border-color var(--transition-fast)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Baseline RH</div>
          <div className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {telemetry.humidityBaselinePercent !== null ? `${telemetry.humidityBaselinePercent}%` : '--'}
          </div>
        </div>

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 10, transition: 'background-color var(--transition-fast), border-color var(--transition-fast)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Rise Rate</div>
          <div className="tabular-nums" style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: riseRate >= config.humidityRiseRateThreshold ? 'var(--color-error)' : 'var(--accent-primary)',
            marginTop: 2,
            fontFamily: 'var(--font-mono)'
          }}>
            {riseRate > 0 ? `+${riseRate}` : riseRate}
            <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 3 }}>%/m</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'var(--surface-3)',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, currentHumidity)}%`,
          background: isVentilating ? 'linear-gradient(90deg, var(--accent-amber), var(--color-error))' : 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))',
          borderRadius: 3,
          transition: 'width var(--transition-normal)'
        }} />
      </div>
    </div>
  );
};
