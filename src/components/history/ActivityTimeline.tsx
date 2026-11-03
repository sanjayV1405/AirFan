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
  Wifi,
  Clock,
  Sparkles
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
    if (window.confirm('Clear all recorded activity history?')) {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'command': return <Sliders size={14} />;
      case 'sensor': return <Cpu size={14} />;
      case 'ventilation': return <Droplets size={14} />;
      case 'system':
      default:
        return <Wifi size={14} />;
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'command': return 'icon-container-blue';
      case 'sensor': return 'icon-container-teal';
      case 'ventilation': return 'icon-container-warning';
      case 'system':
      default:
        return 'icon-container-neutral';
    }
  };

  return (
    <div className="card-solid" style={{
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      position: 'relative'
    }}>
      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 18
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 34, height: 34 }}>
            <History size={16} />
          </div>
          <div>
            <h3 className="section-heading">Event Timeline</h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Real-time hardware status changes and automation triggers
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleExportEventsCsv}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Download size={13} /> Export CSV
          </button>

          <button
            onClick={handleClear}
            title="Clear logs"
            className="btn-secondary"
            style={{
              padding: '7px 10px',
              color: 'var(--color-error)',
              borderColor: 'rgba(192, 57, 43, 0.20)',
              borderRadius: 'var(--radius-sm)'
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
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'command', label: 'Commands' },
            { id: 'sensor', label: 'Sensors' },
            { id: 'ventilation', label: 'Ventilation' },
            { id: 'system', label: 'System' }
          ].map(c => {
            const isSel = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  background: isSel ? 'var(--accent-primary-dim)' : 'var(--bg-secondary)',
                  border: isSel ? '1px solid rgba(8, 127, 140, 0.30)' : '1px solid var(--border-medium)',
                  color: isSel ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontWeight: isSel ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: isSel ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 10 }} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '7px 12px 7px 30px',
              fontSize: '0.80rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Event Timeline List */}
      <div style={{
        maxHeight: 460,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        paddingRight: 4
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-medium)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
          }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Activity Recorded</span>
            <span style={{ fontSize: '0.76rem', maxWidth: 300 }}>
              Hardware commands, presence events, and ventilation cycles will automatically register here.
            </span>
          </div>
        ) : (
          filteredEvents.map(evt => {
            const dateObj = new Date(evt.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            return (
              <div
                key={evt.id}
                style={{
                  background: 'var(--surface-solid)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-card)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-xs)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className={`icon-container ${getCategoryClass(evt.category)}`}
                    style={{ width: 32, height: 32 }}
                  >
                    {getCategoryIcon(evt.category)}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                      {evt.message}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap'
                }}>
                  <Clock size={12} />
                  <span>{timeStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
