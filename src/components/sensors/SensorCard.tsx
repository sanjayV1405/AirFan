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
  accentColor?: string;
  accentBg?: string;
  accentBorder?: string;
}

const statusConfig = {
  ONLINE:       { label: 'Online',      cls: 'badge-success',  iconCls: 'icon-container-success', dot: 'var(--color-success)' },
  ACTIVE:       { label: 'Active',      cls: 'badge-teal',     iconCls: 'icon-container-teal',    dot: 'var(--accent-primary)' },
  OK:           { label: 'OK',          cls: 'badge-success',  iconCls: 'icon-container-success', dot: 'var(--color-success)' },
  STANDBY:      { label: 'Standby',     cls: 'badge-neutral',  iconCls: 'icon-container-neutral', dot: 'var(--text-muted)' },
  OFFLINE:      { label: 'Offline',     cls: 'badge-error',    iconCls: 'icon-container-error',   dot: 'var(--color-error)' },
  DISCONNECTED: { label: 'Disconnected',cls: 'badge-error',    iconCls: 'icon-container-error',   dot: 'var(--color-error)' },
} as const;

export const SensorCard: React.FC<SensorCardProps> = ({
  title, subtitle, value, unit, status, statusText, description, subMetrics, icon,
}) => {
  const cfg = statusConfig[status];
  const isHealthy = status === 'OK' || status === 'ONLINE' || status === 'ACTIVE';
  const displayStatus = statusText || cfg.label;

  return (
    <div
      className="card-solid card-enter"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top accent stripe for healthy sensors */}
      {isHealthy && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: status === 'ACTIVE'
            ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
            : 'linear-gradient(90deg, var(--color-success), var(--accent-secondary))',
          borderRadius: '18px 18px 0 0',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, marginTop: isHealthy ? 6 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon container */}
          <div
            className={`icon-container ${cfg.iconCls}`}
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)' }}
          >
            {icon}
          </div>
          <div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              fontFamily: 'var(--font-display)',
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: cfg.dot,
              boxShadow: isHealthy ? `0 0 0 2px rgba(0,0,0,0.04)` : 'none',
              animation: isHealthy && status === 'ACTIVE' ? 'live-pulse 2.2s infinite ease-in-out' : 'none',
            }} />
            <span className={`badge ${cfg.cls}`} style={{ fontSize: '0.68rem' }}>
              {displayStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Value + description */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        marginBottom: subMetrics && subMetrics.length > 0 ? 12 : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: description ? 8 : 0 }}>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: isHealthy ? 'var(--text-primary)' : 'var(--text-muted)',
              lineHeight: 1,
              letterSpacing: '-0.035em',
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
            }}>
              {unit}
            </span>
          )}
        </div>
        {description && (
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            fontWeight: 400,
          }}>
            {description}
          </div>
        )}
      </div>

      {/* Sub-metrics row */}
      {subMetrics && subMetrics.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${subMetrics.length}, 1fr)`,
          gap: 8,
        }}>
          {subMetrics.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
              }}
            >
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m.label}
              </div>
              <div className="tabular-nums" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
