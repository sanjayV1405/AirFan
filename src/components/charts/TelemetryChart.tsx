import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line, Legend
} from 'recharts';
import { historyService } from '../../services/historyService';
import { TelemetryHistoryPoint } from '../../types/telemetry';
import { useAirLoop } from '../../context/AirLoopContext';
import { Activity } from 'lucide-react';

interface TelemetryChartProps {
  type?: 'temperature' | 'humidity' | 'fans';
  height?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ type = 'temperature', height = 200 }) => {
  const { connectionState } = useAirLoop();
  const isConnected = connectionState === 'connected';

  const [data, setData] = useState<TelemetryHistoryPoint[]>([]);
  const [timeFilter, setTimeFilter] = useState<'15m' | '1h' | 'all'>('15m');

  // Sage, Slate & Teal theme chart colors
  const primaryColor = '#087F8C';      // Rich teal
  const secondaryColor = '#397A65';    // Muted forest green
  const warningColor = '#B5700A';      // Muted amber
  const gridColor = 'rgba(29, 48, 46, 0.07)';
  const axisColor = '#7A9490';

  const tooltipStyle = {
    backgroundColor: 'rgba(248, 250, 248, 0.99)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(8, 127, 140, 0.28)',
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(29, 48, 46, 0.12)',
    fontSize: '0.78rem',
    color: '#1D302E',
    padding: '8px 12px',
  };

  const tooltipItemStyle = { color: '#1D302E', fontSize: '0.78rem', fontWeight: 600 };
  const tooltipLabelStyle = { color: '#526663', fontWeight: 600, marginBottom: 4, fontSize: '0.72rem' };

  useEffect(() => {
    const update = () => {
      const all = historyService.getChartHistory();
      if (timeFilter === '15m') setData(all.slice(-30));
      else if (timeFilter === '1h') setData(all.slice(-60));
      else setData(all);
    };
    update();
    const iv = setInterval(update, 2000);
    return () => clearInterval(iv);
  }, [timeFilter]);

  if (data.length === 0 || !isConnected) {
    return (
      <div style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-medium)',
        color: 'var(--text-muted)',
        gap: 8,
        padding: 20,
        textAlign: 'center',
      }}>
        <Activity size={20} color="var(--accent-primary)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
          {!isConnected ? 'Hardware Offline' : 'Awaiting live telemetry…'}
        </span>
        <span style={{ fontSize: '0.76rem', maxWidth: 280 }}>
          {!isConnected
            ? 'Connect your ESP32 to start visualizing real-time climate data.'
            : 'Data will appear here as telemetry arrives from the sensor.'}
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Time filter pills */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5, marginBottom: 10 }}>
        {(['15m', '1h', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            style={{
              background: timeFilter === f ? 'var(--accent-primary-dim)' : 'var(--bg-secondary)',
              border: timeFilter === f ? '1px solid rgba(8, 127, 140, 0.28)' : '1px solid var(--border-medium)',
              color: timeFilter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'temperature' ? (
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradSage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.20} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} stroke={axisColor} fontSize={11} unit="°" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Area type="monotone" dataKey="comfortTemp" name="Temperature (°C)" stroke={primaryColor} strokeWidth={2} fillOpacity={1} fill="url(#tempGradSage)" dot={false} />
            </AreaChart>
          ) : type === 'humidity' ? (
            <LineChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 4" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[30, 95]} stroke={axisColor} fontSize={11} unit="%" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Legend wrapperStyle={{ fontSize: '0.74rem', paddingTop: '4px', color: 'var(--text-secondary)' }} />
              <Line type="monotone" dataKey="wetHumidity" name="Moisture (%)" stroke={primaryColor} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="humidityBaseline" name="Target" stroke={warningColor} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="fanGradSage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" stroke={gridColor} vertical={false} />
              <XAxis dataKey="timeStr" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke={axisColor} fontSize={11} unit="%" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Area type="stepAfter" dataKey="fanSpeedPercent" name="Fan Speed (%)" stroke={secondaryColor} strokeWidth={2} fillOpacity={1} fill="url(#fanGradSage)" dot={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
