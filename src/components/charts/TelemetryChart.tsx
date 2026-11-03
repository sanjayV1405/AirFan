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
import { Activity } from 'lucide-react';

interface TelemetryChartProps {
  type?: 'temperature' | 'humidity' | 'fans';
  height?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ type = 'temperature', height = 210 }) => {
  const { connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const [data, setData] = useState<TelemetryHistoryPoint[]>([]);
  const [timeFilter, setTimeFilter] = useState<'15m' | '1h' | 'all'>('15m');

  const primaryColor = '#00F2FE';
  const secondaryColor = '#3B82F6';
  const gridColor = 'rgba(255, 255, 255, 0.05)';
  const axisColor = '#64748B';

  const tooltipStyle = {
    backgroundColor: 'rgba(11, 17, 32, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 242, 254, 0.3)',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 242, 254, 0.15)',
    fontSize: '0.78rem',
    color: '#F8FAFC',
    padding: '8px 12px'
  };

  const tooltipItemStyle = {
    color: '#F8FAFC',
    fontSize: '0.78rem',
    fontWeight: 600
  };

  const tooltipLabelStyle = {
    color: '#94A3B8',
    fontWeight: 700,
    marginBottom: 4,
    fontFamily: 'var(--font-mono)'
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

  if (data.length === 0 || !isConnected) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(11, 17, 32, 0.5)',
        borderRadius: 14,
        border: '1px dashed rgba(255, 255, 255, 0.12)',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        gap: 8,
        padding: 20,
        textAlign: 'center'
      }}>
        <Activity size={22} color="var(--accent-primary)" />
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {!isConnected ? 'Hardware Offline' : 'Awaiting Real Telemetry Stream...'}
        </span>
        <span style={{ fontSize: '0.74rem' }}>
          {!isConnected 
            ? 'Connect your physical ESP32 to visualize real-time climate data.' 
            : 'Receiving live telemetry packets from microcontroller.'}
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Time Range Filter */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 12 }}>
        {(['15m', '1h', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            style={{
              background: timeFilter === f ? 'var(--accent-primary-dim)' : 'rgba(20, 31, 56, 0.5)',
              border: timeFilter === f ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              color: timeFilter === f ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: timeFilter === f ? '0 0 12px rgba(0, 242, 254, 0.2)' : 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {f === 'all' ? 'All Data' : f}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'temperature' ? (
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="midnightTempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke={axisColor} fontSize={11} unit="°C" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Area 
                type="monotone" 
                dataKey="comfortTemp" 
                name="Room Temperature (°C)" 
                stroke={primaryColor} 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#midnightTempGrad)" 
              />
            </AreaChart>
          ) : type === 'humidity' ? (
            <LineChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis domain={[30, 95]} stroke={axisColor} fontSize={11} unit="%" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Legend wrapperStyle={{ fontSize: '0.76rem', paddingTop: '6px', color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="wetHumidity" name="Room Moisture (%)" stroke={primaryColor} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="humidityBaseline" name="Target Baseline" stroke="var(--accent-amber)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="midnightFanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke={axisColor} fontSize={11} unit="%" tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Area 
                type="stepAfter" 
                dataKey="fanSpeedPercent" 
                name="Ceiling Fan Speed (%)" 
                stroke={secondaryColor} 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#midnightFanGrad)" 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
