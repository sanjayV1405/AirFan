import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Sliders, Moon, Leaf, Wind, Zap } from 'lucide-react';

export const FanControlPage: React.FC = () => {
  const { telemetry, connectionState, setFanSpeed, setOperatingMode } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const applyPreset = async (speed: number) => {
    if (!isConnected) return;
    if (telemetry.activeMode !== 'manual') await setOperatingMode('manual');
    await setFanSpeed(speed);
  };

  const presets = [
    { label: 'Quiet Night', speed: 20, desc: 'Silent airflow for sleeping.', icon: Moon, color: '#3979D8', colorDim: 'rgba(57,121,216,0.09)' },
    { label: 'Eco Fresh', speed: 40, desc: 'Energy-efficient gentle circulation.', icon: Leaf, color: '#1A9E6A', colorDim: 'rgba(26,158,106,0.09)' },
    { label: 'Comfort Breeze', speed: 70, desc: 'Strong cooling when room feels warm.', icon: Wind, color: '#C07B2B', colorDim: 'rgba(192,123,43,0.09)' },
    { label: 'Maximum Boost', speed: 100, desc: 'Full power for rapid heat relief.', icon: Zap, color: '#C0392B', colorDim: 'rgba(192,57,43,0.09)' },
  ];

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <Sliders size={18} />
          </div>
          <div>
            <h1 className="page-title">Fan Control</h1>
            <p className="page-subtitle">Ceiling fan speed, modes, and presets</p>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <ModeSelector />

      {/* Fan + Speed dial */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card-solid" style={{
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 320,
        }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
            Room Ceiling Fan
          </div>
          <FanVisualization size={250} showLabels={true} />
        </div>
        <SpeedDial />
      </div>

      {/* Quick presets */}
      <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
        <div className="section-heading" style={{ marginBottom: 14 }}>Quick Presets</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {presets.map(({ label, speed, desc, icon: Icon, color, colorDim }) => (
            <button
              key={speed}
              onClick={() => applyPreset(speed)}
              disabled={!isConnected}
              style={{
                background: colorDim,
                border: `1px solid ${color}28`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'left',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)',
                opacity: isConnected ? 1 : 0.55,
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => { if (isConnected) (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color, marginBottom: 6 }}>
                <Icon size={16} />
                <strong style={{ fontSize: '0.88rem', fontWeight: 600 }}>{label} — {speed}%</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fan speed history */}
      <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
        <div className="section-heading" style={{ marginBottom: 14 }}>Fan Speed History</div>
        <TelemetryChart type="fans" height={200} />
      </div>
    </div>
  );
};
