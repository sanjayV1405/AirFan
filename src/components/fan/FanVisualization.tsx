import React, { useMemo } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface FanVisualizationProps {
  size?: number;
  showLabels?: boolean;
}

export const FanVisualization: React.FC<FanVisualizationProps> = ({ size = 240, showLabels = true }) => {
  const { telemetry, connectionState } = useAirLoop();
  const { hardwarePwmPercent, requestedFanSpeedPercent, fanRunningState } = telemetry;

  const isConnected = connectionState === 'connected';
  const effectivePwm = hardwarePwmPercent !== null ? hardwarePwmPercent : requestedFanSpeedPercent;
  const isRunning = isConnected && fanRunningState === 'RUNNING' && effectivePwm > 0;

  // Spin duration scales with actual PWM (faster at higher duty cycle)
  const spinDuration = useMemo(() => {
    if (!isRunning || effectivePwm <= 0) return '0s';
    const s = Math.max(0.35, 2.0 - (effectivePwm / 100) * 1.6);
    return `${s.toFixed(2)}s`;
  }, [isRunning, effectivePwm]);

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
            ? '0 0 28px rgba(53, 214, 194, 0.25), var(--shadow-md)'
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
              const active = isRunning && (angle / 360) * 100 <= effectivePwm;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={active ? 'var(--accent-primary)' : 'var(--border-medium)'}
                  strokeWidth={i % 10 === 0 ? 2.2 : 1.2}
                  strokeLinecap="round"
                  opacity={active ? 0.95 : 0.35}
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
            filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45))',
          }}
        >
          <svg viewBox="0 0 220 220" width="100%" height="100%">
            <defs>
              <linearGradient id="bladeGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4A6278" />
                <stop offset="40%" stopColor="#2A3D50" />
                <stop offset="75%" stopColor="#1E2F3F" />
                <stop offset="100%" stopColor="#162330" />
              </linearGradient>
              <radialGradient id="hubGradDark" cx="38%" cy="32%" r="65%">
                <stop offset="0%" stopColor="#35D6C2" />
                <stop offset="45%" stopColor="#25A898" />
                <stop offset="100%" stopColor="#18232F" />
              </radialGradient>
            </defs>

            {/* 5 Blades */}
            {[0, 72, 144, 216, 288].map(deg => (
              <g key={deg} transform={`rotate(${deg} 110 110)`}>
                {/* Blade shadow */}
                <path
                  d="M 110,110 C 122,86 142,50 154,20 C 158,10 148,5 136,8 C 112,14 92,45 100,92 Z"
                  fill="rgba(0, 0, 0, 0.35)"
                  transform="translate(1.5, 2)"
                />
                {/* Blade body */}
                <path
                  d="M 110,110 C 122,86 142,50 154,20 C 158,10 148,5 136,8 C 112,14 92,45 100,92 Z"
                  fill="url(#bladeGradDark)"
                  stroke={isRunning ? 'rgba(53, 214, 194, 0.35)' : 'rgba(242, 246, 250, 0.15)'}
                  strokeWidth="0.8"
                />
                {/* Aerodynamic highlight */}
                <path
                  d="M 110,110 C 120,86 136,54 146,24"
                  fill="none"
                  stroke={isRunning ? 'rgba(53, 214, 194, 0.60)' : 'rgba(242, 246, 250, 0.20)'}
                  strokeWidth="0.9"
                />
              </g>
            ))}

            {/* Motor Hub */}
            <circle cx="110" cy="110" r="34" fill="url(#hubGradDark)" stroke="rgba(53, 214, 194, 0.35)" strokeWidth="1.5" />
            <circle cx="110" cy="110" r="25" fill="none" stroke={isRunning ? 'rgba(53, 214, 194, 0.60)' : 'rgba(242, 246, 250, 0.10)'} strokeWidth="1" strokeDasharray="3 2.5" />
            <circle cx="110" cy="110" r="15" fill="#18232F" stroke={isRunning ? 'var(--accent-primary)' : 'var(--border-strong)'} strokeWidth="1.5" />
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
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: `1.5px solid ${isRunning ? 'var(--accent-primary)' : 'var(--border-card)'}`,
          borderRadius: '50%',
          width: size * 0.35,
          height: size * 0.35,
          boxShadow: isRunning
            ? '0 4px 18px rgba(53, 214, 194, 0.30)'
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
            {!isConnected ? '—' : `${effectivePwm}%`}
          </span>
          <span style={{
            fontSize: '0.56rem',
            fontWeight: 700,
            color: !isConnected ? 'var(--color-error)' : isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
            marginTop: 3,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
          }}>
            {!isConnected ? 'OFFLINE' : isRunning ? 'RUNNING' : 'STANDBY'}
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
            Duty Cycle:{' '}
            <strong style={{ color: isRunning ? 'var(--accent-primary)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {isConnected ? `${effectivePwm}% PWM` : '—'}
            </strong>
          </span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>
            Output:{' '}
            <strong style={{ color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
              {isConnected ? (isRunning ? 'ACTIVE (GPIO 25)' : 'STANDBY') : 'DISCONNECTED'}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};
