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
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <Cpu size={18} />
          </div>
          <div>
            <h1 className="page-title">Sensor Status</h1>
            <p className="page-subtitle">Real-time status of environmental sensors and fan actuators</p>
          </div>
        </div>

        {/* Toggle Advanced Diagnostics */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.80rem',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            borderColor: showAdvanced ? 'var(--accent-primary)' : undefined,
            color: showAdvanced ? 'var(--accent-primary)' : undefined,
          }}
        >
          <Code size={14} />
          <span>{showAdvanced ? 'Hide Diagnostics' : 'Advanced Diagnostics'}</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* 6 User-Friendly Sensor Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16
      }}>
        {/* 1. Room Temperature */}
        <SensorCard
          title="Room Temperature"
          subtitle="Comfort sensor"
          value={isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}` : '—'}
          unit="°C"
          status={isConnected && telemetry.sensorHealth.comfortDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Normal' : 'Offline'}
          description={isConnected && telemetry.comfortTemperatureC !== null ? (telemetry.comfortTemperatureC < 26 ? 'Cool environment' : telemetry.comfortTemperatureC <= 29 ? 'Comfortable temperature' : 'Warm room') : 'Sensor offline'}
          icon={<Thermometer size={18} />}
        />

        {/* 2. Humidity Level */}
        <SensorCard
          title="Humidity Level"
          subtitle="Moisture sensor"
          value={isConnected && telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}` : '—'}
          unit="%"
          status={isConnected && telemetry.sensorHealth.wetDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Normal' : 'Offline'}
          description={isConnected && telemetry.humidityBaselinePercent !== null ? `Baseline target: ${telemetry.humidityBaselinePercent}%` : 'Sensor offline'}
          icon={<Droplets size={18} />}
        />

        {/* 3. Room Occupancy */}
        <SensorCard
          title="Room Occupancy"
          subtitle="Presence detector"
          value={!isConnected ? '—' : telemetry.occupancyDetected ? 'Occupied' : 'Vacant'}
          status={isConnected && telemetry.sensorHealth.pirMotion === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (telemetry.occupancyDetected ? 'Motion Active' : 'Standby') : 'Offline'}
          description={isConnected ? (telemetry.occupancyDetected ? 'Person detected in room' : 'Room is currently vacant') : 'Sensor offline'}
          icon={<UserCheck size={18} />}
        />

        {/* 4. Ceiling Fan */}
        <SensorCard
          title="Ceiling Fan"
          subtitle="Air circulation actuator"
          value={isConnected ? `${telemetry.requestedFanSpeedPercent}` : '—'}
          unit="%"
          status={isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'Running' : 'Standby') : 'Offline'}
          description={isConnected ? (telemetry.activeMode === 'auto' ? 'Automatic climate modulation' : 'Manual speed setpoint') : 'Hardware offline'}
          icon={<Wind size={18} />}
        />

        {/* 5. Exhaust Fan */}
        <SensorCard
          title="Exhaust Fan"
          subtitle="Moisture ventilation driver"
          value={!isConnected ? '—' : telemetry.exhaustFanState ? 'Running' : 'Off'}
          status={isConnected && telemetry.exhaustFanState ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.exhaustFanState ? 'Ventilating' : 'Standby') : 'Offline'}
          description={isConnected && telemetry.exhaustFanState ? `${Math.floor(telemetry.exhaustFanRuntimeSeconds / 60)}m extraction active` : 'Standing by for moisture trigger'}
          icon={<Power size={18} />}
        />

        {/* 6. Hardware Connection */}
        <SensorCard
          title="Hardware Connection"
          subtitle="ESP32 Controller node"
          value={isConnected ? 'Connected' : 'Offline'}
          status={isConnected ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (pingLatency !== null ? `${pingLatency}ms` : 'Good') : 'Disconnected'}
          description={isConnected ? (telemetry.firmwareVersion || 'ESP32 Node Online') : 'Waiting for hardware connection'}
          icon={<Activity size={18} />}
        />
      </div>

      {/* Advanced Diagnostics Section (Collapsible) */}
      {showAdvanced && (
        <div className="card-solid fade-in-up" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="icon-container icon-container-blue" style={{ width: 32, height: 32 }}>
              <Code size={16} />
            </div>
            <h3 className="section-heading">
              Advanced Engineering Diagnostics &amp; GPIO Mapping
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Low-level hardware pinouts, communication protocols, and firmware memory metrics.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-medium)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}>
                  <th style={{ padding: '10px 14px', borderRadius: '6px 0 0 6px', fontWeight: 600 }}>Pin / Bus</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Hardware Component</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Driver Protocol</th>
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
                    {isConnected ? (telemetry.occupancyDetected ? 'HIGH (Active Presence)' : 'LOW (Room Idle)') : 'Unavailable'}
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
                  <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>Exhaust Fan Driver</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>Digital Relay Output</td>
                  <td style={{ padding: '12px 14px' }}>
                    {isConnected ? (telemetry.exhaustFanState ? 'RELAY CLOSED (Engaged)' : 'RELAY OPEN (Standby)') : 'Unavailable'}
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
