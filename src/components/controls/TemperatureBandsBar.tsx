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
    if (currentTemp < config.tempCoolMax) return '#3979D8';
    if (currentTemp < config.tempComfortMax) return '#1A9E6A';
    if (currentTemp < config.tempWarmMax) return '#C07B2B';
    return '#C0392B';
  };

  const getComfortBg = () => {
    if (!isConnected || currentTemp === null) return 'var(--bg-secondary)';
    if (currentTemp < config.tempCoolMax) return 'rgba(57, 121, 216, 0.09)';
    if (currentTemp < config.tempComfortMax) return 'rgba(26, 158, 106, 0.09)';
    if (currentTemp < config.tempWarmMax) return 'rgba(192, 123, 43, 0.09)';
    return 'rgba(192, 57, 43, 0.09)';
  };

  return (
    <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-blue" style={{ width: 36, height: 36 }}>
            <Thermometer size={18} />
          </div>
          <div>
            <div className="section-heading">Temperature Range</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 1 }}>
              Comfort zones & presence
            </div>
          </div>
        </div>

        <span style={{
          padding: '5px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.76rem',
          fontWeight: 600,
          background: getComfortBg(),
          color: getComfortColor(),
          border: `1px solid ${getComfortColor()}30`,
        }}>
          {getComfortLabel()}
        </span>
      </div>

      {/* Spectrum Bar */}
      <div style={{ position: 'relative', marginTop: 32, marginBottom: 26, opacity: isConnected ? 1 : 0.5 }}>
        {/* Needle */}
        {isConnected && currentTemp !== null && (
          <div style={{
            position: 'absolute',
            left: `${positionPct}%`,
            top: -30,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left var(--transition-normal)',
            zIndex: 10,
          }}>
            <div style={{
              background: '#FAFCFE',
              border: `1.5px solid ${getComfortColor()}`,
              color: getComfortColor(),
              fontSize: '0.76rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              boxShadow: 'var(--shadow-sm)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}>
              {currentTemp.toFixed(1)}°C
            </div>
            <div style={{
              width: 0, height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `5px solid ${getComfortColor()}`,
              marginTop: 1,
            }} />
          </div>
        )}

        {/* Color track */}
        <div style={{
          height: 10,
          borderRadius: 6,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-inset)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ background: '#3979D8', opacity: currentTemp !== null && currentTemp < config.tempCoolMax ? 1 : 0.35 }} />
          <div style={{ background: '#1A9E6A', opacity: currentTemp !== null && currentTemp >= config.tempCoolMax && currentTemp < config.tempComfortMax ? 1 : 0.35 }} />
          <div style={{ background: '#C07B2B', opacity: currentTemp !== null && currentTemp >= config.tempComfortMax && currentTemp < config.tempWarmMax ? 1 : 0.35 }} />
          <div style={{ background: '#C0392B', opacity: currentTemp !== null && currentTemp >= config.tempWarmMax ? 1 : 0.35 }} />
        </div>

        {/* Labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: 7,
          fontSize: '0.70rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          <div>Cool</div>
          <div style={{ textAlign: 'center' }}>Comfort</div>
          <div style={{ textAlign: 'center' }}>Warm</div>
          <div style={{ textAlign: 'right' }}>Hot</div>
        </div>
      </div>

      {/* Occupancy row */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {isConnected
            ? (isOccupied
              ? 'Room is occupied — fan is active to maintain comfort.'
              : 'No motion detected — power-saving mode.')
            : 'Waiting for hardware to connect.'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.82rem' }}>
          {isOccupied
            ? <UserCheck size={16} color="var(--color-success)" />
            : <UserX size={16} color="var(--text-muted)" />}
          <span style={{ color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isOccupied ? 'Occupied' : 'Vacant'}
          </span>
        </div>
      </div>
    </div>
  );
};
