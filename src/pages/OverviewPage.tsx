import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* Disconnected Notice Banner if hardware is not reachable */}
      {!isConnected && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={20} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#991B1B' }}>
                Hardware Connection Required
              </div>
              <div style={{ fontSize: '0.78rem', color: '#B91C1C', marginTop: 1 }}>
                Live sensor values and fan controls will become active once your ESP32 device connects.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('settings')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Configure Device IP
          </button>
        </div>
      )}

      {/* 5 Primary Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 14
      }}>
        {/* 1. Room Temperature */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Room Temperature
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(8, 145, 178, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Thermometer size={16} />
            </div>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.1rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1
          }}>
            {temp !== null ? `${temp.toFixed(1)}°C` : '--.-'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {temp !== null ? (temp < 26 ? 'Cool environment' : temp <= 29 ? 'Comfortable temperature' : 'Warm room') : 'Sensor offline'}
          </div>
        </div>

        {/* 2. Humidity Level */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Humidity Level
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(37, 99, 235, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-secondary)'
            }}>
              <Droplets size={16} />
            </div>
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.1rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1
          }}>
            {humidity !== null ? `${humidity}%` : '--%'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {humidity !== null ? (humidity <= 60 ? 'Optimal room moisture' : 'Elevated moisture') : 'Sensor offline'}
          </div>
        </div>

        {/* 3. Room Occupancy */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Room Occupancy
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: isOccupied ? 'rgba(5, 150, 105, 0.08)' : 'var(--surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)'
            }}>
              {isOccupied ? <UserCheck size={16} /> : <UserX size={16} />}
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--text-secondary)',
            lineHeight: 1.2
          }}>
            {!isConnected ? 'Unavailable' : isOccupied ? 'Occupied' : 'Vacant'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isConnected ? (isOccupied ? 'Presence detected' : 'Room is empty') : 'Sensor offline'}
          </div>
        </div>

        {/* 4. Room Fan Status */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Room Fan
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: fanRunning ? 'rgba(8, 145, 178, 0.08)' : 'var(--surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: fanRunning ? 'var(--accent-primary)' : 'var(--text-muted)'
            }}>
              <Wind size={16} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: fanRunning ? 'var(--accent-primary)' : 'var(--text-primary)',
            lineHeight: 1.2
          }}>
            {!isConnected ? 'Offline' : fanRunning ? `${telemetry.requestedFanSpeedPercent}% Speed` : 'Off'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isConnected ? (telemetry.activeMode === 'auto' ? 'Auto regulation' : 'Manual speed') : 'Hardware offline'}
          </div>
        </div>

        {/* 5. Ventilation Status */}
        <div className="glass-panel" style={{ padding: '18px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Ventilation
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: ventilationRunning ? 'var(--accent-amber-dim)' : 'var(--surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: ventilationRunning ? 'var(--accent-amber)' : 'var(--text-muted)'
            }}>
              <Power size={16} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: ventilationRunning ? 'var(--accent-amber)' : 'var(--text-secondary)',
            lineHeight: 1.2
          }}>
            {!isConnected ? 'Offline' : ventilationRunning ? 'Active' : 'Standby'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isConnected ? (ventilationRunning ? 'Exhausting moisture' : 'Moisture within range') : 'Hardware offline'}
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <ModeSelector />

      {/* Main Fan & Climate Controls Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16
      }}>
        {/* Realistic 3D-Style Fan Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320
        }}>
          <FanVisualization size={230} showLabels={true} />
        </div>

        {/* Speed Dial Card */}
        <SpeedDial />
      </div>

      {/* Temperature Response Spectrum */}
      <TemperatureBandsBar />

      {/* Real-Time Telemetry Stream Chart */}
      <div className="glass-panel" style={{
        padding: '22px',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(8, 145, 178, 0.08)',
              border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Live Room Climate Trend
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Real-time temperature telemetry directly from ESP32
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveNav('history')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-primary)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>Activity History</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <TelemetryChart type="temperature" height={220} />
      </div>
    </div>
  );
};
