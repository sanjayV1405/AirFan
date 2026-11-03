import React, { useState, useEffect } from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { WifiOff, Settings, RefreshCw, Cpu } from 'lucide-react';

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
      padding: '0 26px',
      height: 68,
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

        {/* Brand: AIRLOOP with Refined Ventilation Icon */}
        <div 
          onClick={() => setActiveNav('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00F2FE 0%, #3B82F6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="#070B14" strokeWidth="1.75" strokeDasharray="3 3" opacity="0.65" />
              <path d="M16 4 A12 12 0 0 1 28 16 A6 6 0 0 0 22 16 A6 6 0 0 1 16 10 Z" fill="#070B14" />
              <path d="M16 28 A12 12 0 0 1 4 16 A6 6 0 0 0 10 16 A6 6 0 0 1 16 22 Z" fill="#070B14" opacity="0.85" />
              <circle cx="16" cy="16" r="3.5" fill="#070B14" />
            </svg>
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1
            }}>
              AIRLOOP
            </div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: 3
            }}>
              Smart Climate Control
            </div>
          </div>
        </div>

        {/* Status & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          
          {/* Connection Status Pill */}
          {isConnected ? (
            <div
              title={`Live hardware stream ${relativeTime}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-success-dim)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: 'var(--color-success)',
                padding: '6px 14px', borderRadius: 999,
                fontSize: '0.78rem', fontWeight: 700,
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.2)'
              }}
            >
              <div className="live-indicator" style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--color-success)', boxShadow: '0 0 8px #10B981' }} />
              <span>Hardware Connected</span>
              {pingLatency !== null && (
                <span style={{ opacity: 0.8, fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                  · {pingLatency}ms
                </span>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--color-error-dim)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: 'var(--color-error)',
              padding: '6px 14px', borderRadius: 999,
              fontSize: '0.78rem', fontWeight: 700,
              boxShadow: '0 0 14px rgba(239, 68, 68, 0.15)'
            }}>
              <WifiOff size={14} />
              <span>Hardware Disconnected</span>
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#EF4444',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: isReconnecting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <RefreshCw size={11} className={isReconnecting ? 'spin' : ''} />
                <span>{isReconnecting ? 'Connecting...' : 'Reconnect'}</span>
              </button>
            </div>
          )}

          {/* Last updated badge (desktop) */}
          <div className="hidden-mobile" style={{
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}>
            {isConnected ? `Synced ${relativeTime}` : 'Offline'}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setActiveNav('settings')}
            title="System Settings"
            aria-label="Settings"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
              borderRadius: 11,
              padding: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(0, 242, 254, 0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
