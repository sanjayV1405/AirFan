import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { WifiOff, Settings, RefreshCw, Clock, Wifi } from 'lucide-react';

export const Header: React.FC = () => {
  const { connectionState, lastSuccessfulUpdate, pingLatency, reconnect, setActiveNav } = useAirLoop();
  const [relativeTime, setRelativeTime] = useState<string>('waiting for connection');
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      if (!lastSuccessfulUpdate) { setRelativeTime('waiting for connection'); return; }
      const s = Math.floor((Date.now() - lastSuccessfulUpdate) / 1000);
      if (s < 2) setRelativeTime('just now');
      else if (s < 60) setRelativeTime(`${s}s ago`);
      else setRelativeTime(`${Math.floor(s / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [lastSuccessfulUpdate]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    await reconnect();
    setTimeout(() => setIsReconnecting(false), 600);
  };

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <header style={{
      background: 'var(--header-bg)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: '1.5px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 64,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 1px 6px rgba(29, 48, 46, 0.06)',
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
          {/* Logo Mark — teal ventilation swirl */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(140deg, #087F8C 0%, #397A65 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 12px rgba(8, 127, 140, 0.32)',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle sheen */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
              borderRadius: 'inherit',
            }} />
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ position: 'relative', zIndex: 1 }}>
              <circle cx="16" cy="16" r="11.5" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M16 5.5 A10.5 10.5 0 0 1 26.5 16 A5.25 5.25 0 0 0 21.25 16 A5.25 5.25 0 0 1 16 10.75 Z" fill="white" opacity="0.95"/>
              <path d="M16 26.5 A10.5 10.5 0 0 1 5.5 16 A5.25 5.25 0 0 0 10.75 16 A5.25 5.25 0 0 1 16 21.25 Z" fill="white" opacity="0.70"/>
              <circle cx="16" cy="16" r="2.8" fill="white"/>
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
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              Smart Climate Control
            </div>
          </div>
        </button>

        {/* ── Right: Status + Actions ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Connection Status Pill */}
          {isConnected ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--color-success-bg)',
              border: '1.5px solid rgba(27, 138, 90, 0.25)',
              color: 'var(--color-success)',
              padding: '5px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.80rem',
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
              <Wifi size={12} />
              <span>Connected</span>
              {pingLatency !== null && (
                <span style={{ opacity: 0.65, fontSize: '0.70rem' }}>· {pingLatency}ms</span>
              )}
            </div>
          ) : isConnecting ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--color-info-dim)',
              border: '1.5px solid rgba(47, 111, 181, 0.25)',
              color: 'var(--color-info)',
              padding: '5px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.80rem',
              fontWeight: 700,
            }}>
              <RefreshCw size={12} className="spin" />
              <span>Connecting…</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--color-error-bg)',
              border: '1.5px solid rgba(184, 50, 50, 0.25)',
              color: 'var(--color-error)',
              padding: '5px 10px 5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.80rem',
              fontWeight: 700,
            }}>
              <WifiOff size={12} />
              <span>Disconnected</span>
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                style={{
                  background: 'rgba(184, 50, 50, 0.14)',
                  border: '1px solid rgba(184, 50, 50, 0.28)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '3px 9px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: isReconnecting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginLeft: 2,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <RefreshCw size={10} className={isReconnecting ? 'spin' : ''} />
                <span>{isReconnecting ? '…' : 'Retry'}</span>
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
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-card)',
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
            title="Settings"
            aria-label="Open settings"
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border-card)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-card)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-card)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-xs)';
            }}
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
