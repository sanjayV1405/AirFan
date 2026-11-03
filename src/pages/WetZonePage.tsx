import React from 'react';
import { MoistureIndicator } from '../components/wetzone/MoistureIndicator';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Droplets } from 'lucide-react';

export const WetZonePage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
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
          <Droplets size={22} color="var(--accent-secondary)" />
          <span>Humidity &amp; Ventilation</span>
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Automatic moisture detection and smart air extraction to prevent dampness and odors.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16
      }}>
        <MoistureIndicator />
        <ExhaustFanControl />
      </div>

      <div className="glass-panel" style={{
        padding: '22px',
        borderRadius: '16px'
      }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Room Moisture vs Target Baseline
        </h3>
        <TelemetryChart type="humidity" height={220} />
      </div>
    </div>
  );
};
