import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import {
  LayoutDashboard, Wind, Sliders, Droplets, Cpu, History, Settings, Wifi, WifiOff
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',  label: 'Overview',              icon: LayoutDashboard },
  { id: 'comfort',   label: 'Room Comfort',           icon: Wind },
  { id: 'fan',       label: 'Fan Control',            icon: Sliders },
  { id: 'wetzone',   label: 'Humidity & Ventilation', icon: Droplets },
  { id: 'sensors',   label: 'Sensor Status',          icon: Cpu },
  { id: 'history',   label: 'Activity History',       icon: History },
  { id: 'settings',  label: 'Settings',               icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';
  const fanRunning = isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0;
  const ventRunning = isConnected && telemetry.exhaustFanState;

  return (
    <aside
      className="hidden-mobile"
      style={{
        width: 240,
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 12px',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      <div>
        {/* Nav group label */}
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          padding: '0 10px 12px 10px',
        }}>
          Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  padding: '9px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(8, 127, 140, 0.10)' : 'transparent',
                  border: isActive
                    ? '1px solid rgba(8, 127, 140, 0.22)'
                    : '1px solid transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all var(--transition-fast)',
                  width: '100%',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(23, 38, 59, 0.05)';
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
                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    bottom: '20%',
                    width: 3,
                    borderRadius: 999,
                    background: 'var(--accent-primary)',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>

                {/* Fan speed badge */}
                {item.id === 'fan' && fanRunning && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text-on-accent)',
                    background: 'var(--accent-primary)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {telemetry.requestedFanSpeedPercent}%
                  </span>
                )}

                {/* Ventilation active badge */}
                {item.id === 'wetzone' && ventRunning && (
                  <span style={{
                    fontSize: '0.60rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: 'var(--color-warning)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.04em',
                  }}>
                    ON
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Hardware Status Card (bottom of sidebar) ─────────── */}
      <div style={{
        padding: '14px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-1)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isConnected
              ? <Wifi size={14} color="var(--color-success)" />
              : <WifiOff size={14} color="var(--color-error)" />
            }
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ESP32 Device
            </span>
          </div>
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.60rem' }}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 1 }}>Room Temp</div>
            <div className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isConnected && telemetry.comfortTemperatureC !== null
                ? `${telemetry.comfortTemperatureC.toFixed(1)}°C`
                : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 1 }}>Humidity</div>
            <div className="tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isConnected && telemetry.wetZoneHumidityPercent !== null
                ? `${telemetry.wetZoneHumidityPercent}%`
                : '—'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
