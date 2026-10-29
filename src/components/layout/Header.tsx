import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { WifiOff, Settings, ShieldAlert, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    connectionState,
    isStale,
    lastSuccessfulUpdate,
    pingLatency,
    reconnect,
    setActiveNav,
    theme,
    setTheme
  } = useAirLoop();

  const [relativeTime, setRelativeTime] = useState<string>('just now');
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      if (!lastSuccessfulUpdate) { setRelativeTime('never'); return; }
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

  const isDark = theme === 'dark';

  return (
    <header style={{
      background: 'var(--header-bg)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      transition: 'background var(--transition-normal), border-color var(--transition-normal)'
    }}>
      <div style={{
        maxWidth: 1440,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent-primary-dim), var(--accent-secondary-dim))',
            border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px var(--accent-primary-dim)'
          }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="hLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="13" stroke="var(--border-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M16 4 A12 12 0 0 1 28 16 A6 6 0 0 0 22 16 A6 6 0 0 1 16 10 Z" fill="url(#hLogo)" />
              <path d="M16 28 A12 12 0 0 1 4 16 A6 6 0 0 0 10 16 A6 6 0 0 1 16 22 Z" fill="url(#hLogo)" opacity="0.75" />
              <circle cx="16" cy="16" r="3.5" fill="var(--accent-primary)" />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>
                AirLoop
              </span>
              <span style={{
                background: 'var(--accent-primary-dim)',
                color: 'var(--accent-primary)',
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 4,
                border: '1px solid var(--border-accent)',
                letterSpacing: '0.05em'
              }}>
                IoT
              </span>
            </div>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {isStale && connectionState !== 'demo' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--color-warning-dim)',
              color: 'var(--color-warning)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '4px 10px', borderRadius: 6,
              fontSize: '0.72rem', fontWeight: 600
            }}>
              <ShieldAlert size={13} />
              <span>Stale</span>
            </div>
          )}

          {connectionState === 'demo' ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-amber-dim)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: 'var(--accent-amber)',
              padding: '5px 12px', borderRadius: 999,
              fontSize: '0.75rem', fontWeight: 600
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent-amber)' }} />
              Demo Mode
            </div>
          ) : connectionState === 'connected' ? (
            <div
              title={`Last telemetry received ${relativeTime}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--color-success-dim)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--color-success)',
                padding: '5px 12px', borderRadius: 999,
                fontSize: '0.75rem', fontWeight: 600
              }}
            >
              <div className="live-indicator" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              ESP32 Online
              {pingLatency !== null && (
                <span style={{ opacity: 0.85, fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  · {pingLatency}ms
                </span>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--color-error-dim)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--color-error)',
              padding: '5px 10px', borderRadius: 999,
              fontSize: '0.75rem', fontWeight: 600
            }}>
              <WifiOff size={13} />
              Offline
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                style={{
                  background: 'var(--color-error-dim)',
                  border: 'none',
                  color: 'var(--color-error)',
                  borderRadius: 4,
                  padding: '2px 7px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isReconnecting ? '...' : 'Retry'}
              </button>
            </div>
          )}

          {/* Theme Mode Capsule Toggle (Sun / Moon) */}
          <div
            role="radiogroup"
            aria-label="Theme selection"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--surface-3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 999,
              padding: '3px',
              gap: 2,
              transition: 'background var(--transition-fast), border-color var(--transition-fast)'
            }}
          >
            <button
              type="button"
              role="radio"
              aria-checked={!isDark}
              onClick={() => setTheme('light')}
              title="Switch to Light Theme"
              aria-label="Switch to Light Theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 9px',
                borderRadius: 999,
                border: 'none',
                background: !isDark ? 'var(--surface-1)' : 'transparent',
                color: !isDark ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: !isDark ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: !isDark ? 600 : 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              <Sun size={14} style={{ transition: 'transform 0.3s ease', transform: !isDark ? 'rotate(15deg) scale(1.05)' : 'none' }} />
              <span className="hidden-mobile">Light</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={isDark}
              onClick={() => setTheme('dark')}
              title="Switch to Dark Theme"
              aria-label="Switch to Dark Theme"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 9px',
                borderRadius: 999,
                border: 'none',
                background: isDark ? 'var(--surface-1)' : 'transparent',
                color: isDark ? '#F59E0B' : 'var(--text-muted)',
                boxShadow: isDark ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: isDark ? 600 : 500,
                transition: 'all var(--transition-fast)'
              }}
            >
              <Moon size={14} style={{ transition: 'transform 0.3s ease', transform: isDark ? 'rotate(-10deg) scale(1.05)' : 'none' }} />
              <span className="hidden-mobile">Dark</span>
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setActiveNav('settings')}
            title="Settings"
            aria-label="Settings"
            style={{
              background: 'var(--btn-subtle-bg)',
              border: '1px solid var(--btn-subtle-border)',
              color: 'var(--text-secondary)',
              borderRadius: 8,
              padding: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--btn-subtle-hover)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--btn-subtle-bg)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
