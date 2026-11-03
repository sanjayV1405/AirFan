import React from 'react';
import { ActivityTimeline } from '../components/history/ActivityTimeline';
import { History } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <History size={18} />
          </div>
          <div>
            <h1 className="page-title">Activity History</h1>
            <p className="page-subtitle">Event log of climate automations, user overrides, and hardware transitions</p>
          </div>
        </div>
      </div>

      <ActivityTimeline />
    </div>
  );
};
