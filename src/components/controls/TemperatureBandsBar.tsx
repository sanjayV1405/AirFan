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
    if (currentTemp < config.tempCoolMax) return 'Cool Room';
    if (currentTemp < config.tempComfortMax) return 'Comfortable Temperature';
    if (currentTemp < config.tempWarmMax) return 'Warm Room';
    return 'Hot Room';
  };

  const getComfortColor = () => {
    if (!isConnected || currentTemp === null) return 'var(--text-muted)';
    if (currentTemp < config.tempCoolMax) return '#0284C7';
    if (currentTemp < config.tempComfortMax) return '#059669';
    if (currentTemp < config.tempWarmMax) return '#D97706';
    return '#DC2626';
  };

  return (
    <div className="glass-panel" style={{
      padding: '22px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(8, 145, 178, 0.08)',
            border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <Thermometer size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Room Comfort Indicator
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Temperature spectrum &amp; climate status
            </span>
          </div>
        </div>

        <span style={{
          padding: '4px 10px',
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 700,
          background: isConnected ? 'rgba(5, 150, 105, 0.08)' : 'var(--surface-3)',
          color: getComfortColor(),
          border: `1px solid ${isConnected ? 'rgba(5, 150, 105, 0.2)' : 'var(--border-subtle)'}`
        }}>
          {getComfortLabel()}
        </span>
      </div>

      {/* Spectrum Bar */}
      <div style={{ position: 'relative', marginTop: 32, marginBottom: 28, opacity: isConnected ? 1 : 0.6 }}>
        {/* Needle Marker */}
        {isConnected && currentTemp !== null && (
          <div style={{
            position: 'absolute',
            left: `${positionPct}%`,
            top: -26,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'left var(--transition-normal)',
            zIndex: 10
          }}>
            <div style={{
              background: '#FFFFFF',
              border: `1.5px solid ${getComfortColor()}`,
              color: getComfortColor(),
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 6,
              boxShadow: 'var(--shadow-sm)',
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
          background: 'var(--surface-3)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <div style={{ background: '#38BDF8', opacity: currentTemp !== null && currentTemp < config.tempCoolMax ? 1 : 0.45 }} />
          <div style={{ background: '#10B981', opacity: currentTemp !== null && currentTemp >= config.tempCoolMax && currentTemp < config.tempComfortMax ? 1 : 0.45 }} />
          <div style={{ background: '#F59E0B', opacity: currentTemp !== null && currentTemp >= config.tempComfortMax && currentTemp < config.tempWarmMax ? 1 : 0.45 }} />
          <div style={{ background: '#EF4444', opacity: currentTemp !== null && currentTemp >= config.tempWarmMax ? 1 : 0.45 }} />
        </div>

        {/* Labels below */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: 8,
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}>
          <div>Cool (&lt;26°)</div>
          <div style={{ textAlign: 'center' }}>Comfort (26–29°)</div>
          <div style={{ textAlign: 'center' }}>Warm (29–32°)</div>
          <div style={{ textAlign: 'right' }}>Hot (≥32°)</div>
        </div>
      </div>

      {/* Friendly Room Status and Presence Summary */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)'
      }}>
        <span>
          {isConnected 
            ? (isOccupied ? 'Room is currently occupied. Fan is regulating active airflow.' : 'No motion detected in room.')
            : 'Hardware is not currently transmitting sensor readings.'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          {isOccupied 
            ? <UserCheck size={16} color="var(--color-success)" /> 
            : <UserX size={16} color="var(--text-muted)" />}
          <span style={{ color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)' }}>
            {isOccupied ? 'Room Occupied' : 'Room Empty'}
          </span>
        </span>
      </div>
    </div>
  );
};
