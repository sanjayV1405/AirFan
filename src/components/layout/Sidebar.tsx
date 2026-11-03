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
        width: 250,
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: 'calc(100vh - 68px)',
        position: 'sticky',
        top: 68,
        flexShrink: 0,
        zIndex: 20,
        transition: 'all var(--transition-normal)'
      }}
    >
      <div>
        <div style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '0 12px 16px 12px'
        }}>
          Control Center
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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
                  padding: '11px 14px',
                  borderRadius: 12,
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(0, 242, 254, 0.35)'
                    : '1px solid transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.86rem',
                  boxShadow: isActive ? '0 0 20px rgba(0, 242, 254, 0.15)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.05)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#F8FAFC';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>

                {item.id === 'fan' && isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800,
                    color: '#070B14', background: 'var(--accent-primary)',
                    padding: '2px 7px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.4)'
                  }}>
                    {telemetry.requestedFanSpeedPercent}%
                  </span>
                )}

                {item.id === 'wetzone' && isConnected && telemetry.exhaustFanState && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800,
                    color: '#070B14', background: 'var(--accent-amber)',
                    padding: '2px 7px', borderRadius: 999,
                    letterSpacing: '0.04em',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
                  }}>
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hardware Connection Card */}
      <div style={{
        padding: '16px',
        borderRadius: 14,
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {isConnected ? <Wifi size={15} color="var(--color-success)" /> : <WifiOff size={15} color="var(--color-error)" />}
            <span style={{ fontSize: '0.78rem', color: '#F8FAFC', fontWeight: 700 }}>
              Device Node
            </span>
          </div>
          <span style={{
            fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, fontWeight: 800,
            background: isConnected ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
            color: isConnected ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.74rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Room </span>
            <strong className="tabular-nums" style={{ color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
              {isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}°C` : '--'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Humidity </span>
            <strong className="tabular-nums" style={{ color: '#F8FAFC', fontFamily: 'var(--font-mono)' }}>
              {isConnected && telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}%` : '--'}
            </strong>
          </div>
        </div>
      </div>
    </aside>
  );
};
