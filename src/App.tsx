import React from 'react';
import { AirLoopProvider, useAirLoop } from './context/AirLoopContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DemoBanner } from './components/layout/DemoBanner';
import { OverviewPage } from './pages/OverviewPage';
import { ComfortZonePage } from './pages/ComfortZonePage';
import { WetZonePage } from './pages/WetZonePage';
import { SensorsPage } from './pages/SensorsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeNav } = useAirLoop();

  const renderActivePage = () => {
    switch (activeNav) {
      case 'comfort':
        return <ComfortZonePage />;
      case 'wetzone':
        return <WetZonePage />;
      case 'sensors':
        return <SensorsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'overview':
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Background Ambient Glow */}
      <div className="ambient-bg" />

      {/* Persistent Demo Warning Banner when in Simulation Mode */}
      <DemoBanner />

      {/* Main Top Header */}
      <Header />

      {/* Main Dashboard Layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        zIndex: 10,
        maxWidth: 1600,
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Left Sidebar on Desktop */}
        <Sidebar />

        {/* Dynamic Route Content Area */}
        <main style={{
          flex: 1,
          padding: '24px 24px 80px 24px',
          minWidth: 0,
          overflowX: 'hidden'
        }}>
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export function App() {
  return (
    <AirLoopProvider>
      <AppContent />
    </AirLoopProvider>
  );
}

export default App;
