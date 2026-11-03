import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Thermometer, UserCheck, UserX } from 'lucide-react';

export const TemperatureBandsBar: React.FC = () => {
  const { telemetry, config, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';
  const currentTemp = isConnected ? telemetry.comfortTemperatureC : null;

  const minScale = 20;
  const maxScale = 36;
  const positionPct = currentTemp !== null
    ? Math.max(0, Math.min(100, ((currentTemp - minScale) / (maxScale - minScale)) * 100))
    : 50;

  const isOccupied = isConnected ? telemetry.occupancyDetected : false;

  const getComfortLabel = () => {
    if (!isConnected || currentTemp === null) return 'Sensor Offline';
    if (currentTemp < config.tempCoolMax) return 'Cool';
    if (currentTemp < config.tempComfortMax) return 'Comfortable';
    if (currentTemp < config.tempWarmMax) return 'Warm';
    return 'Hot';
  };

  const getComfortColor = () => {
    if (!isConnected || currentTemp === null) return 'var(--text-muted)';
    if (currentTemp < config.tempCoolMax) return 'var(--color-info)';
    if (currentTemp < config.tempComfortMax) return 'var(--color-success)';
    if (currentTemp < config.tempWarmMax) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getComfortBg = () => {
    if (!isConnected || currentTemp === null) return 'var(--bg-secondary)';
    if (currentTemp < config.tempCoolMax) return 'var(--color-info-dim)';
    if (currentTemp < config.tempComfortMax) return 'var(--color-success-bg)';
    if (currentTemp < config.tempWarmMax) return 'var(--color-warning-bg)';
    return 'var(--color-error-bg)';
  };

  return (
    <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-blue" style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)' }}>
            <Thermometer size={18} />
          </div>
          <div>
            <div className="section-heading">Temperature Spectrum</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Comfort threshold monitoring & occupancy
            </div>
          </div>
        </div>

        <span style={{
          padding: '5px 13px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.74rem',
          fontWeight: 700,
          background: getComfortBg(),
          color: getComfortColor(),
          border: `1.5px solid ${getComfortColor()}35`,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {getComfortLabel()}
        </span>
      </div>

      {/* Spectrum Bar */}
      <div style={{ position: 'relative', marginTop: 34, marginBottom: 28, opacity: isConnected ? 1 : 0.5 }}>
        {/* Needle */}
        {isConnected && currentTemp !== null && (
          <div style={{
            position: 'absolute',
            left: `${positionPct}%`,
            top: -32,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left var(--transition-normal)',
            zIndex: 10,
          }}>
            <div style={{
              background: 'var(--surface-card)',
              border: `1.5px solid ${getComfortColor()}`,
              color: getComfortColor(),
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              boxShadow: 'var(--shadow-sm)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}>
              {currentTemp.toFixed(1)}°C
            </div>
            <div style={{
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `6px solid ${getComfortColor()}`,
              marginTop: 1,
            }} />
          </div>
        )}

        {/* Color track */}
        <div style={{
          height: 12,
          borderRadius: 6,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-inset)',
          border: '1.5px solid var(--border-card)',
        }}>
          <div style={{ background: '#2F6FB5', opacity: currentTemp !== null && currentTemp < config.tempCoolMax ? 1 : 0.40 }} />
          <div style={{ background: '#1B8A5A', opacity: currentTemp !== null && currentTemp >= config.tempCoolMax && currentTemp < config.tempComfortMax ? 1 : 0.40 }} />
          <div style={{ background: '#B5700A', opacity: currentTemp !== null && currentTemp >= config.tempComfortMax && currentTemp < config.tempWarmMax ? 1 : 0.40 }} />
          <div style={{ background: '#B83232', opacity: currentTemp !== null && currentTemp >= config.tempWarmMax ? 1 : 0.40 }} />
        </div>

        {/* Labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: 8,
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
        }}>
          <div>Cool (&lt;26°C)</div>
          <div style={{ textAlign: 'center' }}>Comfort (26–29°C)</div>
          <div style={{ textAlign: 'center' }}>Warm (29–32°C)</div>
          <div style={{ textAlign: 'right' }}>Hot (&gt;32°C)</div>
        </div>
      </div>

      {/* Occupancy row */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {isConnected
            ? (isOccupied
              ? 'Room is occupied — fan is active to maintain personal comfort.'
              : 'No motion detected — power-saving standby active.')
            : 'Waiting for hardware to connect.'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: '0.84rem' }}>
          {isOccupied
            ? <UserCheck size={17} color="var(--color-success)" />
            : <UserX size={17} color="var(--text-muted)" />}
          <span style={{ color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isOccupied ? 'Occupied' : 'Vacant'}
          </span>
        </div>
      </div>
    </div>
  );
};
