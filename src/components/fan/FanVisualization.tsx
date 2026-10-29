import React, { useMemo } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';

interface FanVisualizationProps {
  size?: number;
  showLabels?: boolean;
}

export const FanVisualization: React.FC<FanVisualizationProps> = ({ size = 220, showLabels = true }) => {
  const { telemetry, commandPending } = useAirLoop();
  const { requestedFanSpeedPercent, hardwarePwmPercent, fanRunningState } = telemetry;

  const isRunning = fanRunningState === 'RUNNING' && requestedFanSpeedPercent > 0;

  const spinDuration = useMemo(() => {
    if (!isRunning) return '0s';
    const s = Math.max(0.30, 3.5 - (requestedFanSpeedPercent / 100) * 3.2);
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
        {/* Outer housing */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'var(--fan-housing-bg)',
          border: `2px solid ${isRunning ? 'var(--fan-housing-border-run)' : 'var(--fan-housing-border)'}`,
          boxShadow: isRunning
            ? '0 0 28px var(--accent-primary-glow), var(--shadow-md)'
            : 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.4s, box-shadow 0.4s, background 0.4s'
        }}>
          {/* Tick marks */}
          <svg width={size} height={size} viewBox="0 0 260 260" style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              const r1 = 120;
              const r2 = i % 6 === 0 ? 111 : 115;
              const x1 = 130 + r1 * Math.cos(rad);
              const y1 = 130 + r1 * Math.sin(rad);
              const x2 = 130 + r2 * Math.cos(rad);
              const y2 = 130 + r2 * Math.sin(rad);
              const isActive = (angle / 360) * 100 <= requestedFanSpeedPercent && isRunning;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isActive ? 'var(--accent-primary)' : 'var(--fan-tick-inactive)'}
                  strokeWidth={i % 6 === 0 ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Rotating blades */}
          <div
            className={isRunning ? 'fan-spinning' : ''}
            style={{
              width: size * 0.75,
              height: size * 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animationDuration: spinDuration,
              transition: isRunning ? 'none' : 'transform 1s ease-out'
            }}
          >
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <defs>
                <linearGradient id="bladeDynamicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--fan-blade-grad-start)" />
                  <stop offset="50%" stopColor="var(--fan-blade-grad-mid)" />
                  <stop offset="100%" stopColor="var(--fan-blade-grad-end)" />
                </linearGradient>
                <radialGradient id="hubDynamicGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="var(--fan-hub-start)" />
                  <stop offset="100%" stopColor="var(--fan-hub-end)" />
                </radialGradient>
              </defs>

              {[0, 72, 144, 216, 288].map(deg => (
                <g key={deg} transform={`rotate(${deg} 100 100)`}>
                  <path
                    d="M 100,100 C 112,78 128,45 138,20 C 142,12 135,8 124,10 C 102,14 85,42 90,82 Z"
                    fill="url(#bladeDynamicGrad)"
                    stroke={isRunning ? 'var(--accent-primary-dim)' : 'var(--border-subtle)'}
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Hub */}
              <circle cx="100" cy="100" r="30" fill="url(#hubDynamicGrad)" stroke="var(--border-subtle)" strokeWidth="1" />
              <circle cx="100" cy="100" r="22" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="100" cy="100" r="13" fill="var(--surface-1)" stroke={isRunning ? 'var(--accent-primary)' : 'var(--border-medium)'} strokeWidth="1.5" />
              <circle cx="100" cy="100" r="4" fill={isRunning ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            </svg>
          </div>

          {/* Center speed badge */}
          <div style={{
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--fan-center-badge-bg)',
            border: `1px solid ${isRunning ? 'var(--border-accent)' : 'var(--fan-center-badge-border)'}`,
            borderRadius: '50%',
            width: size * 0.30,
            height: size * 0.30,
            boxShadow: isRunning ? '0 0 16px var(--accent-primary-glow)' : 'var(--shadow-sm)',
            transition: 'border-color 0.4s, box-shadow 0.4s, background 0.4s'
          }}>
            <span className="tabular-nums" style={{
              fontFamily: 'var(--font-display)',
              fontSize: `${Math.round(size * 0.085)}px`,
              fontWeight: 700,
              color: isRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
              lineHeight: 1
            }}>
              {requestedFanSpeedPercent}%
            </span>
            <span style={{
              fontSize: '0.56rem',
              fontWeight: 600,
              color: commandPending ? 'var(--accent-amber)'
                : isRunning ? 'var(--accent-primary)'
                : 'var(--text-muted)',
              marginTop: 2,
              letterSpacing: '0.05em'
            }}>
              {commandPending ? 'SYNC' : isRunning ? 'RUNNING' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {showLabels && (
        <div style={{
          marginTop: 14,
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span>Target: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{requestedFanSpeedPercent}%</strong></span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span>PWM: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            {hardwarePwmPercent !== null ? `${hardwarePwmPercent}%` : `${requestedFanSpeedPercent}%`}
          </strong></span>
        </div>
      )}
    </div>
  );
};
