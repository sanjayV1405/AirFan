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
  Wifi
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
    if (window.confirm('Are you sure you want to clear the activity history?')) {
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
      padding: '22px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(8, 145, 178, 0.08)',
            border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <History size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Activity History
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Real-time hardware events and commands
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleExportEventsCsv}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
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
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: 'var(--color-error)',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: '0.76rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Trash2 size={14} />
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
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'command', label: 'Commands' },
            { id: 'sensor', label: 'Sensors' },
            { id: 'ventilation', label: 'Ventilation' },
            { id: 'system', label: 'System' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                background: selectedCategory === c.id ? '#FFFFFF' : 'var(--surface-2)',
                border: selectedCategory === c.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                color: selectedCategory === c.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: selectedCategory === c.id ? 'var(--shadow-sm)' : 'none',
                borderRadius: 8,
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 9 }} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '6px 10px 6px 30px',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              width: '100%',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          />
        </div>
      </div>

      {/* Event List */}
      <div style={{
        maxHeight: 420,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No activity events recorded yet. Connect hardware to begin monitoring.
          </div>
        ) : (
          filteredEvents.map(evt => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            return (
              <div
                key={evt.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    padding: 6,
                    borderRadius: 8,
                    background: evt.level === 'error' ? 'var(--color-error-dim)' : 'rgba(8, 145, 178, 0.08)',
                    border: `1px solid ${evt.level === 'error' ? 'rgba(220, 38, 38, 0.25)' : 'var(--border-accent)'}`,
                    color: evt.level === 'error' ? 'var(--color-error)' : 'var(--accent-primary)'
                  }}>
                    {evt.category === 'command' ? <Sliders size={14} /> :
                     evt.category === 'sensor' ? <Cpu size={14} /> :
                     evt.category === 'ventilation' ? <Droplets size={14} /> :
                     <Wifi size={14} />}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                      {evt.message}
                    </div>
                  </div>
                </div>

                <div className="tabular-nums" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
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
