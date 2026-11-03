import React, { useMemo } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface FanVisualizationProps {
  size?: number;
  showLabels?: boolean;
}

export const FanVisualization: React.FC<FanVisualizationProps> = ({ size = 260, showLabels = true }) => {
  const { telemetry, connectionState } = useAirLoop();
  const { requestedFanSpeedPercent, hardwarePwmPercent, fanRunningState } = telemetry;

  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && fanRunningState === 'RUNNING' && requestedFanSpeedPercent > 0;

  // Spin duration: smoothly scales with confirmed percentage (100% = 0.35s, 25% = 1.2s)
  const spinDuration = useMemo(() => {
    if (!isRunning) return '0s';
    const s = Math.max(0.32, 1.8 - (requestedFanSpeedPercent / 100) * 1.45);
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
        {/* Outer Circular Ceiling Mount Ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 45% 35%, rgba(30, 41, 69, 0.4) 0%, rgba(15, 23, 42, 0.8) 75%, rgba(7, 11, 20, 0.95) 100%)',
          border: `1.5px solid ${isRunning ? 'rgba(0, 242, 254, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
          boxShadow: isRunning
            ? '0 0 35px rgba(0, 242, 254, 0.18), inset 0 0 20px rgba(0, 242, 254, 0.08)'
            : '0 8px 24px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s ease'
        }}>
          {/* Circumference Scale Ticks */}
          <svg width={size} height={size} viewBox="0 0 280 280" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i * 360) / 40;
              const rad = (angle * Math.PI) / 180;
              const r1 = 132;
              const r2 = i % 10 === 0 ? 122 : 126;
              const x1 = 140 + r1 * Math.cos(rad);
              const y1 = 140 + r1 * Math.sin(rad);
              const x2 = 140 + r2 * Math.cos(rad);
              const y2 = 140 + r2 * Math.sin(rad);
              const isSpeedActive = isRunning && (angle / 360) * 100 <= requestedFanSpeedPercent;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isSpeedActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={i % 10 === 0 ? 2 : 1}
                  strokeLinecap="round"
                  opacity={isSpeedActive ? 1 : 0.5}
                />
              );
            })}
          </svg>

          {/* Rotating Ceiling Fan Blades */}
          <div
            className={isRunning ? 'fan-spinning' : ''}
            style={{
              width: size * 0.82,
              height: size * 0.82,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animationDuration: spinDuration,
              transition: isRunning ? 'none' : 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: isRunning ? 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.6))' : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))'
            }}
          >
            <svg viewBox="0 0 220 220" width="100%" height="100%">
              <defs>
                <linearGradient id="ceilingBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#64748B" />
                  <stop offset="35%" stopColor="#475569" />
                  <stop offset="70%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <radialGradient id="ceilingHubGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="60%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0B1120" />
                </radialGradient>
              </defs>

              {/* 5 Dimensional Ceiling Fan Blades */}
              {[0, 72, 144, 216, 288].map(deg => (
                <g key={deg} transform={`rotate(${deg} 110 110)`}>
                  {/* Blade drop shadow */}
                  <path
                    d="M 110,110 C 122,86 142,50 154,20 C 158,10 148,5 136,8 C 112,14 92,45 100,92 Z"
                    fill="rgba(0, 0, 0, 0.35)"
                    transform="translate(1, 2)"
                  />
                  {/* Blade body */}
                  <path
                    d="M 110,110 C 122,86 142,50 154,20 C 158,10 148,5 136,8 C 112,14 92,45 100,92 Z"
                    fill="url(#ceilingBladeGrad)"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="0.8"
                  />
                  {/* Blade leading aerodynamic contour line */}
                  <path
                    d="M 110,110 C 120,86 136,54 146,24"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.28)"
                    strokeWidth="0.75"
                  />
                </g>
              ))}

              {/* Motor Housing & Rotor Hub */}
              <circle cx="110" cy="110" r="34" fill="url(#ceilingHubGrad)" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1.5" />
              <circle cx="110" cy="110" r="26" fill="none" stroke="rgba(0, 242, 254, 0.25)" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="110" cy="110" r="16" fill="#0B1120" stroke={isRunning ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)'} strokeWidth="1.5" />
            </svg>
          </div>

          {/* Center Digital Status Hub */}
          <div style={{
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 17, 32, 0.94)',
            backdropFilter: 'blur(8px)',
            border: `1.5px solid ${isRunning ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.12)'}`,
            borderRadius: '50%',
            width: size * 0.34,
            height: size * 0.34,
            boxShadow: isRunning
              ? '0 0 20px rgba(0, 242, 254, 0.35), inset 0 0 10px rgba(0, 242, 254, 0.15)'
              : '0 4px 12px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.35s ease'
          }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: `${Math.round(size * 0.092)}px`,
              fontWeight: 800,
              color: !isConnected ? 'var(--text-muted)' : isRunning ? 'var(--accent-primary)' : 'var(--text-primary)',
              lineHeight: 1,
              textShadow: isRunning ? '0 0 12px rgba(0, 242, 254, 0.5)' : 'none'
            }}>
              {!isConnected ? '--' : `${requestedFanSpeedPercent}%`}
            </span>
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: !isConnected ? 'var(--color-error)' : isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
              marginTop: 3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              {!isConnected ? 'OFFLINE' : isRunning ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>
        </div>
      </div>

      {showLabels && (
        <div style={{
          marginTop: 16,
          fontSize: '0.76rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <span>Speed Target: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {isConnected ? `${requestedFanSpeedPercent}%` : 'Unavailable'}
          </strong></span>
          <span style={{ opacity: 0.35 }}>•</span>
          <span>Hardware PWM: <strong style={{ color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {isConnected && hardwarePwmPercent !== null ? `${hardwarePwmPercent}%` : isConnected ? `${requestedFanSpeedPercent}%` : 'Offline'}
          </strong></span>
        </div>
      )}
    </div>
  );
};
