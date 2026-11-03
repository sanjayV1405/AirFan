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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.45rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            letterSpacing: '-0.02em'
          }}>
            <Cpu size={24} color="var(--accent-primary)" />
            <span>Hardware &amp; Sensor Status</span>
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Direct monitoring of all environmental inputs and physical fan actuators.
          </p>
        </div>

        {/* Toggle Advanced Diagnostics */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: showAdvanced ? 'var(--accent-primary-dim)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${showAdvanced ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
            color: showAdvanced ? 'var(--accent-primary)' : 'var(--text-secondary)',
            boxShadow: showAdvanced ? '0 0 16px rgba(0, 242, 254, 0.25)' : 'var(--shadow-sm)',
            borderRadius: 12,
            padding: '9px 18px',
            fontSize: '0.8rem',
            fontWeight: 800,
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

      {/* 6 User-Friendly Sensor Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 18
      }}>
        {/* 1. Room Temperature */}
        <SensorCard
          title="Room Temperature"
          subtitle="Indoor thermal sensor"
          value={isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}` : '--'}
          unit="°C"
          status={isConnected && telemetry.sensorHealth.comfortDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Normal' : 'Offline'}
          description={isConnected && telemetry.comfortTemperatureC !== null ? (telemetry.comfortTemperatureC < 26 ? 'Cool environment' : telemetry.comfortTemperatureC <= 29 ? 'Comfortable temperature' : 'Warm room') : 'Sensor offline'}
          icon={<Thermometer size={18} />}
        />

        {/* 2. Humidity Level */}
        <SensorCard
          title="Humidity Level"
          subtitle="Steam &amp; moisture sensor"
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
          subtitle="PIR presence detector"
          value={!isConnected ? 'Offline' : telemetry.occupancyDetected ? 'Occupied' : 'Vacant'}
          status={isConnected && telemetry.sensorHealth.pirMotion === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (telemetry.occupancyDetected ? 'Motion Active' : 'Standby') : 'Offline'}
          description={isConnected ? (telemetry.occupancyDetected ? 'Person in room' : 'Room is currently empty') : 'Sensor offline'}
          icon={<UserCheck size={18} />}
        />

        {/* 4. Ceiling Fan */}
        <SensorCard
          title="Ceiling Fan"
          subtitle="Room circulation motor"
          value={isConnected ? `${telemetry.requestedFanSpeedPercent}` : '--'}
          unit="%"
          status={isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'Running' : 'Standby') : 'Offline'}
          description={isConnected ? (telemetry.activeMode === 'auto' ? 'Automatic climate regulation' : 'Manual speed chosen') : 'Hardware offline'}
          icon={<Wind size={18} />}
        />

        {/* 5. Exhaust Fan */}
        <SensorCard
          title="Exhaust Fan"
          subtitle="Moisture ventilation driver"
          value={!isConnected ? 'Offline' : telemetry.exhaustFanState ? 'Running' : 'Off'}
          status={isConnected && telemetry.exhaustFanState ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.exhaustFanState ? 'Ventilating' : 'Standby') : 'Offline'}
          description={isConnected && telemetry.exhaustFanState ? `${Math.floor(telemetry.exhaustFanRuntimeSeconds / 60)}m continuous extraction` : 'Normal standby'}
          icon={<Power size={18} />}
        />

        {/* 6. Hardware Connection */}
        <SensorCard
          title="Hardware Connection"
          subtitle="ESP32 Controller node"
          value={isConnected ? 'Connected' : 'Offline'}
          status={isConnected ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (pingLatency !== null ? `${pingLatency}ms` : 'Good') : 'Disconnected'}
          description={isConnected ? (telemetry.firmwareVersion || 'ESP32 Node Online') : 'Waiting for connection'}
          icon={<Activity size={18} />}
        />
      </div>

      {/* Advanced Diagnostics Section (Collapsible) */}
      {showAdvanced && (
        <div className="glass-panel fade-in-up" style={{ padding: '26px', borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Code size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Advanced Engineering Diagnostics &amp; GPIO Mapping
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
            Low-level hardware pinouts, communication protocols, and firmware memory metrics.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-medium)',
                  background: 'rgba(11, 17, 32, 0.65)',
                  color: 'var(--text-secondary)'
                }}>
                  <th style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px', fontWeight: 700 }}>Pin / Bus</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Hardware Component</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Driver Protocol</th>
                  <th style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0', fontWeight: 700 }}>Live Hardware Value</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>GPIO 4</td>
                  <td style={{ padding: '14px 16px', color: '#F8FAFC', fontWeight: 700 }}>DHT11 Comfort Sensor</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>1-Wire Single Bus</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}°C / ${telemetry.comfortHumidityPercent}%` : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>GPIO 5</td>
                  <td style={{ padding: '14px 16px', color: '#F8FAFC', fontWeight: 700 }}>DHT11 Moisture Sensor</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>1-Wire Single Bus</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected && telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}% RH` : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>GPIO 27</td>
                  <td style={{ padding: '14px 16px', color: '#F8FAFC', fontWeight: 700 }}>HC-SR501 PIR Sensor</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Digital GPIO Interrupt</td>
                  <td style={{ padding: '14px 16px' }}>
                    {isConnected ? (telemetry.occupancyDetected ? 'HIGH (Active Presence)' : 'LOW (Room Idle)') : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>GPIO 25</td>
                  <td style={{ padding: '14px 16px', color: '#F8FAFC', fontWeight: 700 }}>Fan MOSFET (IRLZ44N)</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>LEDC 25kHz PWM Output</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                    {isConnected ? `${telemetry.requestedFanSpeedPercent}% Duty Cycle` : 'Unavailable'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>GPIO 26</td>
                  <td style={{ padding: '14px 16px', color: '#F8FAFC', fontWeight: 700 }}>Exhaust Fan Driver</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Digital Relay Output</td>
                  <td style={{ padding: '14px 16px' }}>
                    {isConnected ? (telemetry.exhaustFanState ? 'RELAY CLOSED (Engaged)' : 'RELAY OPEN (Standby)') : 'Unavailable'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>System</td>
                  <td style={{ padding: '14px 16px', color: '#F8FAFC', fontWeight: 700 }}>ESP32 Dual-Core MCU</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>HTTP / JSON REST API</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
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
