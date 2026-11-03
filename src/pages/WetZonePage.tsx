import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { MoistureIndicator } from '../components/wetzone/MoistureIndicator';
import { ExhaustFanControl } from '../components/wetzone/ExhaustFanControl';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Droplets, Wind, ShieldCheck, AlertCircle, Clock, Zap } from 'lucide-react';

export const WetZonePage: React.FC = () => {
  const { telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const currentHumidity = isConnected ? telemetry.wetZoneHumidityPercent : null;
  const isVentilating = isConnected && telemetry.exhaustFanState;
  const runtimeSec = isConnected ? telemetry.exhaustFanRuntimeSeconds : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1440, margin: '0 auto' }}>
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
          <Droplets size={24} color="#38BDF8" />
          <span>Humidity &amp; Exhaust Ventilation</span>
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Autonomous moisture detection, steam evacuation, and smart air extraction.
        </p>
      </div>

      {/* Prominent Humidity & Ventilation Status Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16
      }}>
        {/* Comfortable Humidity Range Indicator */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Droplets size={18} color="var(--accent-primary)" />
            <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F8FAFC' }}>
              Humidity Comfort Band
            </h4>
          </div>
          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: 14,
            lineHeight: 1.4
          }}>
            Healthy indoor air ranges between <strong style={{ color: '#10B981' }}>40% – 60% RH</strong>. When room moisture exceeds this threshold, the exhaust fan engages.
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(11, 17, 32, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.78rem'
          }}>
            <span>Current Status</span>
            <strong style={{
              color: !isConnected ? 'var(--text-muted)' : isVentilating ? 'var(--accent-amber)' : (currentHumidity && currentHumidity <= 60) ? 'var(--color-success)' : 'var(--accent-primary)'
            }}>
              {!isConnected ? 'Hardware Offline' : isVentilating ? 'Ventilating Moisture' : 'Healthy Range'}
            </strong>
          </div>
        </div>

        {/* Ventilation Run Summary */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Wind size={18} color="var(--accent-amber)" />
            <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F8FAFC' }}>
              Extraction Summary
            </h4>
          </div>
          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: 14,
            lineHeight: 1.4
          }}>
            {isVentilating 
              ? `Exhaust fan has been running for ${Math.floor(runtimeSec / 60)} minutes to clear room humidity.`
              : 'Extraction fan is standing by. Will automatically activate on moisture surges.'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(11, 17, 32, 0.65)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '0.78rem'
          }}>
            <span>Exhaust Relay</span>
            <strong style={{ color: isVentilating ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
              {isVentilating ? 'Active (Closed)' : 'Idle (Open)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Moisture & Exhaust Fan Dual Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 18
      }}>
        {/* Moisture Dynamics Indicator */}
        <MoistureIndicator />

        {/* Dedicated Exhaust Fan Control Station */}
        <ExhaustFanControl />
      </div>

      {/* Room Moisture Trend Chart */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Moisture &amp; Humidity Trends
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Live humidity readings vs adaptive rolling baseline
            </span>
          </div>
        </div>

        <TelemetryChart type="humidity" height={220} />
      </div>
    </div>
  );
};
