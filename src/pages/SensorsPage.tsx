import React, { useState } from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { SensorCard } from '../components/sensors/SensorCard';
import { 
  Cpu, 
  Thermometer, 
  Droplets, 
  UserCheck, 
  Wind, 
  Power, 
  Activity,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { telemetry, pingLatency, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';
  const metrics = telemetry.systemMetrics;

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Cpu size={22} color="var(--accent-primary)" />
            <span>Sensor &amp; Hardware Status</span>
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Live status of your environmental sensors and smart ventilation drivers.
          </p>
        </div>

        {/* Toggle Advanced Hardware Diagnostics */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: showAdvanced ? 'var(--accent-primary-dim)' : '#FFFFFF',
            border: `1px solid ${showAdvanced ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            color: showAdvanced ? 'var(--accent-primary)' : 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Code size={15} />
          <span>{showAdvanced ? 'Hide Technical Diagnostics' : 'Show Advanced Diagnostics'}</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* User-Friendly Sensor Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16
      }}>
        {/* 1. Room Temperature */}
        <SensorCard
          title="Room Temperature"
          subtitle="Measures room ambient heat"
          value={isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}` : '--'}
          unit="°C"
          status={isConnected && telemetry.sensorHealth.comfortDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Normal' : 'Offline'}
          description={isConnected && telemetry.comfortTemperatureC !== null ? (telemetry.comfortTemperatureC < 26 ? 'Cool room' : telemetry.comfortTemperatureC <= 29 ? 'Comfortable room' : 'Warm room') : 'Sensor offline'}
          icon={<Thermometer size={18} />}
        />

        {/* 2. Humidity & Moisture */}
        <SensorCard
          title="Humidity & Moisture"
          subtitle="Detects steam and dampness"
          value={isConnected && telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}` : '--'}
          unit="% RH"
          status={isConnected && telemetry.sensorHealth.wetDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Normal' : 'Offline'}
          description={isConnected && telemetry.humidityBaselinePercent !== null ? `Baseline target: ${telemetry.humidityBaselinePercent}%` : 'Sensor offline'}
          icon={<Droplets size={18} />}
        />

        {/* 3. Room Occupancy */}
        <SensorCard
          title="Room Occupancy"
          subtitle="Detects human presence"
          value={!isConnected ? 'Offline' : telemetry.occupancyDetected ? 'Occupied' : 'Vacant'}
          status={isConnected && telemetry.sensorHealth.pirMotion === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (telemetry.occupancyDetected ? 'Motion Active' : 'Standby') : 'Offline'}
          description={isConnected ? (telemetry.occupancyDetected ? 'Person in room' : 'Room is currently empty') : 'Sensor offline'}
          icon={<UserCheck size={18} />}
        />

        {/* 4. Room Fan */}
        <SensorCard
          title="Room Fan"
          subtitle="Main cooling circulation"
          value={isConnected ? `${telemetry.requestedFanSpeedPercent}` : '--'}
          unit="%"
          status={isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'Running' : 'Standby') : 'Offline'}
          description={isConnected ? (telemetry.activeMode === 'auto' ? 'Automatic regulation' : 'Manual speed chosen') : 'Hardware offline'}
          icon={<Wind size={18} />}
        />

        {/* 5. Ventilation Fan */}
        <SensorCard
          title="Ventilation Fan"
          subtitle="Moisture air extraction"
          value={!isConnected ? 'Offline' : telemetry.exhaustFanState ? 'Running' : 'Off'}
          status={isConnected && telemetry.exhaustFanState ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.exhaustFanState ? 'Ventilating' : 'Standby') : 'Offline'}
          description={isConnected && telemetry.exhaustFanState ? `${Math.floor(telemetry.exhaustFanRuntimeSeconds / 60)}m run time` : 'Normal standby'}
          icon={<Power size={18} />}
        />

        {/* 6. System Connection */}
        <SensorCard
          title="System Connection"
          subtitle="Microcontroller connection"
          value={isConnected ? 'Connected' : 'Offline'}
          status={isConnected ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (pingLatency !== null ? `${pingLatency}ms` : 'Good') : 'Disconnected'}
          description={isConnected ? (telemetry.firmwareVersion || 'ESP32 Node Active') : 'Waiting for connection'}
          icon={<Activity size={18} />}
        />
      </div>

      {/* Advanced Diagnostics Section (Collapsible) */}
      {showAdvanced && (
        <div className="glass-panel fade-in-up" style={{ padding: '24px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Code size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Advanced Engineering Diagnostics &amp; GPIO Mapping
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Technical pin allocations, hardware protocols, and low-level firmware readouts.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-medium)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-secondary)'
                }}>
                  <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 6px', fontWeight: 600 }}>Pin / Bus</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Component</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Protocol / Driver</th>
                  <th style={{ padding: '10px 14px', borderRadius: '0 6px 6px 0', fontWeight: 600 }}>Live Hardware Value</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 4</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>DHT11 Comfort Sensor</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>1-Wire Single Bus</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}°C / ${telemetry.comfortHumidityPercent}%` : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 5</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>DHT11 Moisture Sensor</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>1-Wire Single Bus</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected && telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}% RH` : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 27</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>HC-SR501 PIR Sensor</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>Digital GPIO Interrupt</td>
                  <td style={{ padding: '12px 14px' }}>
                    {isConnected ? (telemetry.occupancyDetected ? 'HIGH (Presence Active)' : 'LOW (Idle)') : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 25</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>Fan MOSFET (IRLZ44N)</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>LEDC 25kHz PWM Output</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected ? `${telemetry.requestedFanSpeedPercent}% Duty Cycle` : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 26</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>Ventilation Fan Driver</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>Digital Relay Output</td>
                  <td style={{ padding: '12px 14px' }}>
                    {isConnected ? (telemetry.exhaustFanState ? 'RELAY CLOSED (Active)' : 'RELAY OPEN (Standby)') : 'Unavailable'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>System</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>ESP32 Dual-Core MCU</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>HTTP / JSON REST API</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected ? `Free Heap: ${metrics?.freeHeapBytes ? Math.round(metrics.freeHeapBytes / 1024) : 198} KB` : 'Offline'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
