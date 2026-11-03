import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Thermometer, Droplets, UserCheck, UserX, Wind, Power, ArrowRight, Activity, AlertCircle } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { telemetry, connectionState, setActiveNav } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const temp = isConnected ? telemetry.comfortTemperatureC : null;
  const humidity = isConnected ? telemetry.comfortHumidityPercent : null;
  const isOccupied = isConnected && telemetry.occupancyDetected;
  const fanRunning = isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0;
  const ventRunning = isConnected && telemetry.exhaustFanState;

  const getTempLabel = () => {
    if (temp === null) return 'Sensor offline';
    if (temp < 26) return 'Cool';
    if (temp <= 29) return 'Comfortable';
    if (temp <= 32) return 'Warm';
    return 'Hot';
  };

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Offline Banner ─────────────────────────────────────── */}
      {!isConnected && (
        <div style={{
          background: 'rgba(192, 57, 43, 0.07)',
          border: '1px solid rgba(192, 57, 43, 0.22)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="var(--color-error)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Hardware Disconnected
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Live sensors and fan controls will activate automatically when your ESP32 connects.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('settings')}
            style={{
              background: 'rgba(192, 57, 43, 0.10)',
              border: '1px solid rgba(192, 57, 43, 0.28)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 16px',
              fontSize: '0.80rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Configure Device IP
          </button>
        </div>
      )}

      {/* ── 5 Status Cards ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>

        {/* Room Temperature */}
        <div className="card-solid card-enter" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Temperature
            </span>
            <div className="icon-container icon-container-blue" style={{ width: 30, height: 30 }}>
              <Thermometer size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {temp !== null ? `${temp.toFixed(1)}°` : '—'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>{getTempLabel()}</div>
        </div>

        {/* Humidity */}
        <div className="card-solid card-enter" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Humidity
            </span>
            <div className="icon-container icon-container-teal" style={{ width: 30, height: 30 }}>
              <Droplets size={15} />
            </div>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {humidity !== null ? `${humidity}%` : '—'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {humidity !== null ? (humidity <= 60 ? 'Optimal' : 'Elevated moisture') : 'Sensor offline'}
          </div>
        </div>

        {/* Occupancy */}
        <div className="card-solid card-enter" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Occupancy
            </span>
            <div className={`icon-container ${isOccupied ? 'icon-container-success' : 'icon-container-neutral'}`} style={{ width: 30, height: 30 }}>
              {isOccupied ? <UserCheck size={15} /> : <UserX size={15} />}
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            {!isConnected ? '—' : isOccupied ? 'Occupied' : 'Vacant'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {isConnected ? (isOccupied ? 'Motion detected' : 'Room is empty') : 'Sensor offline'}
          </div>
        </div>

        {/* Ceiling Fan */}
        <div className="card-solid card-enter" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ceiling Fan
            </span>
            <div className={`icon-container ${fanRunning ? 'icon-container-teal' : 'icon-container-neutral'}`} style={{ width: 30, height: 30 }}>
              <Wind size={15} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: fanRunning ? 'var(--accent-primary)' : 'var(--text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            {!isConnected ? '—' : fanRunning ? `${telemetry.requestedFanSpeedPercent}%` : 'Stopped'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {isConnected ? (telemetry.activeMode === 'auto' ? 'Auto mode' : 'Manual') : 'Hardware offline'}
          </div>
        </div>

        {/* Exhaust Fan */}
        <div className="card-solid card-enter" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ventilation
            </span>
            <div className={`icon-container ${ventRunning ? 'icon-container-warning' : 'icon-container-neutral'}`} style={{ width: 30, height: 30 }}>
              <Power size={15} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: ventRunning ? 'var(--color-warning)' : 'var(--text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}>
            {!isConnected ? '—' : ventRunning ? 'Active' : 'Standby'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {isConnected ? (ventRunning ? 'Extracting moisture' : 'Balanced') : 'Hardware offline'}
          </div>
        </div>
      </div>

      {/* ── Mode Selector ───────────────────────────────────────── */}
      <ModeSelector />

      {/* ── Fan Visualization + Speed Controls ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card-solid" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
            Room Ceiling Fan
          </div>
          <FanVisualization size={230} showLabels={true} />
        </div>

        <SpeedDial />
      </div>

      {/* ── Comfort Range + Exhaust Fan ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <TemperatureBandsBar />
        <ExhaustFanControl />
      </div>

      {/* ── Live Telemetry Chart ────────────────────────────────── */}
      <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="icon-container icon-container-teal" style={{ width: 34, height: 34 }}>
              <Activity size={16} />
            </div>
            <div>
              <div className="section-heading">Live Temperature</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                Real-time stream from ESP32 sensor
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('history')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 13px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span>History</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <TelemetryChart type="temperature" height={210} />
      </div>
    </div>
  );
};
