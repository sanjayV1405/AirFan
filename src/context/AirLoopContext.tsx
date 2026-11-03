import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TelemetryData, DeviceConfig, ConnectionState, CommandStatus } from '../types/telemetry';
import { ESP32Client, normalizeEsp32Url } from '../services/esp32Client';
import { ConfigService } from '../services/configService';
import { historyService } from '../services/historyService';

export interface AirLoopContextType {
  telemetry: TelemetryData;
  config: DeviceConfig;
  connectionState: ConnectionState;
  isStale: boolean;
  isPolling: boolean;
  connectionError: string | null;
  lastSuccessfulUpdate: number | null;
  pingLatency: number | null;
  commandPending: boolean;
  lastCommandFeedback: { id: string; status: CommandStatus; message: string } | null;
  activeNav: string;
  setActiveNav: (nav: string) => void;

  // Connection Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  pingDevice: () => Promise<{ ok: boolean; latencyMs: number; error?: string; data?: any }>;

  // Control Actions
  setOperatingMode: (mode: 'manual' | 'auto') => Promise<boolean>;
  setFanSpeed: (speedPercent: number) => Promise<boolean>;
  setExhaustFan: (enabled: boolean) => Promise<boolean>;
  updateConfig: (newConfig: Partial<DeviceConfig>) => void;
  saveConfigToDevice: () => Promise<boolean>;
}

const INITIAL_TELEMETRY: TelemetryData = {
  deviceId: 'ESP32-AIRLOOP',
  timestamp: Date.now(),
  connectionState: 'offline',
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
  controllerReason: 'Hardware Offline — Click Connect ESP32 to begin',
  sensorHealth: {
    comfortDht11: 'DISCONNECTED',
    wetDht11: 'DISCONNECTED',
    pirMotion: 'OK',
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

  // Set dark theme globally
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  // Real ESP32 HTTP Client
  const esp32Client = useMemo(
    () => new ESP32Client(config.esp32BaseUrl, config.connectionTimeoutMs),
    [config.esp32BaseUrl, config.connectionTimeoutMs]
  );

  // Live telemetry state (starts offline until real hardware connects)
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [connectionState, setConnectionState] = useState<ConnectionState>('offline');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<number | null>(null);
  const lastSuccessfulUpdateRef = useRef<number | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [commandPending, setCommandPending] = useState<boolean>(false);
  const [lastCommandFeedback, setLastCommandFeedback] = useState<{ id: string; status: CommandStatus; message: string } | null>(null);

  const prevTelemetryRef = useRef<TelemetryData>(telemetry);
  const consecutiveFailuresRef = useRef<number>(0);
  const isPollingRef = useRef<boolean>(isPolling);
  useEffect(() => {
    isPollingRef.current = isPolling;
  }, [isPolling]);

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
    setConnectionError(null);

    // Log hardware connection event
    if (prev.connectionState !== 'connected' && data.connectionState === 'connected') {
      historyService.logEvent(
        'system',
        'HARDWARE_CONNECTED',
        'ESP32 Connected',
        `Live telemetry established with ${config.esp32BaseUrl} (/api/status).`,
        'DEVICE',
        'success'
      );
    }

    // Log fan state changes
    if (prev.fanRunningState !== data.fanRunningState || prev.hardwarePwmPercent !== data.hardwarePwmPercent) {
      if (data.fanRunningState === 'RUNNING') {
        historyService.logEvent(
          'command',
          'FAN_ACTIVE',
          `Ceiling Fan Running at ${data.hardwarePwmPercent ?? 0}% PWM`,
          `Hardware reported fan active. Output duty: ${data.hardwarePwmPercent ?? 0}%.`,
          'DEVICE',
          'info'
        );
      } else if (prev.fanRunningState === 'RUNNING') {
        historyService.logEvent(
          'command',
          'FAN_STOPPED',
          'Ceiling Fan Idle',
          'Hardware reported fan speed 0% PWM.',
          'DEVICE',
          'info'
        );
      }
    }

    // Add point to chart history
    historyService.addTelemetrySample(data);
  }, [config.esp32BaseUrl]);

  // Single poll tick logic
  const executePollTick = useCallback(async () => {
    if (!isPollingRef.current) return;

    try {
      const liveData = await esp32Client.getTelemetry();
      if (isPollingRef.current) {
        setConnectionState('connected');
        handleNewTelemetry(liveData);
      }
    } catch (err: any) {
      if (isPollingRef.current) {
        consecutiveFailuresRef.current += 1;
        // Require 2 consecutive failures to avoid flapping on transient network hiccups
        if (consecutiveFailuresRef.current >= 2) {
          setConnectionState('offline');
          setIsStale(true);
          setConnectionError(err.message || `Cannot connect to ${config.esp32BaseUrl}`);
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
            controllerReason: `Hardware offline: ${err.message || 'Check ESP32 Wi-Fi and IP address.'}`
          }));
        }
      }
    }
  }, [config.esp32BaseUrl, esp32Client, handleNewTelemetry]);

  // Main Polling Loop — Runs every pollingIntervalMs (default 2s) when isPolling is true
  useEffect(() => {
    if (!isPolling) return;

    let isSubscribed = true;

    // Run first poll tick immediately
    executePollTick();

    // Setup 2-second recurring interval
    const interval = setInterval(() => {
      if (isSubscribed && isPollingRef.current) {
        executePollTick();
      }
    }, Math.max(1000, config.pollingIntervalMs || 2000));

    // Stale data watchdog (checks if updates stopped coming for > 6 seconds)
    const watchdog = setInterval(() => {
      if (isSubscribed && lastSuccessfulUpdateRef.current && isPollingRef.current) {
        const elapsed = Date.now() - lastSuccessfulUpdateRef.current;
        if (elapsed > 6000) {
          setIsStale(true);
        }
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      clearInterval(watchdog);
    };
  }, [config.pollingIntervalMs, executePollTick, isPolling]);

  // Connect to ESP32: activates polling, sets connecting state, attempts immediate poll
  const connect = useCallback(async () => {
    setIsPolling(true);
    isPollingRef.current = true;
    setConnectionState('connecting');
    setConnectionError(null);
    consecutiveFailuresRef.current = 0;

    historyService.logEvent(
      'system',
      'CONNECT_ATTEMPT',
      'Connecting to ESP32',
      `Querying ${config.esp32BaseUrl}/api/status...`,
      'FRONTEND',
      'info'
    );

    try {
      const pingRes = await esp32Client.ping();
      setPingLatency(pingRes.latencyMs);

      if (pingRes.ok) {
        const liveData = await esp32Client.getTelemetry();
        setConnectionState('connected');
        handleNewTelemetry(liveData);
      } else {
        setConnectionState('offline');
        setConnectionError(pingRes.error || `ESP32 not responding at ${config.esp32BaseUrl}`);
        historyService.logEvent(
          'system',
          'CONNECT_FAILED',
          'Connection Failed',
          pingRes.error || `Could not reach ${config.esp32BaseUrl}. Verify device is powered and on the same Wi-Fi.`,
          'FRONTEND',
          'error'
        );
      }
    } catch (err: any) {
      setConnectionState('offline');
      setConnectionError(err.message || 'Network error connecting to ESP32.');
      historyService.logEvent(
        'system',
        'CONNECT_FAILED',
        'Connection Failed',
        err.message || 'Network error connecting to ESP32.',
        'FRONTEND',
        'error'
      );
    }
  }, [config.esp32BaseUrl, esp32Client, handleNewTelemetry]);

  // Disconnect from ESP32: stops polling, cleans up state, marks offline
  const disconnect = useCallback(() => {
    setIsPolling(false);
    isPollingRef.current = false;
    setConnectionState('offline');
    setConnectionError(null);
    setIsStale(false);
    lastSuccessfulUpdateRef.current = null;
    setLastSuccessfulUpdate(null);
    setPingLatency(null);

    setTelemetry({
      ...INITIAL_TELEMETRY,
      timestamp: Date.now(),
      connectionState: 'offline',
      controllerReason: 'Hardware disconnected by user.'
    });

    historyService.logEvent(
      'system',
      'HARDWARE_DISCONNECTED',
      'ESP32 Disconnected',
      'Live polling stopped. Hardware disconnected.',
      'FRONTEND',
      'info'
    );
  }, []);

  const reconnect = useCallback(async () => {
    await connect();
  }, [connect]);

  const pingDevice = useCallback(async () => {
    const res = await esp32Client.ping();
    setPingLatency(res.latencyMs);
    return res;
  }, [esp32Client]);

  // Real Hardware Commands
  const setOperatingMode = async (mode: 'manual' | 'auto'): Promise<boolean> => {
    if (connectionState !== 'connected') {
      setLastCommandFeedback({
        id: `err_${Date.now()}`,
        status: 'ERROR',
        message: 'Cannot change mode: Hardware is offline.'
      });
      return false;
    }

    setCommandPending(true);
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
        message: 'Cannot adjust fan: Hardware is offline.'
      });
      return false;
    }

    setCommandPending(true);
    const safe = Math.max(0, Math.min(100, Math.round(speedPercent)));
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
        message: 'Cannot control ventilation: Hardware is offline.'
      });
      return false;
    }

    setCommandPending(true);
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

  const updateConfig = (newConfig: Partial<DeviceConfig>) => {
    const normalizedUrl = newConfig.esp32BaseUrl ? normalizeEsp32Url(newConfig.esp32BaseUrl) : config.esp32BaseUrl;
    const merged = { ...config, ...newConfig, esp32BaseUrl: normalizedUrl };
    setConfig(merged);
    ConfigService.save(merged);
    historyService.logEvent('system', 'CONFIG_UPDATED', 'Settings Saved', 'Configuration updated.', 'FRONTEND', 'info');
  };

  const saveConfigToDevice = async (): Promise<boolean> => {
    if (connectionState !== 'connected') {
      setLastCommandFeedback({
        id: `err_${Date.now()}`,
        status: 'ERROR',
        message: 'Cannot sync settings: Hardware is offline.'
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
        connectionError,
        lastSuccessfulUpdate,
        pingLatency,
        commandPending,
        lastCommandFeedback,
        activeNav,
        setActiveNav,
        connect,
        disconnect,
        reconnect,
        pingDevice,
        setOperatingMode,
        setFanSpeed,
        setExhaustFan,
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
