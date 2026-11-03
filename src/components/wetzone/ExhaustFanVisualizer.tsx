import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface ExhaustFanVisualizerProps {
  size?: number;
}

export const ExhaustFanVisualizer: React.FC<ExhaustFanVisualizerProps> = ({ size = 160 }) => {
  const { telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && telemetry.exhaustFanState;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer housing */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, #E5ECF4 0%, #D4DFE8 65%, #C0CDD8 100%)',
          border: `2px solid ${isRunning ? 'rgba(192, 123, 43, 0.45)' : 'rgba(23, 38, 59, 0.12)'}`,
          boxShadow: isRunning
            ? '0 0 22px rgba(192, 123, 43, 0.16), var(--shadow-md)'
            : 'var(--shadow-md)',
          transition: 'all 0.35s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Grille rings */}
          <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <circle cx="100" cy="100" r="88" fill="none" stroke={isRunning ? 'rgba(192, 123, 43, 0.25)' : 'rgba(23, 38, 59, 0.08)'} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(23, 38, 59, 0.06)" strokeWidth="1" />
          </svg>
        </div>

        {/* Spinning turbine */}
        <div
          className={isRunning ? 'turbine-spinning' : ''}
          style={{
            width: size * 0.70,
            height: size * 0.70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 4px 10px rgba(23, 38, 59, 0.18))',
            transition: isRunning ? 'none' : 'transform 1s ease-out',
          }}
        >
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <defs>
              <linearGradient id="turbineGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9EB3C8" />
                <stop offset="50%" stopColor="#617187" />
                <stop offset="100%" stopColor="#3D4F63" />
              </linearGradient>
              <radialGradient id="turbineHubLight" cx="38%" cy="34%" r="65%">
                <stop offset="0%" stopColor="#A8BDD0" />
                <stop offset="65%" stopColor="#617187" />
                <stop offset="100%" stopColor="#3D4F63" />
              </radialGradient>
            </defs>

            {/* 8 curved vanes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <g key={deg} transform={`rotate(${deg} 80 80)`}>
                <path
                  d="M 80,80 C 88,62 104,42 120,24 C 124,18 116,14 108,18 C 92,26 80,48 82,72 Z"
                  fill="url(#turbineGradLight)"
                  stroke="rgba(255,255,255,0.40)"
                  strokeWidth="0.7"
                />
              </g>
            ))}

            {/* Hub */}
            <circle cx="80" cy="80" r="28" fill="url(#turbineHubLight)" stroke="rgba(255,255,255,0.50)" strokeWidth="1.2" />
            <circle cx="80" cy="80" r="15" fill="#E5ECF4" stroke={isRunning ? '#C07B2B' : 'rgba(23, 38, 59, 0.18)'} strokeWidth="1.5" />
          </svg>
        </div>

        {/* Center status */}
        <div style={{
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(250, 252, 254, 0.96)',
          backdropFilter: 'blur(6px)',
          border: `1.5px solid ${isRunning ? 'rgba(192, 123, 43, 0.38)' : 'rgba(23, 38, 59, 0.10)'}`,
          borderRadius: '50%',
          width: size * 0.34,
          height: size * 0.34,
          boxShadow: isRunning ? '0 2px 12px rgba(192, 123, 43, 0.18)' : 'var(--shadow-xs)',
          transition: 'all 0.35s ease',
        }}>
          <span style={{
            fontSize: '0.54rem',
            fontWeight: 700,
            letterSpacing: '0.07em',
            color: !isConnected ? 'var(--color-error)' : isRunning ? 'var(--color-warning)' : 'var(--text-muted)',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            {!isConnected ? 'OFF' : isRunning ? 'ON' : 'IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};
