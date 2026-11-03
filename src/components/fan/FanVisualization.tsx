import React, { useMemo } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface FanVisualizationProps {
  size?: number;
  showLabels?: boolean;
}

export const FanVisualization: React.FC<FanVisualizationProps> = ({ size = 230, showLabels = true }) => {
  const { telemetry, connectionState } = useAirLoop();
  const { requestedFanSpeedPercent, hardwarePwmPercent, fanRunningState } = telemetry;

  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && fanRunningState === 'RUNNING' && requestedFanSpeedPercent > 0;

  // Spin duration inversely proportional to speed: 100% = 0.28s, 25% = 1.1s
  const spinDuration = useMemo(() => {
    if (!isRunning) return '0s';
    const s = Math.max(0.28, 1.8 - (requestedFanSpeedPercent / 100) * 1.5);
    return `${s.toFixed(2)}s`;
  }, [isRunning, requestedFanSpeedPercent]);

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
        {/* Outer 3D Housing / Dimensional Metallic Ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F1F5F9 55%, #E2E8F0 100%)',
          border: `2px solid ${isRunning ? 'var(--accent-primary)' : '#CBD5E1'}`,
          boxShadow: isRunning
            ? '0 10px 25px -4px rgba(8, 145, 178, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(15, 23, 42, 0.08)'
            : '0 4px 14px rgba(15, 23, 42, 0.05), inset 0 2px 4px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s ease'
        }}>
          {/* Outer Housing Circumference Ticks */}
          <svg width={size} height={size} viewBox="0 0 260 260" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 32 }).map((_, i) => {
              const angle = (i * 360) / 32;
              const rad = (angle * Math.PI) / 180;
              const r1 = 124;
              const r2 = i % 8 === 0 ? 116 : 120;
              const x1 = 130 + r1 * Math.cos(rad);
              const y1 = 130 + r1 * Math.sin(rad);
              const x2 = 130 + r2 * Math.cos(rad);
              const y2 = 130 + r2 * Math.sin(rad);
              const isSpeedActive = isRunning && (angle / 360) * 100 <= requestedFanSpeedPercent;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isSpeedActive ? 'var(--accent-primary)' : '#CBD5E1'}
                  strokeWidth={i % 8 === 0 ? 2 : 1}
                  strokeLinecap="round"
                  opacity={isSpeedActive ? 1 : 0.6}
                />
              );
            })}
          </svg>

          {/* Aerodynamic Rotating Blades */}
          <div
            className={isRunning ? 'fan-spinning' : ''}
            style={{
              width: size * 0.78,
              height: size * 0.78,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animationDuration: spinDuration,
              transition: isRunning ? 'none' : 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: isRunning ? 'drop-shadow(0 4px 6px rgba(15, 23, 42, 0.12))' : 'drop-shadow(0 2px 3px rgba(15, 23, 42, 0.08))'
            }}
          >
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <defs>
                <linearGradient id="blade3DGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="45%" stopColor="#64748B" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
                <radialGradient id="hub3DGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </radialGradient>
              </defs>

              {/* 5 Dimensional Aerodynamic Blades */}
              {[0, 72, 144, 216, 288].map(deg => (
                <g key={deg} transform={`rotate(${deg} 100 100)`}>
                  <path
                    d="M 100,100 C 114,75 132,40 142,16 C 146,8 138,4 126,7 C 102,12 84,40 91,84 Z"
                    fill="url(#blade3DGrad)"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="0.75"
                  />
                  {/* Blade air-foil ridge highlight */}
                  <path
                    d="M 100,100 C 110,75 125,44 135,20"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="0.8"
                  />
                </g>
              ))}

              {/* Dimensional Aluminum Hub */}
              <circle cx="100" cy="100" r="32" fill="url(#hub3DGrad)" stroke="#CBD5E1" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="24" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="100" cy="100" r="14" fill="#FFFFFF" stroke={isRunning ? 'var(--accent-primary)' : '#CBD5E1'} strokeWidth="1.5" />
            </svg>
          </div>

          {/* Center Digital Hub Display */}
          <div style={{
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            border: `1.5px solid ${isRunning ? 'var(--accent-primary)' : '#E2E8F0'}`,
            borderRadius: '50%',
            width: size * 0.32,
            height: size * 0.32,
            boxShadow: isRunning
              ? '0 4px 12px rgba(8, 145, 178, 0.18)'
              : '0 2px 8px rgba(15, 23, 42, 0.06)',
            transition: 'all 0.35s ease'
          }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: `${Math.round(size * 0.088)}px`,
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : isRunning ? 'var(--accent-primary)' : 'var(--text-primary)',
              lineHeight: 1
            }}>
              {!isConnected ? '--' : `${requestedFanSpeedPercent}%`}
            </span>
            <span style={{
              fontSize: '0.58rem',
              fontWeight: 700,
              color: !isConnected ? 'var(--color-error)' : isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
              marginTop: 3,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              {!isConnected ? 'OFFLINE' : isRunning ? 'RUNNING' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {showLabels && (
        <div style={{
          marginTop: 14,
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span>Speed Target: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {isConnected ? `${requestedFanSpeedPercent}%` : 'Unavailable'}
          </strong></span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span>Hardware Output: <strong style={{ color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {isConnected && hardwarePwmPercent !== null ? `${hardwarePwmPercent}%` : isConnected ? `${requestedFanSpeedPercent}%` : 'Offline'}
          </strong></span>
        </div>
      )}
    </div>
  );
};
