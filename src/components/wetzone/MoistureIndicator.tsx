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
    if (!isConnected || currentHumidity === null) return { label: 'Sensor Offline', color: 'var(--text-muted)', bg: 'var(--bg-secondary)', border: 'var(--border-card)' };
    if (isVentilating) return { label: 'Ventilating', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'rgba(181, 112, 10, 0.25)' };
    if (currentHumidity > 70) return { label: 'High Moisture', color: 'var(--color-error)', bg: 'var(--color-error-bg)', border: 'rgba(184, 50, 50, 0.25)' };
    if (currentHumidity > 55) return { label: 'Optimal', color: 'var(--color-success)', bg: 'var(--color-success-bg)', border: 'rgba(27, 138, 90, 0.25)' };
    return { label: 'Comfortable', color: 'var(--accent-primary)', bg: 'var(--accent-primary-dim)', border: 'rgba(8, 127, 140, 0.25)' };
  };

  const { label, color, bg, border } = getStatus();

  const barColor = isVentilating
    ? 'linear-gradient(90deg, #B5700A 0%, #B83232 100%)'
    : 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)';

  return (
    <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)' }}>
            <Droplets size={18} />
          </div>
          <div>
            <div className="section-heading">Humidity &amp; Moisture</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Real-time atmospheric moisture monitoring
            </div>
          </div>
        </div>

        <span style={{
          padding: '5px 13px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.74rem',
          fontWeight: 700,
          background: bg,
          color,
          border: `1.5px solid ${border}`,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {label}
        </span>
      </div>

      {/* 3 metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        <div style={{
          background: 'var(--surface-2)',
          border: '1.5px solid var(--border-subtle)',
          padding: '14px 14px 12px',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Current
          </div>
          <div className="tabular-nums" style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1,
            fontFamily: 'var(--font-display)',
          }}>
            {currentHumidity !== null ? `${currentHumidity}%` : '—'}
          </div>
        </div>

        <div style={{
          background: 'var(--surface-2)',
          border: '1.5px solid var(--border-subtle)',
          padding: '14px 14px 12px',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Target
          </div>
          <div className="tabular-nums" style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            lineHeight: 1,
            fontFamily: 'var(--font-display)',
          }}>
            {baseline !== null ? `${baseline}%` : '50%'}
          </div>
        </div>

        <div style={{
          background: 'var(--surface-2)',
          border: '1.5px solid var(--border-subtle)',
          padding: '14px 14px 12px',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Exhaust
          </div>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: isVentilating ? 'var(--color-warning)' : isConnected ? 'var(--color-success)' : 'var(--text-muted)',
            lineHeight: 1,
            marginTop: 6,
            fontFamily: 'var(--font-display)',
          }}>
            {!isConnected ? '—' : isVentilating ? 'Active' : 'Standby'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        background: 'var(--surface-3)',
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, currentHumidity ?? 0)}%`,
          background: barColor,
          borderRadius: 5,
          transition: 'width var(--transition-normal)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        <span>0%</span>
        <span>Optimal range ≤ 60%</span>
        <span>100%</span>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 14, lineHeight: 1.5 }}>
        {isConnected
          ? (isVentilating
            ? 'Exhaust fan is actively extracting moisture to restore optimal balance.'
            : 'Moisture level is within target range. Automatic ventilation will trigger if moisture spikes.')
          : 'Waiting for hardware connection to read humidity sensor.'}
      </div>
    </div>
  );
};
