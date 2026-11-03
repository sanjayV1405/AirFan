import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import {
  Thermometer, Droplets, UserCheck, UserX, Wind, Power,
  ArrowRight, Activity, AlertCircle
} from 'lucide-react';

const StatCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  valueColor?: string;
  accentTop?: string;
  delay?: number;
}> = ({ label, value, sub, icon, iconBg, iconColor, iconBorder, valueColor, accentTop, delay = 0 }) => (
  <div
    className="card-enter"
    style={{
      background: 'var(--surface-card)',
      border: '1.5px solid var(--border-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: '18px 18px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      animationDelay: `${delay}s`,
      transition: 'box-shadow var(--transition-normal), border-color var(--transition-fast), transform var(--transition-fast)',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card-hover)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    {/* Top accent stripe */}
    {accentTop && (
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: accentTop,
        borderRadius: '18px 18px 0 0',
      }} />
    )}

    {/* Top row: label + icon */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: accentTop ? 4 : 0 }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>
        {label}
      </span>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 'var(--radius-sm)',
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>

    {/* Value */}
    <div className="tabular-nums" style={{
      fontFamily: 'var(--font-display)',
      fontSize: '2.1rem',
      fontWeight: 800,
      color: valueColor || 'var(--text-primary)',
      lineHeight: 1,
      letterSpacing: '-0.035em',
    }}>
      {value}
    </div>

    {/* Sub label */}
    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 7, fontWeight: 500 }}>
      {sub}
    </div>
  </div>
);

export const OverviewPage: React.FC = () => {
  const { telemetry, connectionState, setActiveNav } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const temp     = isConnected ? telemetry.comfortTemperatureC : null;
  const humidity = isConnected ? telemetry.comfortHumidityPercent : null;
  const isOccupied  = isConnected && telemetry.occupancyDetected;
  const fanRunning  = isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0;
  const ventRunning = isConnected && telemetry.exhaustFanState;

  const getTempLabel = () => {
    if (temp === null) return 'Sensor offline';
    if (temp < 26) return 'Cool';
    if (temp <= 29) return 'Comfortable';
    if (temp <= 32) return 'Warm';
    return 'Hot';
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Offline Banner ──────────────────────────────────────── */}
      {!isConnected && (
        <div style={{
          background: 'rgba(184, 50, 50, 0.07)',
          border: '1.5px solid rgba(184, 50, 50, 0.22)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <AlertCircle size={19} color="var(--color-error)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Hardware Disconnected
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Live sensors and fan controls will activate when your ESP32 connects.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('settings')}
            style={{
              background: 'rgba(184, 50, 50, 0.10)',
              border: '1.5px solid rgba(184, 50, 50, 0.28)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Configure Device
          </button>
        </div>
      )}

      {/* ── 5 Status Cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14 }}>

        <StatCard
          label="Temperature"
          value={temp !== null ? `${temp.toFixed(1)}°` : '—'}
          sub={getTempLabel()}
          icon={<Thermometer size={16} />}
          iconBg="var(--accent-primary-dim)"
          iconColor="var(--accent-primary)"
          iconBorder="rgba(8,127,140,0.22)"
          accentTop="linear-gradient(90deg, var(--accent-primary), #0AABB8)"
          delay={0.04}
        />

        <StatCard
          label="Humidity"
          value={humidity !== null ? `${humidity}%` : '—'}
          sub={humidity !== null ? (humidity <= 60 ? 'Optimal level' : 'Elevated moisture') : 'Sensor offline'}
          icon={<Droplets size={16} />}
          iconBg="var(--accent-secondary-bg)"
          iconColor="var(--accent-secondary)"
          iconBorder="rgba(57,122,101,0.22)"
          accentTop="linear-gradient(90deg, var(--accent-secondary), #5AAA8A)"
          delay={0.09}
        />

        <StatCard
          label="Occupancy"
          value={!isConnected ? '—' : isOccupied ? 'Present' : 'Vacant'}
          sub={isConnected ? (isOccupied ? 'Motion detected' : 'Room is empty') : 'Sensor offline'}
          icon={isOccupied ? <UserCheck size={16} /> : <UserX size={16} />}
          iconBg={!isConnected ? 'var(--bg-tertiary)' : isOccupied ? 'var(--color-success-bg)' : 'var(--bg-tertiary)'}
          iconColor={!isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--text-muted)'}
          iconBorder={isOccupied ? 'rgba(27,138,90,0.22)' : 'var(--border-medium)'}
          valueColor={!isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : undefined}
          accentTop={isOccupied ? 'linear-gradient(90deg, var(--color-success), #5ACA9A)' : undefined}
          delay={0.14}
        />

        <StatCard
          label="Ceiling Fan"
          value={!isConnected ? '—' : fanRunning ? `${telemetry.requestedFanSpeedPercent}%` : 'Off'}
          sub={isConnected ? (telemetry.activeMode === 'auto' ? 'Auto mode active' : 'Manual control') : 'Hardware offline'}
          icon={<Wind size={16} />}
          iconBg={fanRunning ? 'var(--accent-primary-dim)' : 'var(--bg-tertiary)'}
          iconColor={fanRunning ? 'var(--accent-primary)' : 'var(--text-muted)'}
          iconBorder={fanRunning ? 'rgba(8,127,140,0.22)' : 'var(--border-medium)'}
          valueColor={fanRunning ? 'var(--accent-primary)' : undefined}
          accentTop={fanRunning ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' : undefined}
          delay={0.19}
        />

        <StatCard
          label="Ventilation"
          value={!isConnected ? '—' : ventRunning ? 'Active' : 'Off'}
          sub={isConnected ? (ventRunning ? 'Extracting moisture' : 'Standby') : 'Hardware offline'}
          icon={<Power size={16} />}
          iconBg={ventRunning ? 'var(--color-warning-bg)' : 'var(--bg-tertiary)'}
          iconColor={ventRunning ? 'var(--color-warning)' : 'var(--text-muted)'}
          iconBorder={ventRunning ? 'rgba(181,112,10,0.22)' : 'var(--border-medium)'}
          valueColor={ventRunning ? 'var(--color-warning)' : undefined}
          accentTop={ventRunning ? 'linear-gradient(90deg, var(--color-warning), #D4A050)' : undefined}
          delay={0.24}
        />
      </div>

      {/* ── Mode Selector ───────────────────────────────────────── */}
      <ModeSelector />

      {/* ── Fan Visualization + Speed Controls ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="card-solid" style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8,127,140,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            marginBottom: 18,
            position: 'relative',
          }}>
            Room Ceiling Fan
          </div>
          <FanVisualization size={230} showLabels={true} />
        </div>

        <SpeedDial />
      </div>

      {/* ── Comfort Range + Exhaust Fan ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <TemperatureBandsBar />
        <ExhaustFanControl />
      </div>

      {/* ── Live Telemetry Chart ─────────────────────────────────── */}
      <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div className="icon-container icon-container-teal" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)' }}>
              <Activity size={17} />
            </div>
            <div>
              <div className="section-heading">Live Temperature</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Real-time stream from ESP32 sensor
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-card)',
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 14px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-xs)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-card)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-xs)';
            }}
          >
            <span>Full History</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <TelemetryChart type="temperature" height={210} />
      </div>
    </div>
  );
};
