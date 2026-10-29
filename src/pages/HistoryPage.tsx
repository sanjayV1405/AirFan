import React from 'react';
import { ActivityTimeline } from '../components/history/ActivityTimeline';
import { History } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200, margin: '0 auto' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <History size={20} color="var(--accent-primary)" />
          <span>Operational History &amp; Event Logs</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Chronological log of command dispatches, sensor anomalies, and autonomous transitions.
        </p>
      </div>

      <ActivityTimeline />
    </div>
  );
};
