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
    {
      label: 'Quiet Night',
      speed: 20,
      desc: 'Silent airflow for sleeping. Barely audible.',
      icon: Moon,
      color: '#2F6FB5',
      colorDim: 'rgba(47,111,181,0.08)',
      colorBorder: 'rgba(47,111,181,0.20)',
    },
    {
      label: 'Eco Fresh',
      speed: 40,
      desc: 'Energy-efficient gentle circulation.',
      icon: Leaf,
      color: 'var(--accent-secondary)',
      colorDim: 'rgba(57,122,101,0.08)',
      colorBorder: 'rgba(57,122,101,0.22)',
    },
    {
      label: 'Comfort Breeze',
      speed: 70,
      desc: 'Strong cooling for a warm room.',
      icon: Wind,
      color: 'var(--accent-primary)',
      colorDim: 'rgba(8,127,140,0.08)',
      colorBorder: 'rgba(8,127,140,0.22)',
    },
    {
      label: 'Maximum Boost',
      speed: 100,
      desc: 'Full power for rapid heat relief.',
      icon: Zap,
      color: 'var(--color-error)',
      colorDim: 'rgba(184,50,50,0.08)',
      colorBorder: 'rgba(184,50,50,0.20)',
    },
  ];

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-brand">
          <div className="icon-container icon-container-teal" style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)' }}>
            <Sliders size={20} />
          </div>
          <div>
            <h1 className="page-title">Fan Control</h1>
            <p className="page-subtitle">Ceiling fan speed, operating modes, and quick presets</p>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <ModeSelector />

      {/* Fan visualization + Speed dial */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
        <div className="card-solid" style={{
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 340,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background radial */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8,127,140,0.06) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            marginBottom: 20,
            position: 'relative',
            zIndex: 1,
          }}>
            Room Ceiling Fan
          </div>
          <FanVisualization size={258} showLabels={true} />
        </div>
        <SpeedDial />
      </div>

      {/* Quick presets */}
      <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ marginBottom: 16 }}>
          <div className="section-heading">Quick Presets</div>
          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: 4 }}>
            One-tap speed configurations for common scenarios
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {presets.map(({ label, speed, desc, icon: Icon, color, colorDim, colorBorder }) => (
            <button
              key={speed}
              onClick={() => applyPreset(speed)}
              disabled={!isConnected}
              style={{
                background: colorDim,
                border: `1.5px solid ${colorBorder}`,
                borderRadius: 'var(--radius-md)',
                padding: '18px 16px',
                textAlign: 'left',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                transition: 'all var(--transition-fast)',
                opacity: isConnected ? 1 : 0.52,
                fontFamily: 'var(--font-sans)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (isConnected) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
                  <Icon size={17} />
                  <strong style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {label}
                  </strong>
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color,
                  background: `rgba(0,0,0,0.04)`,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-display)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {speed}%
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fan speed history */}
      <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ marginBottom: 16 }}>
          <div className="section-heading">Fan Speed History</div>
          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Recent ceiling fan speed commands sent to hardware
          </div>
        </div>
        <TelemetryChart type="fans" height={200} />
      </div>
    </div>
  );
};
