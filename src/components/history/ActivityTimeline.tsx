import React, { useState, useEffect } from 'react';
import { historyService } from '../../services/historyService';
import { ActivityEvent } from '../../types/telemetry';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  Sliders, 
  Cpu, 
  Droplets, 
  Radio
} from 'lucide-react';

export const ActivityTimeline: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshEvents = () => {
    setEvents(historyService.getEvents());
  };

  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear activity logs?')) {
      historyService.clearEvents();
      refreshEvents();
    }
  };

  const handleExportEventsCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURI(historyService.exportEventsToCsv());
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `airloop_events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            System Audit &amp; Event Log
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleExportEventsCsv}
            style={{
              background: 'var(--btn-subtle-bg)',
              border: '1px solid var(--btn-subtle-border)',
              color: 'var(--text-secondary)',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Download size={13} /> Export CSV
          </button>

          <button
            onClick={handleClear}
            title="Clear logs"
            style={{
              background: 'var(--color-error-dim)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--color-error)',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'command', 'sensor', 'ventilation'].map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              style={{
                background: selectedCategory === c ? 'var(--accent-primary-dim)' : 'var(--surface-2)',
                border: selectedCategory === c ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                color: selectedCategory === c ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 180 }}>
          <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: 8, top: 8 }} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: 'var(--surface-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 6,
              padding: '5px 8px 5px 26px',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              width: '100%',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          />
        </div>
      </div>

      {/* Event List */}
      <div style={{
        maxHeight: 380,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No activity logs recorded.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            return (
              <div
                key={evt.id}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  transition: 'background-color var(--transition-fast), border-color var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    padding: 5,
                    borderRadius: 6,
                    background: 'var(--accent-primary-dim)',
                    border: '1px solid var(--border-accent)',
                    color: 'var(--accent-primary)'
                  }}>
                    {evt.category === 'command' ? <Sliders size={13} /> :
                     evt.category === 'sensor' ? <Cpu size={13} /> :
                     evt.category === 'ventilation' ? <Droplets size={13} /> :
                     <Radio size={13} />}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {evt.message}
                    </div>
                  </div>
                </div>

                <div className="tabular-nums" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {timeStr}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
