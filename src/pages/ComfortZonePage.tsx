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
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-brand">
          <div className="icon-container icon-container-teal" style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)' }}>
            <Wind size={20} />
          </div>
          <div>
            <h1 className="page-title">Room Comfort</h1>
            <p className="page-subtitle">Temperature ranges, occupancy presence, and automated power-saving</p>
          </div>
        </div>
      </div>

      <ModeSelector />
      <TemperatureBandsBar />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>

        {/* Presence card */}
        <div className="card-solid" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`icon-container ${isOccupied ? 'icon-container-success' : 'icon-container-neutral'}`} style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)' }}>
                {isOccupied ? <UserCheck size={18} /> : <UserX size={18} />}
              </div>
              <div className="section-heading">Room Presence &amp; Timeout</div>
            </div>
            <span className={`badge ${!isConnected ? 'badge-neutral' : isOccupied ? 'badge-success' : 'badge-warning'}`}>
              {!isConnected ? 'Offline' : isOccupied ? 'Occupied' : 'Vacant'}
            </span>
          </div>

          <div style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Inactivity Countdown
            </div>
            <div className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : isOccupied ? 'var(--color-success)' : 'var(--color-warning)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}>
              {!isConnected
                ? '—'
                : isOccupied
                ? 'Active Presence'
                : `${Math.floor(timeRemSec / 60)}m ${timeRemSec % 60}s`}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
              After {config.occupancyTimeoutMinutes} min of vacancy, the ceiling fan automatically scales down to {config.emptyRoomSpeed}% to save power.
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            marginTop: 16,
            fontSize: '0.80rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            <Timer size={15} color="var(--accent-primary)" />
            <span>Presence watchdog: {config.occupancyTimeoutMinutes} min automatic timeout</span>
          </div>
        </div>

        {/* Temperature chart */}
        <div className="card-solid" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 14 }}>
            <div className="section-heading">Temperature History</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Comfort readings recorded over time
            </div>
          </div>
          <TelemetryChart type="temperature" height={210} />
        </div>
      </div>
    </div>
  );
};
