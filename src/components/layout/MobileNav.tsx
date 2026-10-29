import React from 'react';
import { useAirLoop } from '../../context/AirLoopContext';
import { LayoutDashboard, Wind, Droplets, Cpu, History, Settings } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'overview',  label: 'Home',     icon: LayoutDashboard },
  { id: 'comfort',   label: 'Comfort',  icon: Wind },
  { id: 'wetzone',   label: 'Wet',      icon: Droplets },
  { id: 'sensors',   label: 'Sensors',  icon: Cpu },
  { id: 'history',   label: 'History',  icon: History },
  { id: 'settings',  label: 'Settings', icon: Settings },
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
        borderTop: '1px solid var(--mobilenav-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 4px max(6px, env(safe-area-inset-bottom)) 4px',
        zIndex: 50,
        boxShadow: 'var(--shadow-md)',
        transition: 'background var(--transition-normal), border-color var(--transition-normal)'
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
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '5px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              minWidth: 44,
              transition: 'color var(--transition-fast)'
            }}
          >
            <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.62rem', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
