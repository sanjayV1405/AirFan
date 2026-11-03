import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { 
  Thermometer, 
  Droplets, 
  UserCheck, 
  UserX, 
  Wind, 
  Power, 
  ArrowRight, 
  Activity, 
  AlertCircle
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { telemetry, connectionState, setActiveNav } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const temp = isConnected ? telemetry.comfortTemperatureC : null;
  const humidity = isConnected ? telemetry.comfortHumidityPercent : null;
  const isOccupied = isConnected ? telemetry.occupancyDetected : false;
  const fanRunning = isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0;
  const ventilationRunning = isConnected && telemetry.exhaustFanState;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1440, margin: '0 auto' }}>
      
      {/* Offline Hardware Banner */}
      {!isConnected && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={22} color="#EF4444" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#F8FAFC' }}>
                Hardware Disconnected
              </div>
              <div style={{ fontSize: '0.78rem', color: '#FCA5A5', marginTop: 2 }}>
                Live sensors and fan controls will activate automatically when your ESP32 device connects.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('settings')}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#F8FAFC',
              borderRadius: 10,
              padding: '8px 18px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Configure Device IP
          </button>
        </div>
      )}

      {/* 5 Distinct Primary Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16
      }}>
        {/* 1. Room Temperature */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Room Temperature
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#38BDF8'
            }}>
              <Thermometer size={17} />
            </div>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#F8FAFC',
            lineHeight: 1,
            letterSpacing: '-0.03em'
          }}>
            {temp !== null ? `${temp.toFixed(1)}°C` : '--.-'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {temp !== null ? (temp < 26 ? 'Cool environment' : temp <= 29 ? 'Comfortable climate' : 'Warm room') : 'Sensor offline'}
          </div>
        </div>

        {/* 2. Humidity Level */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Humidity Level
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(0, 242, 254, 0.14)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Droplets size={17} />
            </div>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#F8FAFC',
            lineHeight: 1,
            letterSpacing: '-0.03em'
          }}>
            {humidity !== null ? `${humidity}%` : '--%'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {humidity !== null ? (humidity <= 60 ? 'Optimal moisture' : 'Elevated moisture') : 'Sensor offline'}
          </div>
        </div>

        {/* 3. Room Occupancy */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Room Occupancy
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: isOccupied ? 'rgba(16, 185, 129, 0.14)' : 'var(--surface-3)',
              border: `1px solid ${isOccupied ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)'
            }}>
              {isOccupied ? <UserCheck size={17} /> : <UserX size={17} />}
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : '#F8FAFC',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            {!isConnected ? 'Offline' : isOccupied ? 'Occupied' : 'Vacant'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isConnected ? (isOccupied ? 'Presence detected' : 'Room is empty') : 'Sensor offline'}
          </div>
        </div>

        {/* 4. Ceiling Fan Status */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Ceiling Fan
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: fanRunning ? 'var(--accent-primary-dim)' : 'var(--surface-3)',
              border: `1px solid ${fanRunning ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: fanRunning ? 'var(--accent-primary)' : 'var(--text-muted)'
            }}>
              <Wind size={17} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: fanRunning ? 'var(--accent-primary)' : '#F8FAFC',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            {!isConnected ? 'Offline' : fanRunning ? `${telemetry.requestedFanSpeedPercent}% Speed` : 'Stopped'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isConnected ? (telemetry.activeMode === 'auto' ? 'Auto modulation' : 'Manual setpoint') : 'Hardware offline'}
          </div>
        </div>

        {/* 5. Ventilation Status */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Ventilation Fan
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: ventilationRunning ? 'var(--accent-amber-dim)' : 'var(--surface-3)',
              border: `1px solid ${ventilationRunning ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-subtle)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: ventilationRunning ? 'var(--accent-amber)' : 'var(--text-muted)'
            }}>
              <Power size={17} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: ventilationRunning ? 'var(--accent-amber)' : '#F8FAFC',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            {!isConnected ? 'Offline' : ventilationRunning ? 'Extracting' : 'Standby'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isConnected ? (ventilationRunning ? 'Clearing steam' : 'Moisture balanced') : 'Hardware offline'}
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <ModeSelector />

      {/* Ceiling Room Fan Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 18
      }}>
        {/* Realistic Ceiling Fan Model */}
        <div className="glass-panel" style={{
          padding: '26px',
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 330
        }}>
          <FanVisualization size={250} showLabels={true} />
        </div>

        {/* Ceiling Fan Speed Dial */}
        <SpeedDial />
      </div>

      {/* Temperature Response Spectrum & Exhaust Fan Control */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 18
      }}>
        <TemperatureBandsBar />
        <ExhaustFanControl />
      </div>

      {/* Real-Time Telemetry Stream Chart */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent-primary-dim)',
              border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Live Temperature Telemetry
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Real-time streaming points from ESP32 DHT11 sensor
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveNav('history')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-primary)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer'
            }}
          >
            <span>Activity History</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <TelemetryChart type="temperature" height={220} />
      </div>
    </div>
  );
};
