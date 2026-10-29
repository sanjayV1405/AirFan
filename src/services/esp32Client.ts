import { TelemetryData, DeviceConfig } from '../types/telemetry';

export interface CommandResult {
  success: boolean;
  commandId: string;
  status: 'ACKNOWLEDGED' | 'REJECTED' | 'TIMEOUT' | 'ERROR';
  message: string;
  data?: any;
}

export class ESP32Client {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl: string = 'http://192.168.1.100', timeoutMs: number = 3000) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public setTimeout(ms: number) {
    this.timeoutMs = ms;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const targetUrl = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(targetUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error(`Connection to ESP32 timed out after ${this.timeoutMs}ms.`);
      }
      // Check for common browser restrictions: Mixed Content or CORS
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && this.baseUrl.startsWith('http:')) {
        throw new Error(
          `Mixed Content blocked: HTTPS origin cannot directly make HTTP calls to local IP ${this.baseUrl}. Open app over HTTP or use local proxy.`
        );
      }
      throw new Error(`Network failure connecting to ${this.baseUrl}: ${err.message || 'Check Wi-Fi and device IP.'}`);
    }
  }

  /**
   * Ping / check connectivity to the ESP32
   */
  public async ping(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    try {
      const res = await this.fetchWithTimeout('/status', { method: 'GET' });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        return { ok: true, latencyMs };
      }
      return { ok: false, latencyMs, error: `ESP32 returned HTTP ${res.status} ${res.statusText}` };
    } catch (err: any) {
      return { ok: false, latencyMs: Math.round(performance.now() - start), error: err.message };
    }
  }

  /**
   * Fetch current live telemetry from the ESP32
   */
  public async getTelemetry(): Promise<TelemetryData> {
    const res = await this.fetchWithTimeout('/data', { method: 'GET' });
    if (!res.ok) {
      throw new Error(`ESP32 /data returned status ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    
    // Strict schema mapping and sanitization
    return {
      deviceId: data.deviceId || 'ESP32-AIRLOOP-01',
      timestamp: Number(data.timestamp) || Date.now(),
      connectionState: 'connected',
      activeMode: data.activeMode === 'manual' ? 'manual' : 'auto',
      
      comfortTemperatureC: data.comfortTemperatureC !== undefined && data.comfortTemperatureC !== null 
        ? Number(data.comfortTemperatureC) : null,
      comfortHumidityPercent: data.comfortHumidityPercent !== undefined && data.comfortHumidityPercent !== null 
        ? Number(data.comfortHumidityPercent) : null,
      
      wetZoneTemperatureC: data.wetZoneTemperatureC !== undefined && data.wetZoneTemperatureC !== null 
        ? Number(data.wetZoneTemperatureC) : null,
      wetZoneHumidityPercent: data.wetZoneHumidityPercent !== undefined && data.wetZoneHumidityPercent !== null 
        ? Number(data.wetZoneHumidityPercent) : null,
      humidityBaselinePercent: data.humidityBaselinePercent !== undefined && data.humidityBaselinePercent !== null 
        ? Number(data.humidityBaselinePercent) : null,
      humidityRiseRatePercentPerMinute: data.humidityRiseRatePercentPerMinute !== undefined && data.humidityRiseRatePercentPerMinute !== null 
        ? Number(data.humidityRiseRatePercentPerMinute) : null,
      
      occupancyDetected: Boolean(data.occupancyDetected),
      occupancyLastMotionAt: data.occupancyLastMotionAt ? Number(data.occupancyLastMotionAt) : null,
      
      requestedFanSpeedPercent: Number(data.requestedFanSpeedPercent) || 0,
      hardwarePwmPercent: data.hardwarePwmPercent !== undefined && data.hardwarePwmPercent !== null 
        ? Number(data.hardwarePwmPercent) : null,
      fanRunningState: data.fanRunningState || (Number(data.requestedFanSpeedPercent) > 0 ? 'RUNNING' : 'OFF'),
      fanRpm: data.fanRpm !== undefined && data.fanRpm !== null ? Number(data.fanRpm) : null, // null if no tachometer
      
      exhaustFanState: Boolean(data.exhaustFanState),
      exhaustFanRuntimeSeconds: Number(data.exhaustFanRuntimeSeconds) || 0,
      
      activeTemperatureBand: data.activeTemperatureBand || 'COOL',
      controllerReason: data.controllerReason || 'Authoritative ESP32 automatic rule evaluated',
      
      sensorHealth: {
        comfortDht11: data.sensorHealth?.comfortDht11 || 'OK',
        wetDht11: data.sensorHealth?.wetDht11 || 'OK',
        pirMotion: data.sensorHealth?.pirMotion || 'OK',
        fanMosfet: data.sensorHealth?.fanMosfet || 'OK',
        exhaustMosfet: data.sensorHealth?.exhaustMosfet || 'OK',
      },
      lastCommandId: data.lastCommandId || null,
      lastCommandStatus: data.lastCommandStatus || 'ACKNOWLEDGED',
      firmwareVersion: data.firmwareVersion || 'v1.2.0-esp32',
      systemMetrics: data.systemMetrics || undefined
    };
  }

  /**
   * Send mode command to ESP32: manual or auto
   */
  public async setMode(mode: 'manual' | 'auto'): Promise<CommandResult> {
    const commandId = `cmd_mode_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const res = await this.fetchWithTimeout('/mode', {
        method: 'POST',
        body: JSON.stringify({ mode, commandId })
      });
      if (!res.ok) {
        return {
          success: false,
          commandId,
          status: 'REJECTED',
          message: `Device rejected mode change (HTTP ${res.status}): ${res.statusText}`
        };
      }
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: `Mode successfully switched to ${mode.toUpperCase()}`,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        commandId,
        status: err.message.includes('timed out') ? 'TIMEOUT' : 'ERROR',
        message: err.message
      };
    }
  }

  /**
   * Send target fan speed command (0 - 100%)
   */
  public async setFanSpeed(speedPercent: number): Promise<CommandResult> {
    const safeSpeed = Math.max(0, Math.min(100, Math.round(speedPercent)));
    const commandId = `cmd_spd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const res = await this.fetchWithTimeout('/fan/speed', {
        method: 'POST',
        body: JSON.stringify({ speedPercent: safeSpeed, commandId })
      });
      if (!res.ok) {
        return {
          success: false,
          commandId,
          status: 'REJECTED',
          message: `ESP32 rejected speed change (HTTP ${res.status})`
        };
      }
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: `Fan speed setpoint ${safeSpeed}% accepted by ESP32 PWM controller`,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        commandId,
        status: err.message.includes('timed out') ? 'TIMEOUT' : 'ERROR',
        message: err.message
      };
    }
  }

  /**
   * Send Wet Zone exhaust fan command
   */
  public async setExhaustFan(enabled: boolean): Promise<CommandResult> {
    const commandId = `cmd_exh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const res = await this.fetchWithTimeout('/fan/exhaust', {
        method: 'POST',
        body: JSON.stringify({ enabled, commandId })
      });
      if (!res.ok) {
        return {
          success: false,
          commandId,
          status: 'REJECTED',
          message: `ESP32 rejected exhaust control (HTTP ${res.status})`
        };
      }
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: `Wet Zone exhaust fan turned ${enabled ? 'ON' : 'OFF'}`,
        data
      };
    } catch (err: any) {
      return {
        success: false,
        commandId,
        status: err.message.includes('timed out') ? 'TIMEOUT' : 'ERROR',
        message: err.message
      };
    }
  }

  /**
   * Push configuration / thresholds to ESP32
   */
  public async saveConfig(config: Partial<DeviceConfig>): Promise<CommandResult> {
    const commandId = `cmd_cfg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      const res = await this.fetchWithTimeout('/config', {
        method: 'POST',
        body: JSON.stringify({ ...config, commandId })
      });
      if (!res.ok) {
        return {
          success: false,
          commandId,
          status: 'REJECTED',
          message: `ESP32 rejected configuration save (HTTP ${res.status})`
        };
      }
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: 'ESP32 non-volatile configuration updated successfully'
      };
    } catch (err: any) {
      return {
        success: false,
        commandId,
        status: 'ERROR',
        message: err.message
      };
    }
  }
}
