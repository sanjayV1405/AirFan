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
          <Sliders size={24} color="var(--accent-primary)" />
          <span>Ceiling Fan Control Station</span>
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Control room ceiling fan speed, switch between manual and automatic modes, and inspect PWM hardware feedback.
        </p>
      </div>

      <ModeSelector />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 18
      }}>
        {/* Realistic Ceiling Fan Model */}
        <div className="glass-panel" style={{
          padding: '28px',
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 340
        }}>
          <FanVisualization size={260} showLabels={true} />
        </div>

        {/* Ceiling Fan Speed Dial */}
        <SpeedDial />
      </div>

      {/* Quick Comfort Presets */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.02em' }}>
          Quick Airflow Presets
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14
        }}>
          <button
            onClick={() => applyQuickPreset(20)}
            disabled={!isConnected}
            style={{
              background: 'rgba(20, 31, 56, 0.55)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38BDF8', marginBottom: 4 }}>
              <Moon size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Quiet Night (20%)</strong>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Gentle silent airflow optimized for sleeping.
            </div>
          </button>

          <button
            onClick={() => applyQuickPreset(40)}
            disabled={!isConnected}
            style={{
              background: 'rgba(20, 31, 56, 0.55)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', marginBottom: 4 }}>
              <Leaf size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Eco Fresh (40%)</strong>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Energy-efficient constant gentle room circulation.
            </div>
          </button>

          <button
            onClick={() => applyQuickPreset(70)}
            disabled={!isConnected}
            style={{
              background: 'rgba(20, 31, 56, 0.55)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F59E0B', marginBottom: 4 }}>
              <Wind size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Comfort Breeze (70%)</strong>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Strong, refreshing cooling when room feels warm.
            </div>
          </button>

          <button
            onClick={() => applyQuickPreset(100)}
            disabled={!isConnected}
            style={{
              background: 'rgba(20, 31, 56, 0.55)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '16px',
              textAlign: 'left',
              cursor: isConnected ? 'pointer' : 'not-allowed',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', marginBottom: 4 }}>
              <Flame size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Maximum Boost (100%)</strong>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Full 25kHz PWM duty for rapid room heat relief.
            </div>
          </button>
        </div>
      </div>

      {/* Ceiling Fan Speed History */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.02em' }}>
          Ceiling Fan PWM Duty Cycle Log
        </h3>
        <TelemetryChart type="fans" height={210} />
      </div>
    </div>
  );
};
