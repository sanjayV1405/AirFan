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
  title,
  subtitle,
  value,
  unit,
  status,
  statusText,
  description,
  subMetrics,
  icon
}) => {
  const isHealthy = status === 'OK' || status === 'ONLINE' || status === 'ACTIVE';
  const displayStatus = statusText || (isHealthy ? 'Connected' : 'Offline');

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: 'rgba(8, 145, 178, 0.08)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {title}
              </h4>
              {subtitle && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 6,
            background: isHealthy ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
            color: isHealthy ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${isHealthy ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
          }}>
            {displayStatus}
          </span>
        </div>

        <div style={{ margin: '10px 0 12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {unit}
              </span>
            )}
          </div>
          {description && (
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              {description}
            </div>
          )}
        </div>
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: `repeat(${subMetrics.length}, 1fr)`,
          gap: 8,
          fontSize: '0.72rem'
        }}>
          {subMetrics.map((m, idx) => (
            <div key={idx}>
              <div style={{ color: 'var(--text-muted)' }}>{m.label}</div>
              <div className="tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: 1 }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
