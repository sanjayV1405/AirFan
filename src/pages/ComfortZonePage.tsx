import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { ModeSelector } from '../components/controls/ModeSelector';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Wind, Timer, UserCheck, UserX } from 'lucide-react';

export const ComfortZonePage: React.FC = () => {
  const { telemetry, config, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const isOccupied = isConnected ? telemetry.occupancyDetected : false;
  const lastMotionSec = (isConnected && telemetry.occupancyLastMotionAt)
    ? Math.floor((Date.now() - telemetry.occupancyLastMotionAt) / 1000)
    : 0;
  const timeoutSec = config.occupancyTimeoutMinutes * 60;
  const timeRemainingSec = Math.max(0, timeoutSec - lastMotionSec);

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
          <Wind size={24} color="var(--accent-primary)" />
          <span>Room Comfort &amp; Presence</span>
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Autonomous thermal climate regulation and motion-based power-saving policies.
        </p>
      </div>

      <ModeSelector />

      {/* Temperature Comfort Spectrum */}
      <TemperatureBandsBar />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 18
      }}>
        {/* Presence & Energy Saving Card */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-success)'
              }}>
                <Timer size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Presence &amp; Energy Savings
              </h3>
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 8,
              background: !isConnected ? 'var(--surface-3)' : isOccupied ? 'var(--color-success-dim)' : 'var(--accent-amber-dim)',
              color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--accent-amber)',
              border: `1px solid ${!isConnected ? 'var(--border-subtle)' : isOccupied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {!isConnected ? 'Offline' : isOccupied ? 'Room Occupied' : 'Room Vacant'}
            </span>
          </div>

          <div style={{
            background: 'rgba(11, 17, 32, 0.65)',
            border: '1px solid var(--border-subtle)',
            padding: '18px',
            borderRadius: 14
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Energy-Saving Inactivity Countdown
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2rem',
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--accent-amber)',
              marginTop: 4
            }}>
              {!isConnected 
                ? '--:--' 
                : isOccupied 
                  ? 'Motion Active (Reset)' 
                  : `${Math.floor(timeRemainingSec / 60)}m ${timeRemainingSec % 60}s`}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.45 }}>
              After {config.occupancyTimeoutMinutes} minutes of detected vacancy, the room fan automatically throttles down to {config.emptyRoomSpeed}% speed to save power.
            </div>
          </div>
        </div>

        {/* Real-Time Temperature History Chart */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.02em' }}>
            Room Temperature Log
          </h3>
          <TelemetryChart type="temperature" height={190} />
        </div>
      </div>
    </div>
  );
};
