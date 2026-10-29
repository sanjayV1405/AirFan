import { DeviceConfig } from '../types/telemetry';

const STORAGE_KEY_CONFIG = 'airloop_device_config';

export const DEFAULT_CONFIG: DeviceConfig = {
  deviceName: 'AirLoop Controller 01',
  esp32BaseUrl: 'http://192.168.1.100',
  pollingIntervalMs: 2000,
  connectionTimeoutMs: 3500,

  // Comfort zone auto bands
  tempCoolMax: 26.0,
  tempComfortMax: 29.0,
  tempWarmMax: 32.0,
  tempHysteresis: 1.0,

  // Speed targets
  speedCool: 25,
  speedComfort: 50,
  speedWarm: 75,
  speedHot: 100,

  // Occupancy
  occupancyTimeoutMinutes: 5,
  emptyRoomSpeed: 0, // Turn off or low

  // Wet zone adaptive ventilation
  baselineWindowMinutes: 30,
  humidityMarginThreshold: 8.0, // +8% RH margin
  humidityRiseRateThreshold: 3.0, // +3% RH / min
  activationHoldSeconds: 15,
  exhaustMinRuntimeMinutes: 2,
  exhaustMaxRuntimeMinutes: 30,
  exhaustReturnMargin: 3.0, // Return within +3% RH of baseline

  // UI prefs
  tempUnit: 'C',
  enableAnimations: true,
  reducedMotion: false,
  demoMode: true // Defaults to Demo mode so application works out of the box with realistic telemetry
};

export class ConfigService {
  public static load(): DeviceConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse stored config', e);
    }
    return { ...DEFAULT_CONFIG };
  }

  public static save(config: DeviceConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config', e);
    }
  }

  public static validate(config: Partial<DeviceConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.tempCoolMax !== undefined && config.tempComfortMax !== undefined) {
      if (config.tempCoolMax >= config.tempComfortMax) {
        errors.push('Cool threshold must be strictly lower than Comfort threshold.');
      }
    }
    if (config.tempComfortMax !== undefined && config.tempWarmMax !== undefined) {
      if (config.tempComfortMax >= config.tempWarmMax) {
        errors.push('Comfort threshold must be strictly lower than Warm threshold.');
      }
    }
    if (config.pollingIntervalMs !== undefined && (config.pollingIntervalMs < 500 || config.pollingIntervalMs > 10000)) {
      errors.push('Polling interval must be between 500ms and 10,000ms.');
    }
    if (config.exhaustMinRuntimeMinutes !== undefined && config.exhaustMaxRuntimeMinutes !== undefined) {
      if (config.exhaustMinRuntimeMinutes >= config.exhaustMaxRuntimeMinutes) {
        errors.push('Minimum exhaust runtime must be lower than maximum safety cutoff.');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
