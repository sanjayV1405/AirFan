import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import {
  LayoutDashboard, Wind, Sliders, Droplets, Cpu, History, Settings, Wifi, WifiOff
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',  label: 'Overview',              icon: LayoutDashboard, description: 'Dashboard summary' },
  { id: 'comfort',   label: 'Room Comfort',           icon: Wind,            description: 'Temperature & presence' },
  { id: 'fan',       label: 'Fan Control',            icon: Sliders,         description: 'Speed & modes' },
  { id: 'wetzone',   label: 'Humidity & Ventilation', icon: Droplets,        description: 'Exhaust & moisture' },
  { id: 'sensors',   label: 'Sensor Status',          icon: Cpu,             description: 'Live hardware readings' },
  { id: 'history',   label: 'Activity History',       icon: History,         description: 'Event timeline' },
  { id: 'settings',  label: 'Settings',               icon: Settings,        description: 'Configuration' },
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
        width: 248,
        background: 'var(--sidebar-bg)',
        borderRight: '1.5px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 10px 20px 10px',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        flexShrink: 0,
        zIndex: 20,
        overflowY: 'auto',
      }}
    >
      {/* ── Navigation ────────────────────────────────────────── */}
      <div>
        <div style={{
          fontSize: '0.63rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '0 12px 10px 12px',
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
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(8,127,140,0.14) 0%, rgba(8,127,140,0.09) 100%)'
                    : 'transparent',
                  border: isActive
                    ? '1.5px solid rgba(8, 127, 140, 0.28)'
                    : '1.5px solid transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all var(--transition-fast)',
                  width: '100%',
                  position: 'relative',
                  boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(29, 48, 46, 0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                  }
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '18%',
                    bottom: '18%',
                    width: 3.5,
                    borderRadius: '0 3px 3px 0',
                    background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-secondary))',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: isActive ? 4 : 0 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'rgba(8, 127, 140, 0.16)' : 'transparent',
                    border: isActive ? '1px solid rgba(8,127,140,0.20)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                </div>

                {/* Fan speed badge */}
                {item.id === 'fan' && fanRunning && (
                  <span style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: 'var(--accent-primary)',
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.02em',
                    boxShadow: '0 1px 4px rgba(8,127,140,0.30)',
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
                    padding: '2px 7px',
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

      {/* ── Hardware Status Card ────────────────────────────────── */}
      <div style={{
        padding: '14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-card)',
        border: '1.5px solid var(--border-card)',
        boxShadow: 'var(--shadow-card)',
        marginTop: 16,
      }}>
        {/* Status header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {isConnected
              ? <Wifi size={14} color="var(--color-success)" />
              : <WifiOff size={14} color="var(--color-error)" />
            }
            <span style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Hardware
            </span>
          </div>
          <span className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.58rem' }}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Live mini-metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 10px',
          }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Temp</div>
            <div className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {isConnected && telemetry.comfortTemperatureC !== null
                ? `${telemetry.comfortTemperatureC.toFixed(1)}°`
                : '—'}
            </div>
          </div>
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            padding: '8px 10px',
          }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Humid</div>
            <div className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
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
