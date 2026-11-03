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
          background: 'radial-gradient(circle at 38% 32%, #DFE8E4 0%, #CCD8D2 65%, #BAC8C1 100%)',
          border: `2px solid ${isRunning ? 'rgba(181, 112, 10, 0.45)' : 'var(--border-card)'}`,
          boxShadow: isRunning
            ? '0 0 22px rgba(181, 112, 10, 0.20), var(--shadow-md)'
            : 'var(--shadow-card)',
          transition: 'all 0.35s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Grille rings */}
          <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <circle cx="100" cy="100" r="88" fill="none" stroke={isRunning ? 'rgba(181, 112, 10, 0.28)' : 'rgba(29, 48, 46, 0.10)'} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(29, 48, 46, 0.08)" strokeWidth="1" />
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
            filter: 'drop-shadow(0 4px 10px rgba(29, 48, 46, 0.22))',
            transition: isRunning ? 'none' : 'transform 1s ease-out',
          }}
        >
          <svg viewBox="0 0 160 160" width="100%" height="100%">
            <defs>
              <linearGradient id="turbineGradSage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7A9490" />
                <stop offset="50%" stopColor="#526663" />
                <stop offset="100%" stopColor="#1D302E" />
              </linearGradient>
              <radialGradient id="turbineHubSage" cx="38%" cy="34%" r="65%">
                <stop offset="0%" stopColor="#8FA8A3" />
                <stop offset="65%" stopColor="#526663" />
                <stop offset="100%" stopColor="#1D302E" />
              </radialGradient>
            </defs>

            {/* 8 curved vanes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
              <g key={deg} transform={`rotate(${deg} 80 80)`}>
                <path
                  d="M 80,80 C 88,62 104,42 120,24 C 124,18 116,14 108,18 C 92,26 80,48 82,72 Z"
                  fill="url(#turbineGradSage)"
                  stroke="rgba(255,255,255,0.40)"
                  strokeWidth="0.7"
                />
              </g>
            ))}

            {/* Hub */}
            <circle cx="80" cy="80" r="28" fill="url(#turbineHubSage)" stroke="rgba(255,255,255,0.50)" strokeWidth="1.2" />
            <circle cx="80" cy="80" r="15" fill="#DFE7E2" stroke={isRunning ? 'var(--color-warning)' : 'var(--border-strong)'} strokeWidth="1.5" />
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
          background: 'var(--fan-center-badge-bg)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${isRunning ? 'rgba(181, 112, 10, 0.40)' : 'var(--border-card)'}`,
          borderRadius: '50%',
          width: size * 0.34,
          height: size * 0.34,
          boxShadow: isRunning ? '0 2px 12px rgba(181, 112, 10, 0.20)' : 'var(--shadow-card)',
          transition: 'all 0.35s ease',
        }}>
          <span style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
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
