import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { SensorCard } from '../components/sensors/SensorCard';
import { 
  Cpu, 
  Thermometer, 
  Droplets, 
  UserCheck, 
  Wind, 
  Power, 
  Activity 
} from 'lucide-react';

export const SensorsPage: React.FC = () => {
  const { telemetry, pingLatency } = useAirLoop();
  const metrics = telemetry.systemMetrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200, margin: '0 auto' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Cpu size={20} color="var(--accent-primary)" />
          <span>Live Hardware Sensors &amp; GPIO Diagnostics</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Real-time telemetry probing directly mapped to physical microcontroller pins.
        </p>
      </div>

      {/* Grid of 6 dark sensor cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14
      }}>
        <SensorCard
          title="Comfort DHT11"
          pin="GPIO 4"
          value={telemetry.comfortTemperatureC !== null ? telemetry.comfortTemperatureC.toFixed(1) : '--'}
          unit="°C"
          status={telemetry.sensorHealth.comfortDht11}
          secondaryInfo={`Humidity: ${telemetry.comfortHumidityPercent !== null ? `${telemetry.comfortHumidityPercent}%` : '--'}`}
          icon={<Thermometer size={16} />}
        />

        <SensorCard
          title="Wet Zone DHT11"
          pin="GPIO 5"
          value={telemetry.wetZoneHumidityPercent !== null ? `${telemetry.wetZoneHumidityPercent}` : '--'}
          unit="% RH"
          status={telemetry.sensorHealth.wetDht11}
          secondaryInfo={`Baseline: ${telemetry.humidityBaselinePercent ?? 50}%`}
          icon={<Droplets size={16} />}
        />

        <SensorCard
          title="HC-SR501 Motion"
          pin="GPIO 27"
          value={telemetry.occupancyDetected ? 'HIGH (1)' : 'LOW (0)'}
          status={telemetry.sensorHealth.pirMotion}
          secondaryInfo={telemetry.occupancyDetected ? 'Motion detected' : 'Room idle'}
          icon={<UserCheck size={16} />}
        />

        <SensorCard
          title="Fan MOSFET"
          pin="GPIO 25 (PWM)"
          value={telemetry.requestedFanSpeedPercent}
          unit="%"
          status={telemetry.sensorHealth.fanMosfet}
          secondaryInfo="LEDC 25kHz PWM"
          icon={<Wind size={16} />}
        />

        <SensorCard
          title="Exhaust Driver"
          pin="GPIO 26 (Relay)"
          value={telemetry.exhaustFanState ? 'ON (1)' : 'OFF (0)'}
          status={telemetry.sensorHealth.exhaustMosfet}
          secondaryInfo={telemetry.exhaustFanState ? `${Math.floor(telemetry.exhaustFanRuntimeSeconds / 60)}m active` : 'Standby'}
          icon={<Power size={16} />}
        />

        <SensorCard
          title="ESP32 Health"
          pin="Dual-Core 240MHz"
          value={metrics?.freeHeapBytes ? `${Math.round(metrics.freeHeapBytes / 1024)} KB` : '198 KB'}
          unit="Heap"
          status="OK"
          secondaryInfo={`Ping: ${pingLatency !== null ? `${pingLatency}ms` : '12ms'}`}
          icon={<Activity size={16} />}
        />
      </div>

      {/* Pinout Table */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Physical GPIO Pinout Assignments
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>GPIO Pin</th>
                <th style={{ padding: '10px 12px' }}>Peripheral Device</th>
                <th style={{ padding: '10px 12px' }}>Protocol</th>
                <th style={{ padding: '10px 12px' }}>Live State / Reading</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 4</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>Comfort DHT11</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>1-Wire Digital</td>
                <td style={{ padding: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{telemetry.comfortTemperatureC}°C / {telemetry.comfortHumidityPercent}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 5</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>Wet Zone DHT11</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>1-Wire Digital</td>
                <td style={{ padding: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{telemetry.wetZoneHumidityPercent}% RH</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 27</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>HC-SR501 PIR</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Digital Input</td>
                <td style={{ padding: '12px', fontWeight: 600, color: telemetry.occupancyDetected ? 'var(--color-success)' : 'var(--text-muted)' }}>
                  {telemetry.occupancyDetected ? 'Motion Active (1)' : 'Vacant (0)'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 25</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>Fan Driver (IRLZ44N)</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>LEDC PWM</td>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{telemetry.requestedFanSpeedPercent}% PWM Duty</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>GPIO 26</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)' }}>Exhaust Driver (Relay)</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>Digital Output</td>
                <td style={{ padding: '12px', fontWeight: 600, color: telemetry.exhaustFanState ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                  {telemetry.exhaustFanState ? 'Closed / Active (1)' : 'Open / Idle (0)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
