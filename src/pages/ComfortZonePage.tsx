import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { ModeSelector } from '../components/controls/ModeSelector';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Wind, Timer } from 'lucide-react';

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
          <Wind size={22} color="var(--accent-primary)" />
          <span>Room Comfort &amp; Climate</span>
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Autonomous thermal management and presence-based energy savings.
        </p>
      </div>

      <ModeSelector />

      {/* Temperature Comfort Spectrum */}
      <TemperatureBandsBar />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16
      }}>
        {/* Presence & Energy Saving Card */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(5, 150, 105, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-success)'
              }}>
                <Timer size={18} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Presence &amp; Energy Savings
              </h3>
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: !isConnected ? 'var(--surface-3)' : isOccupied ? 'var(--color-success-dim)' : 'var(--accent-amber-dim)',
              color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--accent-amber)',
              border: `1px solid ${!isConnected ? 'var(--border-subtle)' : isOccupied ? 'rgba(5, 150, 105, 0.25)' : 'rgba(217, 119, 6, 0.25)'}`
            }}>
              {!isConnected ? 'Offline' : isOccupied ? 'Room Occupied' : 'Room Empty'}
            </span>
          </div>

          <div style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            borderRadius: 12
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Energy-Saving Inactivity Countdown
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.7rem',
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--accent-amber)',
              marginTop: 2
            }}>
              {!isConnected 
                ? '--:--' 
                : isOccupied 
                  ? 'Motion Active' 
                  : `${Math.floor(timeRemainingSec / 60)}m ${timeRemainingSec % 60}s`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
              When the room is vacant for {config.occupancyTimeoutMinutes} minutes, the fan automatically lowers to {config.emptyRoomSpeed}% to conserve electricity.
            </div>
          </div>
        </div>

        {/* Real-Time Temperature Log */}
        <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Temperature History
          </h3>
          <TelemetryChart type="temperature" height={180} />
        </div>
      </div>
    </div>
  );
};
