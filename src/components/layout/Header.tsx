import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { WifiOff, Settings, RefreshCw, Clock } from 'lucide-react';

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
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 64,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        maxWidth: 1440,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* ── Brand ──────────────────────────────────────────── */}
        <button
          onClick={() => setActiveNav('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            userSelect: 'none',
          }}
        >
          {/* Logo Mark */}
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(8, 127, 140, 0.28)',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              {/* Airflow vane: two curved blades */}
              <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeDasharray="2.5 2.5" />
              <path d="M16 5 A11 11 0 0 1 27 16 A5.5 5.5 0 0 0 21.5 16 A5.5 5.5 0 0 1 16 10.5 Z" fill="white" opacity="0.95"/>
              <path d="M16 27 A11 11 0 0 1 5 16 A5.5 5.5 0 0 0 10.5 16 A5.5 5.5 0 0 1 16 21.5 Z" fill="white" opacity="0.70"/>
              <circle cx="16" cy="16" r="3" fill="white"/>
            </svg>
          </div>

          {/* Brand text */}
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}>
              AIRLOOP
            </div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginTop: 1,
            }}>
              Smart Climate Control
            </div>
          </div>
        </button>

        {/* ── Right: Status + Actions ────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Connection Status */}
          {isConnected ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(26, 158, 106, 0.22)',
              color: 'var(--color-success)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
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
              <span>Hardware Connected</span>
              {pingLatency !== null && (
                <span style={{ opacity: 0.7, fontSize: '0.70rem' }}>· {pingLatency}ms</span>
              )}
            </div>
          ) : isConnecting ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--color-info-dim)',
              border: '1px solid rgba(57, 121, 216, 0.22)',
              color: 'var(--color-info)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              <RefreshCw size={12} className="spin" />
              <span>Connecting...</span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--color-error-bg)',
              border: '1px solid rgba(192, 57, 43, 0.22)',
              color: 'var(--color-error)',
              padding: '5px 12px 5px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}>
              <WifiOff size={13} />
              <span>Disconnected</span>
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                style={{
                  background: 'rgba(192, 57, 43, 0.12)',
                  border: '1px solid rgba(192, 57, 43, 0.25)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '3px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
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

          {/* Last updated — desktop only */}
          {isConnected && (
            <div
              className="hidden-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Clock size={12} />
              <span>{relativeTime}</span>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setActiveNav('settings')}
            title="Settings"
            aria-label="Open settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--btn-subtle-bg)',
              border: '1px solid var(--btn-subtle-border)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--btn-subtle-hover)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--btn-subtle-bg)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--btn-subtle-border)';
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
