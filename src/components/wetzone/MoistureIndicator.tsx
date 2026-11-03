import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Droplets } from 'lucide-react';

export const MoistureIndicator: React.FC = () => {
  const { telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';
  const currentHumidity = isConnected ? telemetry.wetZoneHumidityPercent : null;
  const baseline = isConnected ? telemetry.humidityBaselinePercent : null;
  const isVentilating = isConnected && telemetry.exhaustFanState;

  const getStatus = () => {
    if (!isConnected || currentHumidity === null) return { label: 'Sensor Offline', color: 'var(--text-muted)', bg: 'var(--bg-secondary)' };
    if (isVentilating) return { label: 'Ventilating', color: 'var(--color-warning)', bg: 'rgba(192, 123, 43, 0.09)' };
    if (currentHumidity > 70) return { label: 'High Moisture', color: 'var(--color-error)', bg: 'var(--color-error-bg)' };
    if (currentHumidity > 55) return { label: 'Normal', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
    return { label: 'Dry & Comfortable', color: 'var(--accent-primary)', bg: 'var(--accent-primary-dim)' };
  };

  const { label, color, bg } = getStatus();

  const barColor = isVentilating
    ? 'linear-gradient(90deg, #C07B2B 0%, #C0392B 100%)'
    : 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)';

  return (
    <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 36, height: 36 }}>
            <Droplets size={18} />
          </div>
          <div>
            <div className="section-heading">Humidity & Moisture</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 1 }}>
              Real-time moisture monitoring
            </div>
          </div>
        </div>

        <span style={{
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.74rem',
          fontWeight: 600,
          background: bg,
          color,
          border: `1px solid ${color}28`,
        }}>
          {label}
        </span>
      </div>

      {/* 3 metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 14px 12px',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>Current</div>
          <div className="tabular-nums" style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            fontFamily: 'var(--font-display)',
          }}>
            {currentHumidity !== null ? `${currentHumidity}%` : '—'}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 14px 12px',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>Target</div>
          <div className="tabular-nums" style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            lineHeight: 1,
            fontFamily: 'var(--font-display)',
          }}>
            {baseline !== null ? `${baseline}%` : '50%'}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          padding: '14px 14px 12px',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>Exhaust</div>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: isVentilating ? 'var(--color-warning)' : isConnected ? 'var(--color-success)' : 'var(--text-muted)',
            lineHeight: 1,
            marginTop: 6,
          }}>
            {!isConnected ? '—' : isVentilating ? 'Active' : 'Standby'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, currentHumidity ?? 0)}%`,
          background: barColor,
          borderRadius: 4,
          transition: 'width var(--transition-normal)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: '0.66rem', color: 'var(--text-muted)' }}>
        <span>0%</span>
        <span>Comfortable ≤60%</span>
        <span>100%</span>
      </div>

      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
        {isConnected
          ? (isVentilating
            ? 'Exhaust fan is actively extracting moist air to restore comfortable levels.'
            : 'Moisture is within range. Auto ventilation will activate if humidity rises suddenly.')
          : 'Waiting for hardware connection to read humidity sensor.'}
      </div>
    </div>
  );
};
