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
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-brand">
          <div className="icon-container icon-container-teal" style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)' }}>
            <Cpu size={20} />
          </div>
          <div>
            <h1 className="page-title">Sensor Status</h1>
            <p className="page-subtitle">Real-time readings from all environmental sensors and fan actuators</p>
          </div>
        </div>

        {/* Toggle Advanced Diagnostics */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: showAdvanced ? 'var(--accent-primary-dim)' : 'var(--surface-card)',
            border: `1.5px solid ${showAdvanced ? 'rgba(8, 127, 140, 0.35)' : 'var(--border-card)'}`,
            color: showAdvanced ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 18px',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <Code size={15} />
          <span>{showAdvanced ? 'Hide Diagnostics' : 'Engineering Diagnostics'}</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* 6 Sensor Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: 16
      }}>
        {/* 1. Room Temperature */}
        <SensorCard
          title="Room Temperature"
          subtitle="DHT22 climate sensor (GPIO 4)"
          value={isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}` : '—'}
          unit="°C"
          status={isConnected && telemetry.sensorHealth.comfortDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Reading' : 'Offline'}
          description={isConnected && telemetry.comfortTemperatureC !== null
            ? (telemetry.comfortTemperatureC < 26 ? 'Cool environment — comfortable'
              : telemetry.comfortTemperatureC <= 29 ? 'Ideal temperature range'
              : 'Warm — fan assist active')
            : 'Sensor offline — hardware disconnected'}
          icon={<Thermometer size={19} />}
        />

        {/* 2. Humidity Level */}
        <SensorCard
          title="Humidity Level"
          subtitle="DHT22 humidity sensor (GPIO 4)"
          value={isConnected && telemetry.comfortHumidityPercent !== null ? `${telemetry.comfortHumidityPercent}` : '—'}
          unit="%"
          status={isConnected && telemetry.sensorHealth.wetDht11 === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? 'Reading' : 'Offline'}
          description={isConnected && telemetry.comfortHumidityPercent !== null
            ? (telemetry.comfortHumidityPercent <= 60 ? 'Optimal moisture level' : 'Elevated moisture detected')
            : 'Sensor offline — hardware disconnected'}
          icon={<Droplets size={19} />}
        />

        {/* 3. Room Occupancy */}
        <SensorCard
          title="Room Occupancy"
          subtitle="HC-SR501 PIR presence detector"
          value={!isConnected ? '—' : telemetry.occupancyDetected ? 'Occupied' : 'Vacant'}
          status={isConnected && telemetry.sensorHealth.pirMotion === 'OK' ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (telemetry.occupancyDetected ? 'Motion Active' : 'Standby') : 'Offline'}
          description={isConnected
            ? (telemetry.occupancyDetected ? 'Presence confirmed — fan operating at full comfort speed' : 'No motion detected — power-saving mode active')
            : 'Sensor offline — hardware disconnected'}
          icon={<UserCheck size={19} />}
        />

        {/* 4. Ceiling Fan */}
        <SensorCard
          title="Ceiling Fan"
          subtitle="IRLZ44N MOSFET PWM driver"
          value={isConnected ? `${telemetry.requestedFanSpeedPercent}` : '—'}
          unit="%"
          status={isConnected && telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.fanRunningState === 'RUNNING' && telemetry.requestedFanSpeedPercent > 0 ? 'Running' : 'Standby') : 'Offline'}
          description={isConnected
            ? (telemetry.activeMode === 'auto' ? 'Automatic climate modulation — temperature-driven speed' : 'Manual speed setpoint — operator controlled')
            : 'Actuator offline — hardware disconnected'}
          icon={<Wind size={19} />}
        />

        {/* 5. Exhaust Fan */}
        <SensorCard
          title="Exhaust Fan"
          subtitle="Digital relay output driver"
          value={!isConnected ? '—' : telemetry.exhaustFanState ? 'Running' : 'Off'}
          status={isConnected && telemetry.exhaustFanState ? 'ACTIVE' : 'STANDBY'}
          statusText={isConnected ? (telemetry.exhaustFanState ? 'Ventilating' : 'Standby') : 'Offline'}
          description={isConnected && telemetry.exhaustFanState
            ? `${Math.floor(telemetry.exhaustFanRuntimeSeconds / 60)}m ${telemetry.exhaustFanRuntimeSeconds % 60}s extraction active`
            : 'Relay open — armed for humidity surge trigger'}
          icon={<Power size={19} />}
        />

        {/* 6. Hardware Connection */}
        <SensorCard
          title="Hardware Connection"
          subtitle="ESP32 dual-core controller"
          value={isConnected ? 'Connected' : 'Offline'}
          status={isConnected ? 'ONLINE' : 'OFFLINE'}
          statusText={isConnected ? (pingLatency !== null ? `${pingLatency}ms` : 'Live') : 'Disconnected'}
          description={isConnected
            ? (telemetry.firmwareVersion ? `Firmware: ${telemetry.firmwareVersion}` : 'ESP32 node communicating normally')
            : 'Waiting for hardware connection — check device IP'}
          icon={<Activity size={19} />}
        />
      </div>

      {/* Advanced Diagnostics (Collapsible) */}
      {showAdvanced && (
        <div className="card-solid fade-in-up" style={{ padding: '26px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
            <div className="icon-container icon-container-blue" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)' }}>
              <Code size={17} />
            </div>
            <div>
              <h3 className="section-heading">Engineering Diagnostics &amp; GPIO Mapping</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Low-level hardware pinouts, communication protocols, and firmware memory metrics.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.84rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '11px 16px', borderRadius: '9px 0 0 9px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid var(--border-card)' }}>Pin / Bus</th>
                  <th style={{ padding: '11px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid var(--border-card)' }}>Hardware Component</th>
                  <th style={{ padding: '11px 16px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid var(--border-card)' }}>Driver Protocol</th>
                  <th style={{ padding: '11px 16px', borderRadius: '0 9px 9px 0', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1.5px solid var(--border-card)' }}>Live Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { pin: 'GPIO 4',  component: 'DHT22 Temperature Sensor', protocol: '1-Wire Digital Bus',       value: isConnected && telemetry.comfortTemperatureC !== null ? `${telemetry.comfortTemperatureC.toFixed(1)}°C` : 'Unavailable' },
                  { pin: 'GPIO 4',  component: 'DHT22 Humidity Sensor',    protocol: '1-Wire Digital Bus',       value: isConnected && telemetry.comfortHumidityPercent !== null ? `${telemetry.comfortHumidityPercent}% RH` : 'Unavailable' },
                  { pin: 'GPIO 25', component: 'Fan Motor Driver PWM',     protocol: 'LEDC 25kHz PWM Output',   value: isConnected ? `${telemetry.requestedFanSpeedPercent}% Duty Cycle` : 'Unavailable' },
                  { pin: 'Wi-Fi',   component: 'ESP32 Wi-Fi REST API',     protocol: 'GET /api/status (JSON)',   value: isConnected ? 'Online (2s Polling)' : 'Offline' },
                  { pin: 'Serial',  component: 'UART Debug Port',          protocol: '115200 Baud',              value: 'Active' },
                  { pin: 'MCU',     component: 'ESP32 Development Board',  protocol: 'FreeRTOS / Arduino',       value: isConnected ? `Free Heap: ${metrics?.freeHeapBytes ? Math.round(metrics.freeHeapBytes / 1024) : 198} KB` : 'Offline' },
                ].map((row, idx, arr) => (
                  <tr key={row.pin} style={{ borderBottom: idx < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.84rem' }}>{row.pin}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>{row.component}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)' }}>{row.protocol}</td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
