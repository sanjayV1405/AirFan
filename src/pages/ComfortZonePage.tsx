import React from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { TemperatureBandsBar } from '../components/controls/TemperatureBandsBar';
import { ModeSelector } from '../components/controls/ModeSelector';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { Wind, Timer, UserCheck, UserX } from 'lucide-react';

export const ComfortZonePage: React.FC = () => {
  const { telemetry, config, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const isOccupied = isConnected && telemetry.occupancyDetected;
  const lastMotionSec = (isConnected && telemetry.occupancyLastMotionAt)
    ? Math.floor((Date.now() - telemetry.occupancyLastMotionAt) / 1000)
    : 0;
  const timeoutSec = config.occupancyTimeoutMinutes * 60;
  const timeRemSec = Math.max(0, timeoutSec - lastMotionSec);

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <Wind size={18} />
          </div>
          <div>
            <h1 className="page-title">Room Comfort</h1>
            <p className="page-subtitle">Temperature ranges, occupancy detection, and auto power-saving</p>
          </div>
        </div>
      </div>

      <ModeSelector />
      <TemperatureBandsBar />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>

        {/* Presence card */}
        <div className="card-solid" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`icon-container ${isOccupied ? 'icon-container-success' : 'icon-container-neutral'}`} style={{ width: 36, height: 36 }}>
                {isOccupied ? <UserCheck size={17} /> : <UserX size={17} />}
              </div>
              <div className="section-heading">Room Presence</div>
            </div>
            <span className={`badge ${!isConnected ? 'badge-neutral' : isOccupied ? 'badge-success' : 'badge-warning'}`}>
              {!isConnected ? 'Offline' : isOccupied ? 'Occupied' : 'Vacant'}
            </span>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
              Inactivity Countdown
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--color-warning)',
              lineHeight: 1,
              letterSpacing: '-0.025em',
            }}>
              {!isConnected
                ? '—'
                : isOccupied
                ? 'Active'
                : `${Math.floor(timeRemSec / 60)}m ${timeRemSec % 60}s`}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
              After {config.occupancyTimeoutMinutes} min of vacancy, the ceiling fan throttles to {config.emptyRoomSpeed}% to save energy.
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 14,
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}>
            <Timer size={14} color="var(--accent-primary)" />
            <span>Presence watchdog: {config.occupancyTimeoutMinutes} min timeout</span>
          </div>
        </div>

        {/* Temperature chart */}
        <div className="card-solid" style={{ padding: '22px' }}>
          <div className="section-heading" style={{ marginBottom: 14 }}>Temperature Log</div>
          <TelemetryChart type="temperature" height={190} />
        </div>
      </div>
    </div>
  );
};
