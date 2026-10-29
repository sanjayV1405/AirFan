import React from 'react';
import { MoistureIndicator } from '../components/wetzone/MoistureIndicator';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Droplets } from 'lucide-react';

export const WetZonePage: React.FC = () => {
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
          <Droplets size={20} color="var(--accent-secondary)" />
          <span>Wet Zone — Adaptive Ventilation Subsystem</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Rate-of-rise dynamic moisture detection and autonomous exhaust ventilation.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        <MoistureIndicator />
        <ExhaustFanControl />
      </div>

      <div className="glass-panel" style={{
        padding: '20px',
        borderRadius: '16px'
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Relative Humidity vs Rolling Median Baseline
        </h3>
        <TelemetryChart type="humidity" height={220} />
      </div>
    </div>
  );
};
