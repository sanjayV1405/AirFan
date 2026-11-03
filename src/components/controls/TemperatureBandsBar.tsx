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
    if (!isConnected || currentTemp === null) return 'Hardware Offline';
    if (currentTemp < config.tempCoolMax) return 'Cool Environment';
    if (currentTemp < config.tempComfortMax) return 'Comfortable Temperature';
    if (currentTemp < config.tempWarmMax) return 'Warm Room';
    return 'Hot Room';
  };

  const getComfortColor = () => {
    if (!isConnected || currentTemp === null) return 'var(--text-muted)';
    if (currentTemp < config.tempCoolMax) return '#38BDF8';
    if (currentTemp < config.tempComfortMax) return '#10B981';
    if (currentTemp < config.tempWarmMax) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      borderRadius: '18px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#38BDF8',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.14)'
          }}>
            <Thermometer size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Temperature Comfort Spectrum
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Target ranges &amp; presence status
            </span>
          </div>
        </div>

        <span style={{
          padding: '5px 12px',
          borderRadius: 8,
          fontSize: '0.76rem',
          fontWeight: 800,
          background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-3)',
          color: getComfortColor(),
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.28)' : 'var(--border-subtle)'}`,
          boxShadow: isConnected ? `0 0 14px ${getComfortColor()}25` : 'none'
        }}>
          {getComfortLabel()}
        </span>
      </div>

      {/* Spectrum Bar */}
      <div style={{ position: 'relative', marginTop: 34, marginBottom: 28, opacity: isConnected ? 1 : 0.55 }}>
        {/* Needle Marker */}
        {isConnected && currentTemp !== null && (
          <div style={{
            position: 'absolute',
            left: `${positionPct}%`,
            top: -28,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left var(--transition-normal)',
            zIndex: 10
          }}>
            <div style={{
              background: '#0B1120',
              border: `1.5px solid ${getComfortColor()}`,
              color: getComfortColor(),
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 6,
              boxShadow: `0 0 16px ${getComfortColor()}40`,
              fontFamily: 'var(--font-mono)'
            }}>
              {currentTemp.toFixed(1)}°C
            </div>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `5px solid ${getComfortColor()}`,
              marginTop: 1
            }} />
          </div>
        )}

        {/* Multi-segmented Track */}
        <div style={{
          height: 10,
          borderRadius: 6,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          overflow: 'hidden',
          background: 'rgba(11, 17, 32, 0.8)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ background: '#38BDF8', opacity: currentTemp !== null && currentTemp < config.tempCoolMax ? 1 : 0.4 }} />
          <div style={{ background: '#10B981', opacity: currentTemp !== null && currentTemp >= config.tempCoolMax && currentTemp < config.tempComfortMax ? 1 : 0.4 }} />
          <div style={{ background: '#F59E0B', opacity: currentTemp !== null && currentTemp >= config.tempComfortMax && currentTemp < config.tempWarmMax ? 1 : 0.4 }} />
          <div style={{ background: '#EF4444', opacity: currentTemp !== null && currentTemp >= config.tempWarmMax ? 1 : 0.4 }} />
        </div>

        {/* Labels below */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: 8,
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          fontWeight: 700
        }}>
          <div>Cool (&lt;26°)</div>
          <div style={{ textAlign: 'center' }}>Comfort (26–29°)</div>
          <div style={{ textAlign: 'center' }}>Warm (29–32°)</div>
          <div style={{ textAlign: 'right' }}>Hot (≥32°)</div>
        </div>
      </div>

      {/* Room Status and Presence Summary */}
      <div style={{
        background: 'rgba(11, 17, 32, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        <span>
          {isConnected 
            ? (isOccupied ? 'Room is currently occupied. Ceiling fan is active.' : 'No motion detected in room. Power-saving countdown running.')
            : 'Hardware is not currently transmitting sensor readings.'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800 }}>
          {isOccupied 
            ? <UserCheck size={17} color="var(--color-success)" /> 
            : <UserX size={17} color="var(--text-muted)" />}
          <span style={{ color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isOccupied ? 'Room Occupied' : 'Room Vacant'}
          </span>
        </span>
      </div>
    </div>
  );
};
