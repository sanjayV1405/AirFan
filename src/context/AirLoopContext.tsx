import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TelemetryData, DeviceConfig, ConnectionState, CommandStatus } from '../types/telemetry';
import { ESP32Client } from '../services/esp32Client';
import { SimulationEngine } from '../services/simulationEngine';
import { ConfigService, DEFAULT_CONFIG } from '../services/configService';
import { historyService } from '../services/historyService';

interface AirLoopContextType {
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

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Actions
  setOperatingMode: (mode: 'manual' | 'auto') => Promise<boolean>;
  setFanSpeed: (speedPercent: number) => Promise<boolean>;
  setExhaustFan: (enabled: boolean) => Promise<boolean>;
  reconnect: () => Promise<void>;
  pingDevice: () => Promise<{ ok: boolean; latencyMs: number; error?: string }>;
  updateConfig: (newConfig: Partial<DeviceConfig>) => void;
  saveConfigToDevice: () => Promise<boolean>;
  toggleDemoMode: (enable?: boolean) => void;

  // Demo Simulation Triggers (clearly marked)
  triggerMoistureSpike: () => void;
  triggerMotionToggle: () => void;
  adjustSimTemp: (delta: number) => void;
}

const AirLoopContext = createContext<AirLoopContextType | null>(null);

export const AirLoopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<DeviceConfig>(() => ConfigService.load());
  const [activeNav, setActiveNav] = useState<string>('overview');

  // Theme state with localStorage persistence
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('airloop_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'dark'; // preserve existing dark theme by default
  });

  useEffect(() => {
    try {
      localStorage.setItem('airloop_theme', theme);
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t);
  }, []);

  // Clients
  const esp32Client = useMemo(() => new ESP32Client(config.esp32BaseUrl, config.connectionTimeoutMs), [config.esp32BaseUrl, config.connectionTimeoutMs]);
  const simEngine = useMemo(() => new SimulationEngine(config), []);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => simEngine.step());
  const [connectionState, setConnectionState] = useState<ConnectionState>(config.demoMode ? 'demo' : 'connecting');
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<number | null>(Date.now());
  const lastSuccessfulUpdateRef = useRef<number | null>(Date.now());
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [commandPending, setCommandPending] = useState<boolean>(false);
  const [lastCommandFeedback, setLastCommandFeedback] = useState<{ id: string; status: CommandStatus; message: string } | null>(null);

  const prevTelemetryRef = useRef<TelemetryData>(telemetry);
  const consecutiveFailuresRef = useRef<number>(0);

  // Sync simEngine configuration whenever config changes
  useEffect(() => {
    simEngine.updateConfig(config);
    esp32Client.setBaseUrl(config.esp32BaseUrl);
    esp32Client.setTimeout(config.connectionTimeoutMs);
  }, [config, simEngine, esp32Client]);

  // Handle telemetry ingestion & state tracking
  const handleNewTelemetry = useCallback((data: TelemetryData) => {
    const prev = prevTelemetryRef.current;
    prevTelemetryRef.current = data;

    const now = Date.now();
    lastSuccessfulUpdateRef.current = now;
    setTelemetry(data);
    setLastSuccessfulUpdate(now);
    setIsStale(false);
    consecutiveFailuresRef.current = 0;

    // Log relevant state transitions to event history
    if (prev.activeMode !== data.activeMode) {
      historyService.logEvent(
        'command',
        'MODE_CHANGED',
        `Mode Changed to ${data.activeMode.toUpperCase()}`,
        `System operating mode switched to ${data.activeMode}.`,
        data.connectionState === 'demo' ? 'SIMULATION' : 'DEVICE',
        'info'
      );
    }

    if (prev.activeTemperatureBand !== data.activeTemperatureBand) {
      historyService.logEvent(
        'sensor',
        'BAND_TRANSITION',
        `Comfort Band: ${data.activeTemperatureBand}`,
        `Temperature ${data.comfortTemperatureC}°C transitioned zone to ${data.activeTemperatureBand}. Output: ${data.requestedFanSpeedPercent}%`,
        data.connectionState === 'demo' ? 'SIMULATION' : 'DEVICE',
        'info'
      );
    }

    if (prev.exhaustFanState !== data.exhaustFanState) {
      historyService.logEvent(
        'ventilation',
        data.exhaustFanState ? 'EXHAUST_START' : 'EXHAUST_STOP',
        `Wet Zone Exhaust ${data.exhaustFanState ? 'Activated' : 'Stopped'}`,
        data.exhaustFanState 
          ? `Moisture event triggered exhaust fan (Humidity: ${data.wetZoneHumidityPercent}% RH, Baseline: ${data.humidityBaselinePercent}%).`
          : 'Humidity returned to baseline safe margin or maximum runtime elapsed.',
        data.connectionState === 'demo' ? 'SIMULATION' : 'DEVICE',
        data.exhaustFanState ? 'warning' : 'info'
      );
    }

    if (prev.occupancyDetected !== data.occupancyDetected) {
      historyService.logEvent(
        'sensor',
        data.occupancyDetected ? 'MOTION_DETECTED' : 'ROOM_EMPTY',
        data.occupancyDetected ? 'Motion Detected' : 'Room Vacated',
        data.occupancyDetected ? 'PIR sensor detected movement in room.' : 'No motion detected; occupancy timer started.',
        data.connectionState === 'demo' ? 'SIMULATION' : 'DEVICE',
        'info'
      );
    }

    // Add point to real-time chart history
    historyService.addTelemetrySample(data);
  }, []);

  // Main Polling Loop
  useEffect(() => {
    if (!isPolling) return;

    let isSubscribed = true;

    const pollTick = async () => {
      if (config.demoMode) {
        // DEMO SIMULATION
        const simData = simEngine.step();
        if (isSubscribed) {
          setConnectionState('demo');
          handleNewTelemetry(simData);
        }
      } else {
        // REAL ESP32 HARDWARE
        try {
          const liveData = await esp32Client.getTelemetry();
          if (isSubscribed) {
            setConnectionState('connected');
            handleNewTelemetry(liveData);
          }
        } catch (err: any) {
          if (isSubscribed) {
            consecutiveFailuresRef.current += 1;
            if (consecutiveFailuresRef.current >= 3) {
              setConnectionState('offline');
              setIsStale(true);
            }
          }
        }
      }
    };

    // Immediate first tick
    pollTick();

    const interval = setInterval(pollTick, config.pollingIntervalMs);

    // Stale data watchdog (runs every 2s)
    const watchdog = setInterval(() => {
      if (!config.demoMode && lastSuccessfulUpdateRef.current) {
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
  }, [config.demoMode, config.pollingIntervalMs, esp32Client, simEngine, handleNewTelemetry, isPolling]);

  // Actions
  const setOperatingMode = async (mode: 'manual' | 'auto'): Promise<boolean> => {
    setCommandPending(true);
    historyService.logEvent(
      'command',
      'MODE_REQUEST',
      `Requesting ${mode.toUpperCase()} Mode`,
      `User initiated switch to ${mode} mode. Waiting for device confirmation...`,
      'FRONTEND',
      'info'
    );

    if (config.demoMode) {
      // Simulate fast acknowledgment
      await new Promise(r => setTimeout(r, 300));
      simEngine.setMode(mode);
      setCommandPending(false);
      setLastCommandFeedback({
        id: `sim_mode_${Date.now()}`,
        status: 'ACKNOWLEDGED',
        message: `Mode switched to ${mode.toUpperCase()} (Demo)`
      });
      return true;
    }

    // Live ESP32 command
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
      res.success ? 'Mode Change Confirmed' : 'Mode Change Failed',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );

    return res.success;
  };

  const setFanSpeed = async (speedPercent: number): Promise<boolean> => {
    setCommandPending(true);
    const safe = Math.max(0, Math.min(100, Math.round(speedPercent)));
    historyService.logEvent(
      'command',
      'SPEED_REQUEST',
      `Requesting Fan Speed: ${safe}%`,
      `User sent speed setpoint ${safe}%. Awaiting hardware confirmation.`,
      'FRONTEND',
      'info'
    );

    if (config.demoMode) {
      await new Promise(r => setTimeout(r, 250));
      simEngine.setManualSpeed(safe);
      setCommandPending(false);
      setLastCommandFeedback({
        id: `sim_spd_${Date.now()}`,
        status: 'ACKNOWLEDGED',
        message: `PWM setpoint ${safe}% applied (Demo)`
      });
      return true;
    }

    // Live ESP32 command
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
      res.success ? `Fan Speed Acknowledged: ${safe}%` : 'Fan Speed Command Failed',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );

    return res.success;
  };

  const setExhaustFan = async (enabled: boolean): Promise<boolean> => {
    setCommandPending(true);
    historyService.logEvent(
      'command',
      'EXHAUST_REQUEST',
      `Requesting Exhaust ${enabled ? 'ON' : 'OFF'}`,
      `User toggled exhaust fan state to ${enabled ? 'ON' : 'OFF'}.`,
      'FRONTEND',
      'info'
    );

    if (config.demoMode) {
      await new Promise(r => setTimeout(r, 200));
      simEngine.setExhaustFan(enabled);
      setCommandPending(false);
      setLastCommandFeedback({
        id: `sim_exh_${Date.now()}`,
        status: 'ACKNOWLEDGED',
        message: `Exhaust fan set to ${enabled ? 'ON' : 'OFF'} (Demo)`
      });
      return true;
    }

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
      res.success ? `Exhaust ${enabled ? 'ON' : 'OFF'} Confirmed` : 'Exhaust Control Failed',
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
      historyService.logEvent('system', 'DEVICE_RECONNECTED', 'ESP32 Reconnected', `Device reachable at ${config.esp32BaseUrl} (${pingRes.latencyMs}ms)`, 'DEVICE', 'success');
    } else {
      setConnectionState('offline');
      historyService.logEvent('system', 'RECONNECT_FAILED', 'Connection Attempt Failed', pingRes.error || 'Device unresponsive', 'FRONTEND', 'error');
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
    historyService.logEvent('system', 'CONFIG_UPDATED', 'Local Settings Updated', 'AirLoop local parameters updated in browser storage.', 'FRONTEND', 'info');
  };

  const saveConfigToDevice = async (): Promise<boolean> => {
    setCommandPending(true);
    if (config.demoMode) {
      await new Promise(r => setTimeout(r, 400));
      setCommandPending(false);
      historyService.logEvent('command', 'CONFIG_SAVED', 'Settings Saved (Demo)', 'Simulated configuration synchronized.', 'SIMULATION', 'success');
      return true;
    }

    const res = await esp32Client.saveConfig(config);
    setCommandPending(false);
    historyService.logEvent(
      'command',
      res.success ? 'CONFIG_SAVED' : 'CONFIG_SAVE_FAILED',
      res.success ? 'ESP32 Settings Saved' : 'ESP32 Save Rejected',
      res.message,
      'DEVICE',
      res.success ? 'success' : 'error'
    );
    return res.success;
  };

  const toggleDemoMode = (enable?: boolean) => {
    const target = enable !== undefined ? enable : !config.demoMode;
    const updated = { ...config, demoMode: target };
    setConfig(updated);
    ConfigService.save(updated);

    if (target) {
      setConnectionState('demo');
      historyService.logEvent('system', 'DEMO_ENABLED', 'Demo Mode Activated', 'Switched to simulated in-browser telemetry. Not connected to hardware.', 'FRONTEND', 'warning');
    } else {
      setConnectionState('connecting');
      historyService.logEvent('system', 'DEMO_DISABLED', 'Hardware Mode Activated', `Connecting to real ESP32 at ${config.esp32BaseUrl}...`, 'FRONTEND', 'info');
    }
  };

  // Demo simulation triggers
  const triggerMoistureSpike = () => {
    if (config.demoMode) {
      simEngine.triggerMoistureEvent();
      historyService.logEvent('sensor', 'SIM_SHOWER', 'Simulated Moisture Event', 'Simulated shower turned on; wet-zone humidity spiking rapidly.', 'SIMULATION', 'warning');
    }
  };

  const triggerMotionToggle = () => {
    if (config.demoMode) {
      simEngine.toggleMotion();
    }
  };

  const adjustSimTemp = (delta: number) => {
    if (config.demoMode) {
      simEngine.adjustSimulatedTemperature(delta);
    }
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
        theme,
        toggleTheme,
        setTheme,
        setOperatingMode,
        setFanSpeed,
        setExhaustFan,
        reconnect,
        pingDevice,
        updateConfig,
        saveConfigToDevice,
        toggleDemoMode,
        triggerMoistureSpike,
        triggerMotionToggle,
        adjustSimTemp
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
