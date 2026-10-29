import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { Thermometer, UserCheck, UserX } from 'lucide-react';

export const TemperatureBandsBar: React.FC = () => {
  const { telemetry, config } = useAirLoop();
  const currentTemp = telemetry.comfortTemperatureC;

  const minScale = 20;
  const maxScale = 36;
  const positionPct = currentTemp !== null 
    ? Math.max(0, Math.min(100, ((currentTemp - minScale) / (maxScale - minScale)) * 100))
    : 50;

  const isOccupied = telemetry.occupancyDetected;

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Thermometer size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Temperature Response Spectrum
          </h3>
        </div>

        <span style={{
          padding: '2px 8px',
          borderRadius: 6,
          fontSize: '0.72rem',
          fontWeight: 600,
          background: telemetry.activeTemperatureBand === 'COOL' ? 'var(--color-info-dim)' :
                      telemetry.activeTemperatureBand === 'COMFORT' ? 'var(--accent-primary-dim)' :
                      telemetry.activeTemperatureBand === 'WARM' ? 'var(--accent-amber-dim)' : 'var(--color-error-dim)',
          color: telemetry.activeTemperatureBand === 'COOL' ? 'var(--color-info)' :
                 telemetry.activeTemperatureBand === 'COMFORT' ? 'var(--accent-primary)' :
                 telemetry.activeTemperatureBand === 'WARM' ? 'var(--accent-amber)' : 'var(--color-error)',
          border: `1px solid ${
            telemetry.activeTemperatureBand === 'COOL' ? 'rgba(37, 99, 235, 0.3)' :
            telemetry.activeTemperatureBand === 'COMFORT' ? 'var(--border-accent)' :
            telemetry.activeTemperatureBand === 'WARM' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'
          }`
        }}>
          {telemetry.activeTemperatureBand} BAND
        </span>
      </div>

      {/* Spectrum Bar */}
      <div style={{ position: 'relative', marginTop: 28, marginBottom: 26 }}>
        {/* Needle Marker */}
        <div style={{
          position: 'absolute',
          left: `${positionPct}%`,
          top: -24,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'left var(--transition-normal)',
          zIndex: 10
        }}>
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 4,
            boxShadow: '0 0 10px var(--accent-primary-glow)',
            fontFamily: 'var(--font-mono)'
          }}>
            {currentTemp !== null ? `${currentTemp}°C` : '--'}
          </div>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '5px solid var(--accent-primary)',
            marginTop: 1
          }} />
        </div>

        {/* Multi-segmented Track */}
        <div style={{
          height: 8,
          borderRadius: 4,
          display: 'grid',
          gridTemplateColumns: `${((config.tempCoolMax - minScale)/(maxScale - minScale))*100}% ${((config.tempComfortMax - config.tempCoolMax)/(maxScale - minScale))*100}% ${((config.tempWarmMax - config.tempComfortMax)/(maxScale - minScale))*100}% ${((maxScale - config.tempWarmMax)/(maxScale - minScale))*100}%`,
          overflow: 'hidden',
          background: 'var(--surface-3)'
        }}>
          <div style={{ background: '#38BDF8', opacity: telemetry.activeTemperatureBand === 'COOL' ? 1 : 0.4 }} />
          <div style={{ background: 'var(--accent-primary)', opacity: telemetry.activeTemperatureBand === 'COMFORT' ? 1 : 0.4 }} />
          <div style={{ background: '#F59E0B', opacity: telemetry.activeTemperatureBand === 'WARM' ? 1 : 0.4 }} />
          <div style={{ background: '#EF4444', opacity: telemetry.activeTemperatureBand === 'HOT' ? 1 : 0.4 }} />
        </div>

        {/* Labels below */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: 8,
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}>
          <div>Cool (&lt;26°)</div>
          <div style={{ textAlign: 'center' }}>Comfort (26-29°)</div>
          <div style={{ textAlign: 'center' }}>Warm (29-32°)</div>
          <div style={{ textAlign: 'right' }}>Hot (≥32°)</div>
        </div>
      </div>

      {/* Rationale and Occupancy */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        <span style={{ fontStyle: 'italic' }}>"{telemetry.controllerReason}"</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
          {isOccupied ? <UserCheck size={14} color="var(--color-success)" /> : <UserX size={14} color="var(--text-muted)" />}
          <span style={{ color: isOccupied ? 'var(--color-success)' : 'var(--text-muted)' }}>{isOccupied ? 'Occupied' : 'Vacant'}</span>
        </span>
      </div>
    </div>
  );
};
