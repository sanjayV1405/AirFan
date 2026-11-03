import React from 'react';
import { ActivityTimeline } from '../components/history/ActivityTimeline';
import { History } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <History size={22} color="var(--accent-primary)" />
          <span>Activity &amp; Event History</span>
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Audit log of speed commands, presence detections, and automatic ventilation cycles.
        </p>
      </div>

      <ActivityTimeline />
    </div>
  );
};
