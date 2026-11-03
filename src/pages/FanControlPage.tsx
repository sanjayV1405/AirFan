import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Sliders, Wind, Moon, Leaf, Flame } from 'lucide-react';

export const FanControlPage: React.FC = () => {
  const { telemetry, connectionState, setFanSpeed, setOperatingMode } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const applyQuickPreset = async (speed: number) => {
    if (!isConnected) return;
    if (telemetry.activeMode !== 'manual') {
      await setOperatingMode('manual');
    }
    await setFanSpeed(speed);
  };

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
          <Sliders size={22} color="var(--accent-primary)" />
          <span>Room Fan Control</span>
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Adjust ventilation speed, select operation mode, and monitor hardware output.
        </p>
      </div>

      <ModeSelector />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 16
      }}>
        {/* Fan visualizer */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320
        }}>
          <FanVisualization size={230} showLabels={true} />
        </div>

        {/* Speed Controls */}
        <SpeedDial />
      </div>

      {/* Quick Comfort Presets */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 16 }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Quick Comfort Presets
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}>
          <button
            onClick={() => applyQuickPreset(20)}
            disabled={!isConnected}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '14px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7', marginBottom: 4 }}>
              <Moon size={16} />
              <strong style={{ fontSize: '0.84rem' }}>Sleep / Quiet</strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              20% speed for whisper-quiet night airflow.
            </div>
          </button>

          <button
            onClick={() => applyQuickPreset(40)}
            disabled={!isConnected}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '14px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', marginBottom: 4 }}>
              <Leaf size={16} />
              <strong style={{ fontSize: '0.84rem' }}>Eco Fresh</strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              40% speed for energy-efficient circulation.
            </div>
          </button>

          <button
            onClick={() => applyQuickPreset(70)}
            disabled={!isConnected}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '14px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D97706', marginBottom: 4 }}>
              <Wind size={16} />
              <strong style={{ fontSize: '0.84rem' }}>Standard Breeze</strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              70% speed for active cooling.
            </div>
          </button>

          <button
            onClick={() => applyQuickPreset(100)}
            disabled={!isConnected}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '14px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', marginBottom: 4 }}>
              <Flame size={16} />
              <strong style={{ fontSize: '0.84rem' }}>Maximum Boost</strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              100% full speed rapid thermal relief.
            </div>
          </button>
        </div>
      </div>

      {/* Fan PWM Duty Cycle Output Log */}
      <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          Room Fan Speed History
        </h3>
        <TelemetryChart type="fans" height={200} />
      </div>
    </div>
  );
};
