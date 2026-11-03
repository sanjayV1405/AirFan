import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { LayoutDashboard, Wind, Sliders, Droplets, Cpu, Settings } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'overview',  label: 'Home',         icon: LayoutDashboard },
  { id: 'comfort',   label: 'Comfort',      icon: Wind },
  { id: 'fan',       label: 'Fan',          icon: Sliders },
  { id: 'wetzone',   label: 'Ventilation',  icon: Droplets },
  { id: 'sensors',   label: 'Sensors',      icon: Cpu },
  { id: 'settings',  label: 'Settings',     icon: Settings },
];

export const MobileNav: React.FC = () => {
  const { activeNav, setActiveNav } = useAirLoop();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="mobile-only-nav"
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: 'var(--mobilenav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--mobilenav-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 4px max(8px, env(safe-area-inset-bottom)) 4px',
        zIndex: 50,
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-normal)'
      }}
    >
      {MOBILE_NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            style={{
              background: isActive ? 'var(--accent-primary-dim)' : 'transparent',
              border: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              minWidth: 48,
              transition: 'all var(--transition-fast)'
            }}
          >
            <Icon size={19} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.66rem', fontWeight: isActive ? 700 : 500, fontFamily: 'var(--font-sans)' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
