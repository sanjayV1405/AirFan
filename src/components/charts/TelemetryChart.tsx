import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { historyService } from '../../services/historyService';
import { TelemetryHistoryPoint } from '../../types/telemetry';
import { useAirLoop } from '../../context/AirLoopContext';
import { RefreshCw } from 'lucide-react';

interface TelemetryChartProps {
  type?: 'temperature' | 'humidity' | 'fans';
  height?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ type = 'temperature', height = 220 }) => {
  const { theme } = useAirLoop();
  const isDark = theme === 'dark';
  const [data, setData] = useState<TelemetryHistoryPoint[]>([]);
  const [timeFilter, setTimeFilter] = useState<'15m' | '1h' | 'all'>('15m');

  const primaryColor = isDark ? '#00D4AA' : '#0D9488';
  const secondaryColor = isDark ? '#3B82F6' : '#2563EB';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#E2E8F0';
  const axisColor = isDark ? '#5A677D' : '#64748B';

  const tooltipStyle = {
    backgroundColor: isDark ? '#0F1525' : '#FFFFFF',
    border: isDark ? `1px solid rgba(0, 212, 170, 0.3)` : '1px solid #CBD5E1',
    borderRadius: 8,
    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 14px rgba(15, 23, 42, 0.08)',
    fontSize: '0.75rem',
    color: isDark ? '#E8EDF5' : '#0B192C'
  };

  useEffect(() => {
    const updateData = () => {
      const allPoints = historyService.getChartHistory();
      if (timeFilter === '15m') {
        setData(allPoints.slice(-30));
      } else if (timeFilter === '1h') {
        setData(allPoints.slice(-60));
      } else {
        setData(allPoints);
      }
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  if (data.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-2)',
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        gap: 6
      }}>
        <RefreshCw size={18} className="spin" color="var(--accent-primary)" />
        <span>Collecting real-time telemetry stream...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Time Range Filter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginBottom: 10 }}>
        {(['15m', '1h', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            style={{
              background: timeFilter === f ? 'var(--accent-primary-dim)' : 'var(--surface-2)',
              border: timeFilter === f ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
              color: timeFilter === f ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'temperature' ? (
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="tempDynamicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke={axisColor} fontSize={11} unit="°C" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area 
                type="monotone" 
                dataKey="comfortTemp" 
                name="Temperature (°C)" 
                stroke={primaryColor} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#tempDynamicGrad)" 
              />
            </AreaChart>
          ) : type === 'humidity' ? (
            <LineChart data={data} margin={{ top: 6, right: 6, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis domain={[30, 95]} stroke={axisColor} fontSize={11} unit="%" tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  ...tooltipStyle,
                  border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #CBD5E1' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '0.72rem', paddingTop: '4px', color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="wetHumidity" name="Wet Zone Humidity" stroke={secondaryColor} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidityBaseline" name="Baseline" stroke="var(--accent-amber)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="fanDynamicGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke={axisColor} fontSize={11} unit="%" tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  ...tooltipStyle,
                  border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #CBD5E1' 
                }} 
              />
              <Area 
                type="stepAfter" 
                dataKey="fanSpeedPercent" 
                name="Fan PWM (%)" 
                stroke={secondaryColor} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#fanDynamicGrad)" 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
