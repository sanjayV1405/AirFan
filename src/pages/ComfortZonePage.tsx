import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { FanVisualization } from '../components/fan/FanVisualization';
import { ModeSelector } from '../components/controls/ModeSelector';
import { SpeedDial } from '../components/controls/SpeedDial';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Wind, Timer } from 'lucide-react';

export const ComfortZonePage: React.FC = () => {
  const { telemetry, config } = useAirLoop();

  const isOccupied = telemetry.occupancyDetected;
  const lastMotionSec = telemetry.occupancyLastMotionAt 
    ? Math.floor((Date.now() - telemetry.occupancyLastMotionAt) / 1000)
    : 0;
  const timeoutSec = config.occupancyTimeoutMinutes * 60;
  const timeRemainingSec = Math.max(0, timeoutSec - lastMotionSec);

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
          <Wind size={20} color="var(--accent-primary)" />
          <span>Comfort Zone Subsystem</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Autonomous thermal regulation powered by DHT11 &amp; HC-SR501 PIR sensor fusion.
        </p>
      </div>

      <ModeSelector />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        <SpeedDial />
        <div className="glass-panel" style={{
          padding: '20px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FanVisualization size={220} showLabels={true} />
        </div>
      </div>

      <TemperatureBandsBar />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16
      }}>
        {/* Occupancy Card */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Timer size={16} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Occupancy Watchdog
              </h3>
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
              background: isOccupied ? 'var(--color-success-dim)' : 'var(--accent-amber-dim)',
              color: isOccupied ? 'var(--color-success)' : 'var(--accent-amber)',
              border: `1px solid ${isOccupied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {isOccupied ? 'Motion Detected' : 'Room Vacant'}
            </span>
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: 10, transition: 'background-color var(--transition-fast), border-color var(--transition-fast)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Power-Save Inactivity Countdown</div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: isOccupied ? 'var(--color-success)' : 'var(--accent-amber)',
              marginTop: 2
            }}>
              {isOccupied ? 'Active (Reset)' : `${Math.floor(timeRemainingSec / 60)}m ${timeRemainingSec % 60}s`}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              After {config.occupancyTimeoutMinutes}m of vacancy, fan reduces to {config.emptyRoomSpeed}% speed.
            </div>
          </div>
        </div>

        {/* Fan PWM Speed History */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
            PWM Duty Cycle Output Log
          </h3>
          <TelemetryChart type="fans" height={160} />
        </div>
      </div>
    </div>
  );
};
