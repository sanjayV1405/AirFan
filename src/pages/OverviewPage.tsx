import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Thermometer, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { telemetry, setActiveNav } = useAirLoop();

  const isOccupied = telemetry.occupancyDetected;
  const temp = telemetry.comfortTemperatureC;
  const humidity = telemetry.comfortHumidityPercent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200, margin: '0 auto' }}>
      {/* Dual Hero Cards: Room Climate & Visualizer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        {/* Climate Telemetry Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                <Thermometer size={16} color="var(--accent-primary)" />
                <span>Comfort Node Environment</span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--color-success)',
                background: 'var(--color-success-dim)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '2px 8px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <ShieldCheck size={12} />
                DHT11 ACTIVE
              </span>
            </div>

            {/* Large Temperature Readout */}
            <div style={{ margin: '8px 0 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="tabular-nums" style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1
                }}>
                  {temp !== null ? temp.toFixed(1) : '--.-'}
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  °C
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                Regulation reason: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{telemetry.controllerReason}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Humidity</div>
              <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {humidity !== null ? `${humidity}%` : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PIR Presence</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)',
                marginTop: 2
              }}>
                {isOccupied ? 'Occupied' : 'Vacant'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Exhaust Status</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: telemetry.exhaustFanState ? 'var(--accent-amber)' : 'var(--text-muted)',
                marginTop: 2
              }}>
                {telemetry.exhaustFanState ? 'Running' : 'Standby'}
              </div>
            </div>
          </div>
        </div>

        {/* Fan Visualization Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FanVisualization size={210} showLabels={true} />
        </div>
      </div>

      {/* Operating Mode Selector */}
      <ModeSelector />

      {/* Speed Dial & Temperature Response */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        <SpeedDial />
        <TemperatureBandsBar />
      </div>

      {/* Real-Time Telemetry Stream Chart */}
      <div className="glass-panel" style={{
        padding: '20px',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Real-Time Temperature Stream
            </h3>
          </div>
          <button
            onClick={() => setActiveNav('history')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer'
            }}
          >
            <span>Telemetry History</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <TelemetryChart type="temperature" height={200} />
      </div>
    </div>
  );
};
