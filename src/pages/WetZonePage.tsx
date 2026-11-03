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
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-brand">
          <div className="icon-container icon-container-teal" style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)' }}>
            <Droplets size={20} />
          </div>
          <div>
            <h1 className="page-title">Humidity &amp; Ventilation</h1>
            <p className="page-subtitle">Moisture monitoring, steam detection, and exhaust fan management</p>
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>

        {/* Current Humidity */}
        <div className="card-solid card-enter" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card-hover)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)';
          }}
        >
          {/* Top teal stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: '18px 18px 0 0',
          }} />
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, marginTop: 6 }}>
            Current Humidity
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1,
            letterSpacing: '-0.035em',
          }}>
            {currentHumidity !== null ? `${currentHumidity}%` : '—'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {currentHumidity !== null
              ? (currentHumidity <= 60 ? 'Within healthy range' : 'Elevated — monitoring')
              : 'Sensor offline'}
          </div>
        </div>

        {/* Comfort Range */}
        <div className="card-solid card-enter" style={{ padding: '20px', position: 'relative', overflow: 'hidden', animationDelay: '0.08s' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, var(--color-success), #5ACA9A)',
            borderRadius: '18px 18px 0 0',
          }} />
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, marginTop: 6 }}>
            Comfort Range
          </div>
          <div className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--color-success)',
            lineHeight: 1,
            letterSpacing: '-0.035em',
          }}>
            40–60%
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Optimal indoor humidity target
          </div>
        </div>

        {/* Exhaust Fan Status */}
        <div className="card-solid card-enter" style={{ padding: '20px', position: 'relative', overflow: 'hidden', animationDelay: '0.16s' }}>
          {isVentilating && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, var(--color-warning), #D4A050)',
              borderRadius: '18px 18px 0 0',
            }} />
          )}
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, marginTop: 6 }}>
            Exhaust Fan
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.85rem',
            fontWeight: 800,
            color: isVentilating ? 'var(--color-warning)' : isConnected ? 'var(--text-secondary)' : 'var(--text-muted)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
          }}>
            {!isConnected ? '—' : isVentilating ? 'Active' : 'Standby'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {isVentilating ? `${Math.floor(runtimeSec / 60)}m runtime` : 'Waiting for humidity trigger'}
          </div>
        </div>
      </div>

      {/* Main controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        <MoistureIndicator />
        <ExhaustFanControl />
      </div>

      {/* Humidity chart */}
      <div className="card-solid" style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <div className="section-heading">Moisture Trend</div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>
            Live humidity level vs adaptive baseline target
          </div>
        </div>
        <TelemetryChart type="humidity" height={210} />
      </div>
    </div>
  );
};
