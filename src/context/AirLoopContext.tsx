import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TelemetryData, DeviceConfig, ConnectionState, CommandStatus } from '../types/telemetry';
import { ESP32Client } from '../services/esp32Client';
import { ConfigService } from '../services/configService';
import { historyService } from '../services/historyService';

export interface AirLoopContextType {
  telemetry: TelemetryData;
  config: DeviceConfig;
  connectionState: ConnectionState;
  isStale: boolean;
  isPolling: boolean;
  lastSuccessfulUpdate: number | null;
  pingLatency: number | null;
  commandPending: boolean;
  lastCommandFeedback: { id: string; status: CommandStatus; message: string } | null;
  activeNav: string;
  setActiveNav: (nav: string) => void;

  // Actions
  setOperatingMode: (mode: 'manual' | 'auto') => Promise<boolean>;
  setFanSpeed: (speedPercent: number) => Promise<boolean>;
  setExhaustFan: (enabled: boolean) => Promise<boolean>;
  reconnect: () => Promise<void>;
  pingDevice: () => Promise<{ ok: boolean; latencyMs: number; error?: string }>;
  updateConfig: (newConfig: Partial<DeviceConfig>) => void;
  saveConfigToDevice: () => Promise<boolean>;
}

const INITIAL_TELEMETRY: TelemetryData = {
  deviceId: 'ESP32-AIRLOOP',
  timestamp: Date.now(),
  connectionState: 'connecting',
  activeMode: 'auto',
  comfortTemperatureC: null,
  comfortHumidityPercent: null,
  wetZoneTemperatureC: null,
  wetZoneHumidityPercent: null,
  humidityBaselinePercent: null,
  humidityRiseRatePercentPerMinute: null,
  occupancyDetected: false,
  occupancyLastMotionAt: null,
  requestedFanSpeedPercent: 0,
  hardwarePwmPercent: null,
  fanRunningState: 'OFF',
  fanRpm: null,
  exhaustFanState: false,
  exhaustFanRuntimeSeconds: 0,
  activeTemperatureBand: 'COOL',
  controllerReason: 'Waiting for hardware connection...',
  sensorHealth: {
    comfortDht11: 'DISCONNECTED',
    wetDht11: 'DISCONNECTED',
    pirMotion: 'DISCONNECTED',
    fanMosfet: 'OK',
    exhaustMosfet: 'OK',
  },
  lastCommandId: null,
  lastCommandStatus: 'IDLE',
  firmwareVersion: null
};

const AirLoopContext = createContext<AirLoopContextType | null>(null);

export const AirLoopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DeviceConfig>(() => ConfigService.load());
  const [activeNav, setActiveNav] = useState<string>('overview');

  // Set light theme globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  // Real ESP32 HTTP Client
  const esp32Client = useMemo(
    () => new ESP32Client(config.esp32BaseUrl, config.connectionTimeoutMs),
    [config.esp32BaseUrl, config.connectionTimeoutMs]
  );

  // Live telemetry state (starts with unavailable values until real hardware responds)
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<number | null>(null);
  const lastSuccessfulUpdateRef = useRef<number | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPolling] = useState<boolean>(true);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [commandPending, setCommandPending] = useState<boolean>(false);
  const [lastCommandFeedback, setLastCommandFeedback] = useState<{ id: string; status: CommandStatus; message: string } | null>(null);

  const prevTelemetryRef = useRef<TelemetryData>(telemetry);
  const consecutiveFailuresRef = useRef<number>(0);

  // Sync client parameters with config changes
  useEffect(() => {
    esp32Client.setBaseUrl(config.esp32BaseUrl);
    esp32Client.setTimeout(config.connectionTimeoutMs);
  }, [config.esp32BaseUrl, config.connectionTimeoutMs, esp32Client]);

  // Handle live incoming hardware telemetry
  const handleNewTelemetry = useCallback((data: TelemetryData) => {
    const prev = prevTelemetryRef.current;
    prevTelemetryRef.current = data;

    const now = Date.now();
    lastSuccessfulUpdateRef.current = now;
    setTelemetry(data);
    setLastSuccessfulUpdate(now);
    setIsStale(false);
    consecutiveFailuresRef.current = 0;

    // Log real hardware state transitions
    if (prev.connectionState !== 'connected' && data.connectionState === 'connected') {
      historyService.logEvent(
        'system',
        'HARDWARE_CONNECTED',
        'Hardware Connected',
        `Live ESP32 telemetry feed established at ${config.esp32BaseUrl}.`,
        'DEVICE',
        'success'
      );
    }

    if (prev.activeMode !== data.activeMode) {
      historyService.logEvent(
        'command',
        'MODE_CHANGED',
        `Mode Changed to ${data.activeMode === 'auto' ? 'Automatic' : 'Manual'}`,
        `Room fan regulation set to ${data.activeMode === 'auto' ? 'Automatic' : 'Manual'}.`,
        'DEVICE',
        'info'
      );
    }

    if (prev.exhaustFanState !== data.exhaustFanState) {
      historyService.logEvent(
        'ventilation',
        data.exhaustFanState ? 'VENTILATION_START' : 'VENTILATION_STOP',
        `Ventilation Fan ${data.exhaustFanState ? 'Started' : 'Stopped'}`,
        data.exhaustFanState 
          ? `Ventilation activated (Humidity: ${data.wetZoneHumidityPercent ?? '--'}%).`
          : 'Ventilation stopped. Humidity within target range.',
        'DEVICE',
        data.exhaustFanState ? 'warning' : 'info'
      );
    }

    if (prev.occupancyDetected !== data.occupancyDetected) {
      historyService.logEvent(
        'sensor',
        data.occupancyDetected ? 'ROOM_OCCUPIED' : 'ROOM_EMPTY',
        data.occupancyDetected ? 'Motion Detected' : 'Room Vacated',
        data.occupancyDetected ? 'Occupancy sensor detected presence.' : 'No motion detected.',
        'DEVICE',
        'info'
      );
    }

    // Add point to chart history
    historyService.addTelemetrySample(data);
  }, [config.esp32BaseUrl]);

  // Main Polling Loop — Strictly Real Hardware
  useEffect(() => {
    if (!isPolling) return;

    let isSubscribed = true;

    const pollTick = async () => {
      try {
        const liveData = await esp32Client.getTelemetry();
        if (isSubscribed) {
          setConnectionState('connected');
          handleNewTelemetry(liveData);
        }
      } catch {
        if (isSubscribed) {
          consecutiveFailuresRef.current += 1;
          if (consecutiveFailuresRef.current >= 2) {
            setConnectionState('offline');
            setIsStale(true);
            setTelemetry(prev => ({
              ...prev,
              connectionState: 'offline',
              comfortTemperatureC: null,
              comfortHumidityPercent: null,
              wetZoneTemperatureC: null,
              wetZoneHumidityPercent: null,
              fanRunningState: 'OFF',
              requestedFanSpeedPercent: 0,
              hardwarePwmPercent: null,
              exhaustFanState: false,
              controllerReason: 'Hardware disconnected. Waiting for connection...'
            }));
          }
        }
      }
    };

    // Immediate first tick
    pollTick();
    const interval = setInterval(pollTick, config.pollingIntervalMs);

    // Stale data watchdog (checks if updates stopped coming)
    const watchdog = setInterval(() => {
      if (lastSuccessfulUpdateRef.current) {
        const elapsed = Date.now() - lastSuccessfulUpdateRef.current;
        if (elapsed > 7000) {
          setIsStale(true);
        }
      }
    }, 2500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      clearInterval(watchdog);
    };
  }, [config.pollingIntervalMs, esp32Client, handleNewTelemetry, isPolling]);

  // Real Hardware Commands
  const setOperatingMode = async (mode: 'manual' | 'auto'): Promise<boolean> => {
    if (connectionState !== 'connected') {
      setLastCommandFeedback({
        id: `err_${Date.now()}`,
        status: 'ERROR',
        message: 'Cannot change mode: Hardware is disconnected.'
      });
      return false;
    }

    setCommandPending(true);
    historyService.logEvent(
      'command',
      'MODE_REQUEST',
      `Switching to ${mode === 'auto' ? 'Automatic' : 'Manual'} Mode`,
      `Requesting hardware switch to ${mode} mode...`,
      'FRONTEND',
      'info'
    );

    const res = await esp32Client.setMode(mode);
    setCommandPending(false);
    setLastCommandFeedback({
      id: res.commandId,
      status: res.status,
      message: res.message
    });

    historyService.logEvent(
      'command',
      res.success ? 'MODE_ACK' : 'MODE_REJECT',
      res.success ? 'Mode Updated' : 'Mode Change Failed',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );

    return res.success;
  };

  const setFanSpeed = async (speedPercent: number): Promise<boolean> => {
    if (connectionState !== 'connected') {
      setLastCommandFeedback({
        id: `err_${Date.now()}`,
        status: 'ERROR',
        message: 'Cannot adjust fan: Hardware is disconnected.'
      });
      return false;
    }

    setCommandPending(true);
    const safe = Math.max(0, Math.min(100, Math.round(speedPercent)));
    historyService.logEvent(
      'command',
      'SPEED_REQUEST',
      `Setting Room Fan Speed to ${safe}%`,
      `Sending speed command ${safe}% to hardware...`,
      'FRONTEND',
      'info'
    );

    const res = await esp32Client.setFanSpeed(safe);
    setCommandPending(false);
    setLastCommandFeedback({
      id: res.commandId,
      status: res.status,
      message: res.message
    });

    historyService.logEvent(
      'command',
      res.success ? 'SPEED_ACK' : 'SPEED_REJECT',
      res.success ? `Fan Speed Set to ${safe}%` : 'Fan Speed Command Failed',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );

    return res.success;
  };

  const setExhaustFan = async (enabled: boolean): Promise<boolean> => {
    if (connectionState !== 'connected') {
      setLastCommandFeedback({
        id: `err_${Date.now()}`,
        status: 'ERROR',
        message: 'Cannot control ventilation: Hardware is disconnected.'
      });
      return false;
    }

    setCommandPending(true);
    historyService.logEvent(
      'command',
      'EXHAUST_REQUEST',
      `Turning Ventilation ${enabled ? 'On' : 'Off'}`,
      `Sending ventilation command to hardware...`,
      'FRONTEND',
      'info'
    );

    const res = await esp32Client.setExhaustFan(enabled);
    setCommandPending(false);
    setLastCommandFeedback({
      id: res.commandId,
      status: res.status,
      message: res.message
    });

    historyService.logEvent(
      'command',
      res.success ? 'EXHAUST_ACK' : 'EXHAUST_REJECT',
      res.success ? `Ventilation Fan ${enabled ? 'On' : 'Off'} Confirmed` : 'Ventilation Control Failed',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );

    return res.success;
  };

  const reconnect = async () => {
    setConnectionState('connecting');
    const pingRes = await esp32Client.ping();
    setPingLatency(pingRes.latencyMs);
    if (pingRes.ok) {
      setConnectionState('connected');
      historyService.logEvent(
        'system',
        'DEVICE_RECONNECTED',
        'Hardware Reconnected',
        `ESP32 responsive at ${config.esp32BaseUrl} (${pingRes.latencyMs}ms).`,
        'DEVICE',
        'success'
      );
    } else {
      setConnectionState('offline');
      historyService.logEvent(
        'system',
        'RECONNECT_FAILED',
        'Connection Failed',
        pingRes.error || 'Hardware unreachable. Check IP and Wi-Fi.',
        'FRONTEND',
        'error'
      );
    }
  };

  const pingDevice = async () => {
    const res = await esp32Client.ping();
    setPingLatency(res.latencyMs);
    return res;
  };

  const updateConfig = (newConfig: Partial<DeviceConfig>) => {
    const merged = { ...config, ...newConfig };
    setConfig(merged);
    ConfigService.save(merged);
    historyService.logEvent('system', 'CONFIG_UPDATED', 'Settings Saved', 'Local settings updated.', 'FRONTEND', 'info');
  };

  const saveConfigToDevice = async (): Promise<boolean> => {
    if (connectionState !== 'connected') {
      setLastCommandFeedback({
        id: `err_${Date.now()}`,
        status: 'ERROR',
        message: 'Cannot sync settings: Hardware is disconnected.'
      });
      return false;
    }

    setCommandPending(true);
    const res = await esp32Client.saveConfig(config);
    setCommandPending(false);
    historyService.logEvent(
      'command',
      res.success ? 'CONFIG_SAVED' : 'CONFIG_SAVE_FAILED',
      res.success ? 'Settings Synced with Hardware' : 'Settings Sync Rejected',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );
    return res.success;
  };

  return (
    <AirLoopContext.Provider
      value={{
        telemetry,
        config,
        connectionState,
        isStale,
        isPolling,
        lastSuccessfulUpdate,
        pingLatency,
        commandPending,
        lastCommandFeedback,
        activeNav,
        setActiveNav,
        setOperatingMode,
        setFanSpeed,
        setExhaustFan,
        reconnect,
        pingDevice,
        updateConfig,
        saveConfigToDevice
      }}
    >
      {children}
    </AirLoopContext.Provider>
  );
};

export const useAirLoop = () => {
  const context = useContext(AirLoopContext);
  if (!context) {
    throw new Error('useAirLoop must be used within an AirLoopProvider');
  }
  return context;
};
