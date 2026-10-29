import { ActivityEvent, TelemetryHistoryPoint, TelemetryData } from '../types/telemetry';

const STORAGE_KEY_EVENTS = 'airloop_activity_events';
const MAX_EVENTS = 250;
const MAX_CHART_POINTS = 120;

export class HistoryService {
  private events: ActivityEvent[] = [];
  private chartHistory: TelemetryHistoryPoint[] = [];

  constructor() {
    this.loadEvents();
  }

  private loadEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch {
      this.events = [];
    }
  }

  private saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events.slice(0, MAX_EVENTS)));
    } catch (e) {
      console.warn('Could not save events to localStorage', e);
    }
  }

  public logEvent(
    category: ActivityEvent['category'],
    type: string,
    title: string,
    message: string,
    source: ActivityEvent['source'] = 'FRONTEND',
    level: ActivityEvent['level'] = 'info',
    details?: Record<string, any>
  ): ActivityEvent {
    const event: ActivityEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      category,
      type,
      title,
      message,
      source,
      level,
      details
    };

    this.events.unshift(event);
    if (this.events.length > MAX_EVENTS) {
      this.events.pop();
    }
    this.saveEvents();
    return event;
  }

  public getEvents(): ActivityEvent[] {
    return [...this.events];
  }

  public clearEvents() {
    this.events = [];
    localStorage.removeItem(STORAGE_KEY_EVENTS);
  }

  public addTelemetrySample(telemetry: TelemetryData) {
    const date = new Date(telemetry.timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const point: TelemetryHistoryPoint = {
      timestamp: telemetry.timestamp,
      timeStr,
      comfortTemp: telemetry.comfortTemperatureC,
      comfortHumidity: telemetry.comfortHumidityPercent,
      wetHumidity: telemetry.wetZoneHumidityPercent,
      humidityBaseline: telemetry.humidityBaselinePercent,
      fanSpeedPercent: telemetry.requestedFanSpeedPercent,
      exhaustState: telemetry.exhaustFanState ? 1 : 0,
      occupancy: telemetry.occupancyDetected ? 1 : 0
    };

    this.chartHistory.push(point);
    if (this.chartHistory.length > MAX_CHART_POINTS) {
      this.chartHistory.shift();
    }
  }

  public getChartHistory(): TelemetryHistoryPoint[] {
    return [...this.chartHistory];
  }

  public exportEventsToCsv(): string {
    const headers = ['Timestamp', 'ISO Time', 'Category', 'Source', 'Level', 'Title', 'Message'];
    const rows = this.events.map(e => [
      e.timestamp,
      new Date(e.timestamp).toISOString(),
      `"${e.category}"`,
      `"${e.source}"`,
      `"${e.level}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public exportTelemetryToCsv(): string {
    const headers = ['Timestamp', 'Time', 'Comfort_Temp_C', 'Comfort_Humidity_RH', 'Wet_Humidity_RH', 'Baseline_RH', 'Fan_Speed_Pct', 'Exhaust_Active', 'Occupancy'];
    const rows = this.chartHistory.map(p => [
      p.timestamp,
      `"${p.timeStr}"`,
      p.comfortTemp !== null ? p.comfortTemp : '',
      p.comfortHumidity !== null ? p.comfortHumidity : '',
      p.wetHumidity !== null ? p.wetHumidity : '',
      p.humidityBaseline !== null ? p.humidityBaseline : '',
      p.fanSpeedPercent,
      p.exhaustState,
      p.occupancy
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const historyService = new HistoryService();
