export type ConnectionState = 'connected' | 'connecting' | 'offline' | 'error' | 'demo';

export type OperatingMode = 'manual' | 'auto';

export type FanRunningState = 'OFF' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'UNKNOWN';

export type TemperatureBand = 'COOL' | 'COMFORT' | 'WARM' | 'HOT';

export type SensorStatus = 'OK' | 'STALE' | 'FAULT' | 'DISCONNECTED';

export type CommandStatus = 'IDLE' | 'PENDING' | 'ACKNOWLEDGED' | 'REJECTED' | 'TIMEOUT' | 'ERROR';

export interface SensorHealth {
  comfortDht11: SensorStatus;
  wetDht11: SensorStatus;
  pirMotion: SensorStatus;
  fanMosfet: 'OK' | 'FAULT';
  exhaustMosfet: 'OK' | 'FAULT';
}

export interface SystemMetrics {
  freeHeapBytes?: number;
  uptimeSeconds?: number;
  wifiRssi?: number;
  loopLatencyMs?: number;
}

export interface TelemetryData {
  deviceId: string;
  timestamp: number; // Unix ms
  connectionState: ConnectionState;
  activeMode: OperatingMode;
  
  // Comfort Zone readings
  comfortTemperatureC: number | null;
  comfortHumidityPercent: number | null;
  
  // Wet Zone readings
  wetZoneTemperatureC: number | null;
  wetZoneHumidityPercent: number | null;
  humidityBaselinePercent: number | null;
  humidityRiseRatePercentPerMinute: number | null;
  
  // Motion / Occupancy
  occupancyDetected: boolean;
  occupancyLastMotionAt: number | null;
  
  // Fan state
  requestedFanSpeedPercent: number; // UI commanded or Auto target
  hardwarePwmPercent: number | null; // Firmware reported output (null if unconfirmed)
  fanRunningState: FanRunningState;
  fanRpm: number | null; // Null if prototype has no tachometer
  
  // Exhaust fan
  exhaustFanState: boolean;
  exhaustFanRuntimeSeconds: number;
  
  // Decision details
  activeTemperatureBand: TemperatureBand;
  controllerReason: string;
  
  // Hardware status
  sensorHealth: SensorHealth;
  lastCommandId: string | null;
  lastCommandStatus: CommandStatus;
  firmwareVersion: string | null;
  systemMetrics?: SystemMetrics;
}

export interface DeviceConfig {
  deviceName: string;
  esp32BaseUrl: string;
  pollingIntervalMs: number;
  connectionTimeoutMs: number;
  
  // Auto mode temperature thresholds (°C)
  tempCoolMax: number;       // e.g. 26.0 °C
  tempComfortMax: number;    // e.g. 29.0 °C
  tempWarmMax: number;       // e.g. 32.0 °C
  tempHysteresis: number;    // e.g. 1.0 °C
  
  // Target speeds for bands (%)
  speedCool: number;         // e.g. 25% (Low)
  speedComfort: number;      // e.g. 50% (Medium)
  speedWarm: number;         // e.g. 75% (High)
  speedHot: number;          // e.g. 100% (Full)
  
  // Occupancy policy
  occupancyTimeoutMinutes: number; // e.g. 5 min
  emptyRoomSpeed: number;          // e.g. 0% (OFF) or 25% (LOW)
  
  // Wet Zone adaptive ventilation
  baselineWindowMinutes: number;   // e.g. 30 min
  humidityMarginThreshold: number; // e.g. +8% RH above baseline
  humidityRiseRateThreshold: number; // e.g. +3% RH/min
  activationHoldSeconds: number;   // e.g. 15s
  exhaustMinRuntimeMinutes: number; // e.g. 2 min
  exhaustMaxRuntimeMinutes: number; // e.g. 30 min safety cutoff
  exhaustReturnMargin: number;      // e.g. +3% RH within baseline to stop
  
  // Preferences
  tempUnit: 'C' | 'F';
  enableAnimations: boolean;
  reducedMotion: boolean;
  demoMode: boolean;
}

export type EventCategory = 'command' | 'sensor' | 'system' | 'ventilation';

export interface ActivityEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  type: string;
  title: string;
  message: string;
  source: 'DEVICE' | 'FRONTEND' | 'SIMULATION';
  details?: Record<string, any>;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface TelemetryHistoryPoint {
  timestamp: number;
  timeStr: string;
  comfortTemp: number | null;
  comfortHumidity: number | null;
  wetHumidity: number | null;
  humidityBaseline: number | null;
  fanSpeedPercent: number;
  exhaustState: number; // 0 or 1 for chart
  occupancy: number; // 0 or 1 for chart
}
