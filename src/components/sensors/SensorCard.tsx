import React from 'react';

interface SensorCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  unit?: string;
  status: 'ONLINE' | 'OFFLINE' | 'ACTIVE' | 'STANDBY' | 'OK' | 'DISCONNECTED';
  statusText?: string;
  description?: string;
  subMetrics?: { label: string; value: string | number }[];
  icon: React.ReactNode;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title, subtitle, value, unit, status, statusText, description, subMetrics, icon,
}) => {
  const isHealthy = status === 'OK' || status === 'ONLINE' || status === 'ACTIVE';
  const displayStatus = statusText || (isHealthy ? 'Online' : 'Offline');

  return (
    <div className="card-solid" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className={`icon-container ${isHealthy ? 'icon-container-teal' : 'icon-container-neutral'}`}
              style={{ width: 38, height: 38 }}
            >
              {icon}
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</div>
              {subtitle && (
                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
              )}
            </div>
          </div>

          <span className={`badge ${isHealthy ? 'badge-success' : 'badge-error'}`} style={{ flexShrink: 0, marginTop: 2 }}>
            {displayStatus}
          </span>
        </div>

        {/* Value */}
        <div style={{ margin: '10px 0 12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.1rem',
              fontWeight: 700,
              color: isHealthy ? 'var(--text-primary)' : 'var(--text-muted)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>
            )}
          </div>
          {description && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
              {description}
            </div>
          )}
        </div>
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div style={{
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: `repeat(${subMetrics.length}, 1fr)`,
          gap: 8,
          fontSize: '0.74rem',
        }}>
          {subMetrics.map((m, i) => (
            <div key={i}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
              <div className="tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
