import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import {
  LayoutDashboard,
  Wind,
  Sliders,
  Droplets,
  Cpu,
  History,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',  label: 'Overview',                icon: LayoutDashboard },
  { id: 'comfort',   label: 'Room Comfort',            icon: Wind },
  { id: 'fan',       label: 'Fan Control',             icon: Sliders },
  { id: 'wetzone',   label: 'Humidity & Ventilation',  icon: Droplets },
  { id: 'sensors',   label: 'Sensor Status',           icon: Cpu },
  { id: 'history',   label: 'Activity History',        icon: History },
  { id: 'settings',  label: 'Settings',                icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, telemetry, connectionState } = useAirLoop();

  const isConnected = connectionState === 'connected';

  return (
    <aside
      className="hidden-mobile"
      style={{
        width: 240,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 14px',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        flexShrink: 0,
        zIndex: 20,
        transition: 'all var(--transition-normal)'
      }}
    >
      <div>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0 12px 14px 12px'
        }}>
          Control Center
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: isActive
                    ? 'rgba(8, 145, 178, 0.09)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(8, 145, 178, 0.25)'
                    : '1px solid transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.86rem',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Icon size={17} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>

                {item.id === 'fan' && isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700,
                    color: 'var(--accent-primary)', background: 'var(--accent-primary-dim)',
                    padding: '2px 7px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {telemetry.requestedFanSpeedPercent}%
                  </span>
                )}

                {item.id === 'wetzone' && isConnected && telemetry.exhaustFanState && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    color: '#FFFFFF', background: 'var(--accent-secondary)',
                    padding: '2px 6px', borderRadius: 999,
                    letterSpacing: '0.04em'
                  }}>
                    ON
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hardware Connection Card */}
      <div style={{
        padding: '14px',
        borderRadius: 12,
        background: 'var(--sidebar-card-bg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isConnected ? <Wifi size={14} color="var(--color-success)" /> : <WifiOff size={14} color="var(--color-error)" />}
            <span style={{ fontSize: '0.74rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Device Status
            </span>
          </div>
          <span style={{
            fontSize: '0.65rem', padding: '2px 7px', borderRadius: 999, fontWeight: 600,
            background: isConnected ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
            color: isConnected ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${isConnected ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
          }}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.72rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Room </span>
            <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}°C` : '--'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Humidity </span>
            <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {isConnected && telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}%` : '--'}
            </strong>
          </div>
        </div>
      </div>
    </aside>
  );
};
