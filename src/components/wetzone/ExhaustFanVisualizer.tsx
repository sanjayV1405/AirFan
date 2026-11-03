import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface ExhaustFanVisualizerProps {
  size?: number;
}

export const ExhaustFanVisualizer: React.FC<ExhaustFanVisualizerProps> = ({ size = 200 }) => {
  const { telemetry, connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && telemetry.exhaustFanState;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Cylindrical Extraction Duct Housing */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 45% 35%, rgba(30, 41, 69, 0.5) 0%, rgba(15, 23, 42, 0.85) 70%, #070B14 100%)',
          border: `2px solid ${isRunning ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: isRunning
            ? '0 0 30px rgba(245, 158, 11, 0.2), inset 0 0 16px rgba(245, 158, 11, 0.1)'
            : '0 6px 20px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.35s ease'
        }}>
          {/* Duct Intake Grille Ring Lines */}
          <svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <circle cx="100" cy="100" r="88" fill="none" stroke={isRunning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.08)'} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            <circle cx="100" cy="100" r="64" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          </svg>

          {/* High-Speed Impeller Extraction Turbine */}
          <div
            className={isRunning ? 'turbine-spinning' : ''}
            style={{
              width: size * 0.72,
              height: size * 0.72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: isRunning ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.3))' : 'none',
              transition: isRunning ? 'none' : 'transform 1s ease-out'
            }}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <defs>
                <linearGradient id="turbineBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <radialGradient id="turbineHubGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#64748B" />
                  <stop offset="70%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0B1120" />
                </radialGradient>
              </defs>

              {/* 8 Curved Air-Extraction Impeller Vanes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <g key={deg} transform={`rotate(${deg} 80 80)`}>
                  <path
                    d="M 80,80 C 88,62 104,42 120,24 C 124,18 116,14 108,18 C 92,26 80,48 82,72 Z"
                    fill="url(#turbineBladeGrad)"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="0.75"
                  />
                </g>
              ))}

              {/* Central Duct Hub */}
              <circle cx="80" cy="80" r="28" fill="url(#turbineHubGrad)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.2" />
              <circle cx="80" cy="80" r="16" fill="#0B1120" stroke={isRunning ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.15)'} strokeWidth="1.5" />
            </svg>
          </div>

          {/* Central Status Readout */}
          <div style={{
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 17, 32, 0.94)',
            backdropFilter: 'blur(8px)',
            border: `1.5px solid ${isRunning ? 'var(--accent-amber)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '50%',
            width: size * 0.36,
            height: size * 0.36,
            boxShadow: isRunning ? '0 0 16px rgba(245, 158, 11, 0.35)' : 'none',
            transition: 'all 0.35s ease'
          }}>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: !isConnected ? 'var(--color-error)' : isRunning ? 'var(--accent-amber)' : 'var(--text-muted)'
            }}>
              {!isConnected ? 'OFFLINE' : isRunning ? 'EXTRACTION' : 'STANDBY'}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: isRunning ? '#F8FAFC' : 'var(--text-muted)',
              marginTop: 2
            }}>
              {isRunning ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
