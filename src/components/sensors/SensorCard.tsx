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
      padding: '22px',
      borderRadius: '18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 11,
              background: 'var(--accent-primary-dim)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.15)'
            }}>
              {icon}
            </div>
            <div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
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
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 8,
            background: isHealthy ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
            color: isHealthy ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            boxShadow: isHealthy ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none'
          }}>
            {displayStatus}
          </span>
        </div>

        <div style={{ margin: '12px 0 14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.03em'
            }}>
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {unit}
              </span>
            )}
          </div>
          {description && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
              {description}
            </div>
          )}
        </div>
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: `repeat(${subMetrics.length}, 1fr)`,
          gap: 10,
          fontSize: '0.74rem'
        }}>
          {subMetrics.map((m, idx) => (
            <div key={idx}>
              <div style={{ color: 'var(--text-muted)' }}>{m.label}</div>
              <div className="tabular-nums" style={{ color: '#F8FAFC', fontWeight: 800, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
