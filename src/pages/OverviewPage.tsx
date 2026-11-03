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
  ArrowRight, Activity, AlertCircle, Radio, Clock
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
  accentColor: string;
  delay?: number;
}> = ({ label, value, sub, icon, iconBg, iconColor, iconBorder, valueColor, accentColor, delay = 0 }) => (
  <div
    className="card-enter"
    style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border-card)',
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
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)';
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    {/* Top accent stripe */}
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 3,
      background: accentColor,
      borderRadius: '18px 18px 0 0',
    }} />

    {/* Top row: label + icon */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 6 }}>
      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
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
      fontSize: '2.2rem',
      fontWeight: 800,
      color: valueColor || 'var(--text-primary)',
      lineHeight: 1,
      letterSpacing: '-0.035em',
    }}>
      {value}
    </div>

    {/* Sub label */}
    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>
      {sub}
    </div>
  </div>
);

export const OverviewPage: React.FC = () => {
  const { telemetry, connectionState, connectionError, config, isStale, connect, setActiveNav } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const temp     = isConnected ? telemetry.comfortTemperatureC : null;
  const humidity = isConnected ? telemetry.comfortHumidityPercent : null;
  const isOccupied  = isConnected && telemetry.occupancyDetected;
  const fanPwm      = isConnected ? (telemetry.hardwarePwmPercent ?? telemetry.requestedFanSpeedPercent) : 0;
  const fanRunning  = isConnected && telemetry.fanRunningState === 'RUNNING' && fanPwm > 0;
  const ventRunning = isConnected && telemetry.exhaustFanState;

  const getTempLabel = () => {
    if (temp === null) return 'Hardware offline';
    if (temp < 26) return 'Cool environment';
    if (temp <= 29) return 'Optimal comfort';
    if (temp <= 32) return 'Warm environment';
    return 'Hot environment';
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Offline Banner ──────────────────────────────────────── */}
      {!isConnected && (
        <div style={{
          background: 'rgba(248, 113, 113, 0.08)',
          border: '1px solid rgba(248, 113, 113, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={22} color="var(--color-error)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                Hardware Offline
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {connectionError || `ESP32 is unreachable at ${config.esp32BaseUrl}/api/status. Verify device is connected to Wi-Fi.`}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={connect}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                fontSize: '0.84rem',
              }}
            >
              <Radio size={14} />
              <span>Connect ESP32</span>
            </button>
            <button
              onClick={() => setActiveNav('settings')}
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.84rem',
              }}
            >
              Configure IP
            </button>
          </div>
        </div>
      )}

      {/* ── Stale Data Alert ────────────────────────────────────── */}
      {isConnected && isStale && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <Clock size={16} color="var(--color-warning)" />
          <div style={{ fontSize: '0.80rem', color: 'var(--color-warning)', fontWeight: 600 }}>
            Telemetry stream delayed — no fresh response received in the last 6 seconds from {config.esp32BaseUrl}.
          </div>
        </div>
      )}

      {/* ── 5 Status Cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14 }}>

        <StatCard
          label="Room Temperature"
          value={temp !== null ? `${temp.toFixed(1)}°` : '—'}
          sub={getTempLabel()}
          icon={<Thermometer size={16} />}
          iconBg="var(--accent-primary-dim)"
          iconColor="var(--accent-primary)"
          iconBorder="rgba(53, 214, 194, 0.25)"
          valueColor={temp !== null ? 'var(--text-primary)' : undefined}
          accentColor="linear-gradient(90deg, #35D6C2, #2BB8A6)"
          delay={0.04}
        />

        <StatCard
          label="Humidity Level"
          value={humidity !== null ? `${humidity}%` : '—'}
          sub={humidity !== null ? (humidity <= 60 ? 'Optimal comfort' : 'Elevated moisture') : 'Hardware offline'}
          icon={<Droplets size={16} />}
          iconBg="var(--accent-secondary-bg)"
          iconColor="var(--accent-secondary)"
          iconBorder="rgba(98, 168, 255, 0.25)"
          valueColor={humidity !== null ? 'var(--text-primary)' : undefined}
          accentColor="linear-gradient(90deg, #62A8FF, #3B82F6)"
          delay={0.09}
        />

        <StatCard
          label="Room Occupancy"
          value={!isConnected ? '—' : isOccupied ? 'Occupied' : 'Vacant'}
          sub={isConnected ? (isOccupied ? 'Motion detected' : 'Room is vacant') : 'Hardware offline'}
          icon={isOccupied ? <UserCheck size={16} /> : <UserX size={16} />}
          iconBg={!isConnected ? 'var(--surface-2)' : isOccupied ? 'var(--color-success-bg)' : 'var(--color-warning-bg)'}
          iconColor={!isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--color-warning)'}
          iconBorder={isOccupied ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 191, 36, 0.25)'}
          valueColor={!isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--color-warning)'}
          accentColor="linear-gradient(90deg, #FBBF24, #F59E0B)"
          delay={0.14}
        />

        <StatCard
          label="Ceiling Fan"
          value={!isConnected ? '—' : fanRunning ? `${fanPwm}%` : 'Off'}
          sub={isConnected ? (fanRunning ? `PWM: ${fanPwm}% · Active` : 'Standby / Stopped') : 'Hardware offline'}
          icon={<Wind size={16} />}
          iconBg={fanRunning ? 'var(--accent-primary-dim)' : 'var(--surface-2)'}
          iconColor={fanRunning ? 'var(--accent-primary)' : 'var(--text-muted)'}
          iconBorder={fanRunning ? 'rgba(53, 214, 194, 0.25)' : 'var(--border-medium)'}
          valueColor={fanRunning ? 'var(--accent-primary)' : undefined}
          accentColor="linear-gradient(90deg, #35D6C2, #2BB8A6)"
          delay={0.19}
        />

        <StatCard
          label="Ventilation Fan"
          value={!isConnected ? '—' : ventRunning ? 'Active' : 'Off'}
          sub={isConnected ? (ventRunning ? 'Extracting moisture' : 'Standby') : 'Hardware offline'}
          icon={<Power size={16} />}
          iconBg={ventRunning ? 'var(--accent-secondary-bg)' : 'var(--surface-2)'}
          iconColor={ventRunning ? 'var(--accent-secondary)' : 'var(--text-muted)'}
          iconBorder={ventRunning ? 'rgba(98, 168, 255, 0.25)' : 'var(--border-medium)'}
          valueColor={ventRunning ? 'var(--accent-secondary)' : undefined}
          accentColor="linear-gradient(90deg, #62A8FF, #3B82F6)"
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
            background: 'radial-gradient(circle, rgba(53, 214, 194, 0.08) 0%, transparent 70%)',
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
            Ceiling Fan PWM Visualization
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
              <div className="section-heading">Live Temperature Telemetry</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Real-time HTTP polling stream from ESP32 DHT sensor ({config.esp32BaseUrl}/api/status)
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--surface-2)',
              border: '1px solid var(--border-medium)',
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
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-3)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
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
