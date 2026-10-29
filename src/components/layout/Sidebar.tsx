import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import {
  LayoutDashboard,
  Wind,
  Droplets,
  Cpu,
  History,
  Settings
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',  label: 'Overview',         icon: LayoutDashboard },
  { id: 'comfort',   label: 'Comfort Zone',      icon: Wind },
  { id: 'wetzone',   label: 'Wet Zone',          icon: Droplets },
  { id: 'sensors',   label: 'Live Sensors',      icon: Cpu },
  { id: 'history',   label: 'History',           icon: History },
  { id: 'settings',  label: 'Settings',          icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, telemetry, connectionState } = useAirLoop();

  return (
    <aside
      className="hidden-mobile"
      style={{
        width: 220,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 12px',
        height: 'calc(100vh - 60px)',
        position: 'sticky',
        top: 60,
        flexShrink: 0,
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
      }}
    >
      <div>
        <div style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '0 10px 12px 10px'
        }}>
          Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: isActive
                    ? 'var(--accent-primary-dim)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid var(--border-accent)'
                    : '1px solid transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.82rem',
                  boxShadow: isActive ? '0 0 12px var(--accent-primary-dim)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>

                {item.id === 'comfort' && telemetry.fanRunningState === 'RUNNING' && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700,
                    color: 'var(--accent-primary)', background: 'var(--accent-primary-dim)',
                    padding: '1px 6px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {telemetry.requestedFanSpeedPercent}%
                  </span>
                )}

                {item.id === 'wetzone' && telemetry.exhaustFanState && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700,
                    color: 'var(--accent-amber)', background: 'var(--accent-amber-dim)',
                    padding: '1px 6px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ON
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Device status card */}
      <div style={{
        padding: '12px',
        borderRadius: 10,
        background: 'var(--sidebar-card-bg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            ESP32 Node
          </span>
          <span style={{
            fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, fontWeight: 600,
            background: connectionState === 'demo'
              ? 'var(--accent-amber-dim)'
              : 'var(--color-success-dim)',
            color: connectionState === 'demo' ? 'var(--accent-amber)' : 'var(--color-success)'
          }}>
            {telemetry.firmwareVersion || 'v1.2.0'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.7rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Temp </span>
            <strong className="tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC}°C` : '--'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>RH </span>
            <strong className="tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}%` : '--'}
            </strong>
          </div>
        </div>
      </div>
    </aside>
  );
};
