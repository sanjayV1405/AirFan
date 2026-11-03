import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { WifiOff, Settings, RefreshCw, Clock, Wifi, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const { connectionState, lastSuccessfulUpdate, pingLatency, connect, disconnect, setActiveNav } = useAirLoop();
  const [relativeTime, setRelativeTime] = useState<string>('waiting for connection');

  useEffect(() => {
    const update = () => {
      if (!lastSuccessfulUpdate) { setRelativeTime('offline'); return; }
      const s = Math.floor((Date.now() - lastSuccessfulUpdate) / 1000);
      if (s < 2) setRelativeTime('just now');
      else if (s < 60) setRelativeTime(`${s}s ago`);
      else setRelativeTime(`${Math.floor(s / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [lastSuccessfulUpdate]);

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <header style={{
      background: 'var(--header-bg)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: '1px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 64,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 1px 8px rgba(0, 0, 0, 0.35)',
    }}>
      <div style={{
        maxWidth: 1520,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* ── Brand ────────────────────────────────────────────── */}
        <button
          onClick={() => setActiveNav('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            userSelect: 'none',
          }}
        >
          {/* Logo Mark — electric teal swirl */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(140deg, #35D6C2 0%, #2BB8A6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 16px rgba(53, 214, 194, 0.35)',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
              borderRadius: 'inherit',
            }} />
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ position: 'relative', zIndex: 1 }}>
              <circle cx="16" cy="16" r="11.5" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M16 5.5 A10.5 10.5 0 0 1 26.5 16 A5.25 5.25 0 0 0 21.25 16 A5.25 5.25 0 0 1 16 10.75 Z" fill="#0C1F2A" opacity="0.95"/>
              <path d="M16 26.5 A10.5 10.5 0 0 1 5.5 16 A5.25 5.25 0 0 0 10.75 16 A5.25 5.25 0 0 1 16 21.25 Z" fill="#0C1F2A" opacity="0.75"/>
              <circle cx="16" cy="16" r="2.8" fill="#0C1F2A"/>
            </svg>
          </div>

          {/* Brand text */}
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}>
              AIRLOOP
            </div>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              Intelligent Comfort. Effortless Climate.
            </div>
          </div>
        </button>

        {/* ── Right: Status + Actions ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Connection Status & Control */}
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--color-success-bg)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                color: 'var(--color-success)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-xs)',
              }}>
                <div
                  className="live-indicator"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    flexShrink: 0,
                  }}
                />
                <Wifi size={13} />
                <span>Connected</span>
                {pingLatency !== null && (
                  <span style={{ opacity: 0.70, fontSize: '0.70rem' }}>· {pingLatency}ms</span>
                )}
              </div>

              <button
                onClick={disconnect}
                title="Disconnect from ESP32"
                className="btn-secondary"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                Disconnect
              </button>
            </div>
          ) : isConnecting ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--accent-secondary-bg)',
                border: '1px solid rgba(98, 168, 255, 0.25)',
                color: 'var(--accent-secondary)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}>
                <RefreshCw size={12} className="spin" />
                <span>Connecting…</span>
              </div>

              <button
                onClick={disconnect}
                className="btn-secondary"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(248, 113, 113, 0.08)',
                border: '1px solid rgba(248, 113, 113, 0.20)',
                color: 'var(--color-error)',
                padding: '5px 11px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.76rem',
                fontWeight: 600,
              }}>
                <WifiOff size={12} />
                <span className="hidden-mobile">Offline</span>
              </div>

              <button
                onClick={connect}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  fontSize: '0.80rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                <Radio size={13} />
                <span>Connect ESP32</span>
              </button>
            </div>
          )}

          {/* Last updated chip */}
          {isConnected && (
            <div
              className="hidden-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                padding: '5px 11px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <Clock size={11} />
              <span>{relativeTime}</span>
            </div>
          )}

          {/* Settings button */}
          <button
            onClick={() => setActiveNav('settings')}
            title="Device Settings & IP Configuration"
            aria-label="Open settings"
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-3)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
