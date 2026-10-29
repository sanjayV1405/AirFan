import React from 'react';
import { SensorStatus } from '../../types/telemetry';

interface SensorCardProps {
  title: string;
  pin: string;
  value: string | number;
  unit?: string;
  status: SensorStatus | 'OK' | 'FAULT';
  secondaryInfo?: string;
  subMetrics?: { label: string; value: string | number }[];
  icon: React.ReactNode;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  pin,
  value,
  unit,
  status,
  secondaryInfo,
  subMetrics,
  icon
}) => {
  const isHealthy = status === 'OK';
  const isStale = status === 'STALE';

  return (
    <div className="glass-panel" style={{
      padding: '18px',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: 6,
              borderRadius: 8,
              background: 'var(--accent-primary-dim)',
              color: 'var(--accent-primary)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </div>
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {title}
              </h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {pin}
              </span>
            </div>
          </div>

          <span style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            background: isHealthy ? 'var(--color-success-dim)' : isStale ? 'var(--color-warning-dim)' : 'var(--color-error-dim)',
            color: isHealthy ? 'var(--color-success)' : isStale ? 'var(--color-warning)' : 'var(--color-error)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.25)' : isStale ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            {status}
          </span>
        </div>

        <div style={{ margin: '8px 0 10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              {value}
            </span>
            {unit && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                {unit}
              </span>
            )}
          </div>
          {secondaryInfo && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {secondaryInfo}
            </div>
          )}
        </div>
      </div>

      {subMetrics && subMetrics.length > 0 && (
        <div style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: `repeat(${subMetrics.length}, 1fr)`,
          gap: 6,
          fontSize: '0.68rem'
        }}>
          {subMetrics.map((m, idx) => (
            <div key={idx}>
              <div style={{ color: 'var(--text-muted)' }}>{m.label}</div>
              <div className="tabular-nums" style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: 1, fontFamily: 'var(--font-mono)' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
