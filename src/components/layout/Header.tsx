import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { WifiOff, Settings, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    connectionState,
    lastSuccessfulUpdate,
    pingLatency,
    reconnect,
    setActiveNav
  } = useAirLoop();

  const [relativeTime, setRelativeTime] = useState<string>('never');
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      if (!lastSuccessfulUpdate) {
        setRelativeTime('waiting for connection');
        return;
      }
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
    setTimeout(() => setIsReconnecting(false), 500);
  };

  const isConnected = connectionState === 'connected';

  return (
    <header style={{
      background: 'var(--header-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      transition: 'all var(--transition-normal)'
    }}>
      <div style={{
        maxWidth: 1600,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>

        {/* Brand: AIRLOOP */}
        <div 
          onClick={() => setActiveNav('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.25)'
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="#FFFFFF" strokeWidth="1.75" strokeDasharray="3 3" opacity="0.65" />
              <path d="M16 4 A12 12 0 0 1 28 16 A6 6 0 0 0 22 16 A6 6 0 0 1 16 10 Z" fill="#FFFFFF" />
              <path d="M16 28 A12 12 0 0 1 4 16 A6 6 0 0 0 10 16 A6 6 0 0 1 16 22 Z" fill="#FFFFFF" opacity="0.8" />
              <circle cx="16" cy="16" r="3.5" fill="#FFFFFF" />
            </svg>
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              AIRLOOP
            </div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginTop: 2
            }}>
              Smart Ventilation
            </div>
          </div>
        </div>

        {/* Status & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          
          {/* Connection Status Pill */}
          {isConnected ? (
            <div
              title={`Hardware synced ${relativeTime}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-success-dim)',
                border: '1px solid rgba(5, 150, 105, 0.2)',
                color: 'var(--color-success)',
                padding: '6px 14px', borderRadius: 999,
                fontSize: '0.78rem', fontWeight: 600,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="live-indicator" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <span>Hardware Connected</span>
              {pingLatency !== null && (
                <span style={{ opacity: 0.75, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                  · {pingLatency}ms
                </span>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-error-dim)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: 'var(--color-error)',
              padding: '5px 12px', borderRadius: 999,
              fontSize: '0.78rem', fontWeight: 600,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <WifiOff size={14} />
              <span>Hardware Disconnected</span>
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(220, 38, 38, 0.25)',
                  color: 'var(--color-error)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: isReconnecting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <RefreshCw size={11} className={isReconnecting ? 'spin' : ''} />
                <span>{isReconnecting ? 'Connecting...' : 'Reconnect'}</span>
              </button>
            </div>
          )}

          {/* Last updated badge (desktop) */}
          <div className="hidden-mobile" style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {isConnected ? `Updated ${relativeTime}` : 'Offline'}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setActiveNav('settings')}
            title="System Settings"
            aria-label="Settings"
            style={{
              background: 'var(--btn-subtle-bg)',
              border: '1px solid var(--btn-subtle-border)',
              color: 'var(--text-secondary)',
              borderRadius: 10,
              padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--btn-subtle-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
