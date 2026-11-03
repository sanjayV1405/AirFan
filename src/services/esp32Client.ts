import { TelemetryData, DeviceConfig, FanRunningState } from '../types/telemetry';

export interface CommandResult {
  success: boolean;
  commandId: string;
  status: 'ACKNOWLEDGED' | 'REJECTED' | 'TIMEOUT' | 'ERROR';
  message: string;
  data?: any;
}

/**
 * Expected JSON payload from ESP32 Wi-Fi HTTP API
 * GET http://ESP32_LOCAL_IP/api/status
 */
export interface Esp32StatusResponse {
  temperature?: number | string | null;
  humidity?: number | string | null;
  fanPWM?: number | string | null;
  fanState?: string | boolean | null;
  sensorStatus?: string | null;
  connected?: boolean | null;

  // Optional extensions for backwards-compatibility
  comfortTemperatureC?: number | string | null;
  comfortHumidityPercent?: number | string | null;
  wetZoneTemperatureC?: number | string | null;
  wetZoneHumidityPercent?: number | string | null;
  hardwarePwmPercent?: number | string | null;
  requestedFanSpeedPercent?: number | string | null;
  fanRunningState?: string | null;
  activeMode?: 'manual' | 'auto';
  occupancyDetected?: boolean;
  exhaustFanState?: boolean;
  [key: string]: any;
}

/**
 * Normalize user-entered IP or URL into a valid base HTTP URL
 * e.g. "192.168.1.50" -> "http://192.168.1.50"
 * e.g. "http://192.168.1.50/api/status" -> "http://192.168.1.50"
 */
export function normalizeEsp32Url(input: string): string {
  let cleaned = (input || '').trim();
  if (!cleaned) return 'http://192.168.1.50';

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }

  // Strip trailing /api/status or /status or /data if accidentally included by the user
  cleaned = cleaned.replace(/\/api\/status\/?$/i, '');
  cleaned = cleaned.replace(/\/status\/?$/i, '');
  cleaned = cleaned.replace(/\/data\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');

  return cleaned;
}

export class ESP32Client {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl: string = 'http://192.168.1.50', timeoutMs: number = 3000) {
    this.baseUrl = normalizeEsp32Url(baseUrl);
    this.timeoutMs = timeoutMs;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = normalizeEsp32Url(url);
  }

  public setTimeout(ms: number) {
    this.timeoutMs = ms;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getStatusEndpointUrl(): string {
    return `${this.baseUrl}/api/status`;
  }

  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const targetUrl = `${this.baseUrl}${path}`;
      const response = await fetch(targetUrl, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          ...(options.headers || {})
        }
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error(`Connection timed out after ${this.timeoutMs}ms.`);
      }
      if (typeof window !== 'undefined' && window.location.protocol === 'https:' && this.baseUrl.startsWith('http:')) {
        throw new Error(
          `Mixed Content blocked: HTTPS origin cannot make HTTP calls to local IP ${this.baseUrl}. Open app over HTTP or via localhost.`
        );
      }
      throw new Error(`Cannot reach ESP32 at ${this.baseUrl}: ${err.message || 'Check Wi-Fi and device IP.'}`);
    }
  }

  /**
   * Ping / check connectivity to the ESP32 endpoint (/api/status)
   */
  public async ping(): Promise<{ ok: boolean; latencyMs: number; error?: string; data?: any }> {
    const start = performance.now();
    try {
      // Try /api/status first
      let res = await this.fetchWithTimeout('/api/status', { method: 'GET' });
      if (!res.ok && res.status === 404) {
        // Fallback to /status if /api/status isn't present
        res = await this.fetchWithTimeout('/status', { method: 'GET' });
      }

      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        return { ok: true, latencyMs, data: json };
      }
      return { ok: false, latencyMs, error: `ESP32 returned HTTP ${res.status} ${res.statusText}` };
    } catch (err: any) {
      return { ok: false, latencyMs: Math.round(performance.now() - start), error: err.message };
    }
  }

  /**
   * Fetch current live telemetry from the ESP32
   * Expected format:
   * {
   *   "temperature": 29.3,
   *   "humidity": 52.0,
   *   "fanPWM": 100,
   *   "fanState": "ON",
   *   "sensorStatus": "OK",
   *   "connected": true
   * }
   */
  public async getTelemetry(): Promise<TelemetryData> {
    let res = await this.fetchWithTimeout('/api/status', { method: 'GET' });
    if (!res.ok && res.status === 404) {
      res = await this.fetchWithTimeout('/status', { method: 'GET' });
      if (!res.ok && res.status === 404) {
        res = await this.fetchWithTimeout('/data', { method: 'GET' });
      }
    }

    if (!res.ok) {
      throw new Error(`ESP32 returned HTTP status ${res.status}: ${res.statusText}`);
    }

    const data: Esp32StatusResponse = await res.json();

    // 1. Temperature parsing
    const rawTemp = data.temperature !== undefined && data.temperature !== null
      ? Number(data.temperature)
      : (data.comfortTemperatureC !== undefined && data.comfortTemperatureC !== null ? Number(data.comfortTemperatureC) : null);
    const comfortTemp: number | null = (rawTemp !== null && !isNaN(rawTemp)) ? Number(rawTemp.toFixed(1)) : null;

    // 2. Humidity parsing
    const rawHum = data.humidity !== undefined && data.humidity !== null
      ? Number(data.humidity)
      : (data.comfortHumidityPercent !== undefined && data.comfortHumidityPercent !== null ? Number(data.comfortHumidityPercent) : null);
    const comfortHumidity: number | null = (rawHum !== null && !isNaN(rawHum)) ? Number(rawHum.toFixed(1)) : null;

    // 3. Fan PWM parsing (handles both 0-100% and 0-255 raw PWM)
    const rawPwmVal = data.fanPWM !== undefined && data.fanPWM !== null
      ? Number(data.fanPWM)
      : (data.hardwarePwmPercent !== undefined && data.hardwarePwmPercent !== null
          ? Number(data.hardwarePwmPercent)
          : (data.requestedFanSpeedPercent !== undefined ? Number(data.requestedFanSpeedPercent) : 0));

    const safePwm = isNaN(rawPwmVal) ? 0 : Math.max(0, rawPwmVal);
    // If PWM value is > 100, assume 0-255 analogWrite range; otherwise treat as 0-100%
    const pwmPercent = safePwm > 100
      ? Math.min(100, Math.round((safePwm / 255) * 100))
      : Math.min(100, Math.round(safePwm));

    // 4. Fan State parsing
    const stateStr = typeof data.fanState === 'string' ? data.fanState.trim().toUpperCase() : '';
    const isFanStateOn = stateStr === 'ON' ||
      data.fanState === true ||
      data.fanRunningState === 'RUNNING' ||
      (pwmPercent > 0 && stateStr !== 'OFF');

    const fanRunningState: FanRunningState = (isFanStateOn && pwmPercent > 0) ? 'RUNNING' : 'OFF';

    // 5. Sensor Health
    const isSensorHealthy = data.sensorStatus
      ? data.sensorStatus.toString().trim().toUpperCase() === 'OK'
      : (comfortTemp !== null);

    return {
      deviceId: data.deviceId || 'ESP32-AIRLOOP',
      timestamp: Number(data.timestamp) || Date.now(),
      connectionState: 'connected',
      activeMode: data.activeMode === 'manual' ? 'manual' : 'auto',

      comfortTemperatureC: comfortTemp,
      comfortHumidityPercent: comfortHumidity,

      wetZoneTemperatureC: data.wetZoneTemperatureC !== undefined && data.wetZoneTemperatureC !== null
        ? Number(data.wetZoneTemperatureC)
        : comfortTemp,
      wetZoneHumidityPercent: data.wetZoneHumidityPercent !== undefined && data.wetZoneHumidityPercent !== null
        ? Number(data.wetZoneHumidityPercent)
        : comfortHumidity,
      humidityBaselinePercent: data.humidityBaselinePercent !== undefined && data.humidityBaselinePercent !== null
        ? Number(data.humidityBaselinePercent)
        : null,
      humidityRiseRatePercentPerMinute: data.humidityRiseRatePercentPerMinute !== undefined
        ? Number(data.humidityRiseRatePercentPerMinute)
        : null,

      occupancyDetected: Boolean(data.occupancyDetected),
      occupancyLastMotionAt: data.occupancyLastMotionAt ? Number(data.occupancyLastMotionAt) : null,

      requestedFanSpeedPercent: pwmPercent,
      hardwarePwmPercent: pwmPercent,
      fanRunningState,
      fanRpm: null, // No RPM sensor installed

      exhaustFanState: Boolean(data.exhaustFanState),
      exhaustFanRuntimeSeconds: Number(data.exhaustFanRuntimeSeconds) || 0,

      activeTemperatureBand: (comfortTemp === null || comfortTemp < 26)
        ? 'COOL'
        : (comfortTemp <= 29 ? 'COMFORT' : (comfortTemp <= 32 ? 'WARM' : 'HOT')),
      controllerReason: data.controllerReason || (isFanStateOn ? `Fan active at ${pwmPercent}% PWM` : 'Fan idle in standby'),

      sensorHealth: {
        comfortDht11: isSensorHealthy ? 'OK' : 'FAULT',
        wetDht11: isSensorHealthy ? 'OK' : 'FAULT',
        pirMotion: 'OK',
        fanMosfet: 'OK',
        exhaustMosfet: 'OK',
      },
      lastCommandId: data.lastCommandId || null,
      lastCommandStatus: data.lastCommandStatus || 'ACKNOWLEDGED',
      firmwareVersion: data.firmwareVersion || 'ESP32 Arduino Firmware',
      systemMetrics: data.systemMetrics || undefined
    };
  }

  /**
   * Send mode command to ESP32 (if firmware supports it)
   */
  public async setMode(mode: 'manual' | 'auto'): Promise<CommandResult> {
    const commandId = `cmd_mode_${Date.now()}`;
    try {
      const res = await this.fetchWithTimeout('/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, commandId })
      });
      if (!res.ok) {
        return {
          success: false,
          commandId,
          status: 'REJECTED',
          message: `ESP32 rejected mode change (HTTP ${res.status})`
        };
      }
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: `Mode switched to ${mode.toUpperCase()}`
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

  /**
   * Send target fan speed command (0 - 100%) (if firmware supports it)
   */
  public async setFanSpeed(speedPercent: number): Promise<CommandResult> {
    const safeSpeed = Math.max(0, Math.min(100, Math.round(speedPercent)));
    const commandId = `cmd_spd_${Date.now()}`;
    try {
      const res = await this.fetchWithTimeout('/fan/speed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: `Fan speed set to ${safeSpeed}%`
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

  /**
   * Send Wet Zone exhaust fan command
   */
  public async setExhaustFan(enabled: boolean): Promise<CommandResult> {
    const commandId = `cmd_exh_${Date.now()}`;
    try {
      const res = await this.fetchWithTimeout('/fan/exhaust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, commandId })
      });
      if (!res.ok) {
        return {
          success: false,
          commandId,
          status: 'REJECTED',
          message: `ESP32 rejected exhaust command (HTTP ${res.status})`
        };
      }
      return {
        success: true,
        commandId,
        status: 'ACKNOWLEDGED',
        message: `Ventilation fan set to ${enabled ? 'ON' : 'OFF'}`
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

  /**
   * Push configuration to ESP32
   */
  public async saveConfig(config: Partial<DeviceConfig>): Promise<CommandResult> {
    const commandId = `cmd_cfg_${Date.now()}`;
    try {
      const res = await this.fetchWithTimeout('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        message: 'ESP32 configuration updated'
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
