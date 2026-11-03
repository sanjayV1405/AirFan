import React, { useMemo } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface FanVisualizationProps {
  size?: number;
  showLabels?: boolean;
}

export const FanVisualization: React.FC<FanVisualizationProps> = ({ size = 240, showLabels = true }) => {
  const { telemetry, connectionState } = useAirLoop();
  const { requestedFanSpeedPercent, hardwarePwmPercent, fanRunningState } = telemetry;

  const isConnected = connectionState === 'connected';
  const isRunning = isConnected && fanRunningState === 'RUNNING' && requestedFanSpeedPercent > 0;

  const spinDuration = useMemo(() => {
    if (!isRunning) return '0s';
    const s = Math.max(0.35, 1.9 - (requestedFanSpeedPercent / 100) * 1.55);
    return `${s.toFixed(2)}s`;
  }, [isRunning, requestedFanSpeedPercent]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Outer Housing Ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'var(--fan-housing-bg)',
          border: `2px solid ${isRunning ? 'var(--accent-primary)' : 'var(--border-card)'}`,
          boxShadow: isRunning
            ? '0 0 28px rgba(8, 127, 140, 0.20), var(--shadow-md)'
            : 'var(--shadow-card)',
          transition: 'all 0.45s ease',
        }}>
          {/* Scale ticks */}
          <svg width={size} height={size} viewBox="0 0 280 280" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i * 360) / 40;
              const rad = (angle * Math.PI) / 180;
              const r1 = 133;
              const r2 = i % 10 === 0 ? 121 : 125;
              const x1 = 140 + r1 * Math.cos(rad);
              const y1 = 140 + r1 * Math.sin(rad);
              const x2 = 140 + r2 * Math.cos(rad);
              const y2 = 140 + r2 * Math.sin(rad);
              const active = isRunning && (angle / 360) * 100 <= requestedFanSpeedPercent;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={active ? 'var(--accent-primary)' : 'var(--border-medium)'}
                  strokeWidth={i % 10 === 0 ? 2.2 : 1.2}
                  strokeLinecap="round"
                  opacity={active ? 0.95 : 0.45}
                />
              );
            })}
          </svg>
        </div>

        {/* Rotating Blades */}
        <div
          className={isRunning ? 'fan-spinning' : ''}
          style={{
            width: size * 0.80,
            height: size * 0.80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animationDuration: spinDuration,
            transition: isRunning ? 'none' : 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 6px 14px rgba(29, 48, 46, 0.22))',
          }}
        >
          <svg viewBox="0 0 220 220" width="100%" height="100%">
            <defs>
              <linearGradient id="bladeGradSage" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#526663" />
                <stop offset="40%" stopColor="#397A65" />
                <stop offset="75%" stopColor="#244D40" />
                <stop offset="100%" stopColor="#1D302E" />
              </linearGradient>
              <radialGradient id="hubGradSage" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#7A9490" />
                <stop offset="55%" stopColor="#397A65" />
                <stop offset="100%" stopColor="#1D302E" />
              </radialGradient>
            </defs>

            {/* 5 Blades */}
            {[0, 72, 144, 216, 288].map(deg => (
              <g key={deg} transform={`rotate(${deg} 110 110)`}>
                {/* Blade shadow */}
                <path
                  d="M 110,110 C 122,86 142,50 154,20 C 158,10 148,5 136,8 C 112,14 92,45 100,92 Z"
                  fill="rgba(29, 48, 46, 0.18)"
                  transform="translate(1.5, 2)"
                />
                {/* Blade body */}
                <path
                  d="M 110,110 C 122,86 142,50 154,20 C 158,10 148,5 136,8 C 112,14 92,45 100,92 Z"
                  fill="url(#bladeGradSage)"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="0.8"
                />
                {/* Aerodynamic highlight */}
                <path
                  d="M 110,110 C 120,86 136,54 146,24"
                  fill="none"
                  stroke="rgba(184, 229, 223, 0.40)"
                  strokeWidth="0.9"
                />
              </g>
            ))}

            {/* Motor Hub */}
            <circle cx="110" cy="110" r="34" fill="url(#hubGradSage)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <circle cx="110" cy="110" r="25" fill="none" stroke={isRunning ? 'rgba(8, 127, 140, 0.50)' : 'rgba(29, 48, 46, 0.14)'} strokeWidth="1" strokeDasharray="3 2.5" />
            <circle cx="110" cy="110" r="15" fill="#DFE7E2" stroke={isRunning ? 'var(--accent-primary)' : 'var(--border-strong)'} strokeWidth="1.5" />
          </svg>
        </div>

        {/* Center Status Badge */}
        <div style={{
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--fan-center-badge-bg)',
          backdropFilter: 'blur(8px)',
          border: `1.5px solid ${isRunning ? 'var(--accent-primary)' : 'var(--border-card)'}`,
          borderRadius: '50%',
          width: size * 0.35,
          height: size * 0.35,
          boxShadow: isRunning
            ? '0 4px 16px rgba(8, 127, 140, 0.22)'
            : 'var(--shadow-card)',
          transition: 'all 0.4s ease',
        }}>
          <span className="tabular-nums" style={{
            fontFamily: 'var(--font-display)',
            fontSize: `${Math.round(size * 0.088)}px`,
            fontWeight: 800,
            color: !isConnected ? 'var(--text-muted)' : isRunning ? 'var(--accent-primary)' : 'var(--text-secondary)',
            lineHeight: 1,
          }}>
            {!isConnected ? '--' : `${requestedFanSpeedPercent}%`}
          </span>
          <span style={{
            fontSize: '0.56rem',
            fontWeight: 700,
            color: !isConnected ? 'var(--color-error)' : isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
            marginTop: 3,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
          }}>
            {!isConnected ? 'OFFLINE' : isRunning ? 'RUNNING' : 'STOPPED'}
          </span>
        </div>
      </div>

      {showLabels && (
        <div style={{
          marginTop: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}>
          <span>
            Target:{' '}
            <strong style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {isConnected ? `${requestedFanSpeedPercent}%` : '—'}
            </strong>
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>
            PWM Output:{' '}
            <strong style={{ color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {isConnected && hardwarePwmPercent !== null
                ? `${hardwarePwmPercent}%`
                : isConnected ? `${requestedFanSpeedPercent}%` : '—'}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};
