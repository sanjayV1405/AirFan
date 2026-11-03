import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { MoistureIndicator } from '../components/wetzone/MoistureIndicator';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Droplets } from 'lucide-react';

export const WetZonePage: React.FC = () => {
  const { telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const currentHumidity = isConnected ? telemetry.wetZoneHumidityPercent : null;
  const isVentilating = isConnected && telemetry.exhaustFanState;
  const runtimeSec = isConnected ? telemetry.exhaustFanRuntimeSeconds : 0;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <Droplets size={18} />
          </div>
          <div>
            <h1 className="page-title">Humidity & Ventilation</h1>
            <p className="page-subtitle">Moisture monitoring, steam detection, and exhaust fan management</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <div className="card-solid" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Current Humidity
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {currentHumidity !== null ? `${currentHumidity}%` : '—'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {currentHumidity !== null
              ? (currentHumidity <= 60 ? 'Healthy range' : 'Elevated — monitoring')
              : 'Sensor offline'}
          </div>
        </div>

        <div className="card-solid" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Comfort Range
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 700,
            color: 'var(--color-success)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            40–60%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Target indoor humidity
          </div>
        </div>

        <div className="card-solid" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Exhaust Fan
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: isVentilating ? 'var(--color-warning)' : isConnected ? 'var(--text-secondary)' : 'var(--text-muted)',
            lineHeight: 1,
          }}>
            {!isConnected ? '—' : isVentilating ? 'Active' : 'Standby'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
            {isVentilating ? `${Math.floor(runtimeSec / 60)}m runtime` : 'Waiting for trigger'}
          </div>
        </div>
      </div>

      {/* Main controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <MoistureIndicator />
        <ExhaustFanControl />
      </div>

      {/* Humidity chart */}
      <div className="card-solid" style={{ padding: '22px' }}>
        <div style={{ marginBottom: 14 }}>
          <div className="section-heading">Moisture Trend</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Live humidity vs adaptive baseline
          </div>
        </div>
        <TelemetryChart type="humidity" height={210} />
      </div>
    </div>
  );
};
