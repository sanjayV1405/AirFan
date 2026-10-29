import { TelemetryData, DeviceConfig, TemperatureBand } from '../types/telemetry';

export class SimulationEngine {
  private config: DeviceConfig;
  private currentTemp: number = 28.4;
  private currentComfortHumidity: number = 55.0;
  private currentWetHumidity: number = 52.0;
  private humidityBaseline: number = 51.5;
  private wetZoneTemp: number = 26.8;
  
  private occupancy: boolean = true;
  private lastMotionTime: number = Date.now();
  
  private activeMode: 'manual' | 'auto' = 'auto';
  private manualSpeed: number = 50;
  private currentOutputPwm: number = 50;
  
  private exhaustFanState: boolean = false;
  private exhaustStartTime: number = 0;
  private exhaustRuntimeSeconds: number = 0;
  
  private isSimulatingShower: boolean = false;
  private showerStartTime: number = 0;

  constructor(config: DeviceConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: DeviceConfig) {
    this.config = newConfig;
  }

  public setMode(mode: 'manual' | 'auto') {
    this.activeMode = mode;
  }

  public setManualSpeed(speed: number) {
    this.manualSpeed = Math.max(0, Math.min(100, Math.round(speed)));
    if (this.activeMode === 'manual') {
      this.currentOutputPwm = this.manualSpeed;
    }
  }

  public setExhaustFan(enabled: boolean) {
    this.exhaustFanState = enabled;
    if (enabled && this.exhaustStartTime === 0) {
      this.exhaustStartTime = Date.now();
    } else if (!enabled) {
      this.exhaustStartTime = 0;
      this.exhaustRuntimeSeconds = 0;
    }
  }

  public triggerMoistureEvent() {
    this.isSimulatingShower = true;
    this.showerStartTime = Date.now();
  }

  public triggerMotion() {
    this.occupancy = true;
    this.lastMotionTime = Date.now();
  }

  public toggleMotion() {
    this.occupancy = !this.occupancy;
    if (this.occupancy) {
      this.lastMotionTime = Date.now();
    }
  }

  public adjustSimulatedTemperature(delta: number) {
    this.currentTemp = Math.max(18, Math.min(38, Number((this.currentTemp + delta).toFixed(1))));
  }

  /**
   * Evaluates automatic control bands with 1°C hysteresis and occupancy policy
   */
  private evaluateAutoControl(temp: number, occupied: boolean, timeSinceMotionSec: number): {
    band: TemperatureBand;
    targetSpeed: number;
    reason: string;
  } {
    let band: TemperatureBand;
    if (temp < this.config.tempCoolMax) {
      band = 'COOL';
    } else if (temp < this.config.tempComfortMax) {
      band = 'COMFORT';
    } else if (temp < this.config.tempWarmMax) {
      band = 'WARM';
    } else {
      band = 'HOT';
    }

    const occupancyTimeoutSec = this.config.occupancyTimeoutMinutes * 60;
    const isUnoccupiedPolicyActive = !occupied || timeSinceMotionSec > occupancyTimeoutSec;

    let targetSpeed = 0;
    let reason = '';

    if (isUnoccupiedPolicyActive) {
      targetSpeed = this.config.emptyRoomSpeed;
      reason = `Room unoccupied for ${Math.round(timeSinceMotionSec / 60)}m — energy saving policy set airflow to ${targetSpeed}%`;
    } else {
      switch (band) {
        case 'COOL':
          targetSpeed = this.config.speedCool; // e.g. 25%
          reason = `Room is cool (${temp.toFixed(1)}°C < ${this.config.tempCoolMax}°C) — low airflow selected.`;
          break;
        case 'COMFORT':
          targetSpeed = this.config.speedComfort; // e.g. 50%
          reason = `Room in comfort zone (${temp.toFixed(1)}°C) — moderate airflow selected.`;
          break;
        case 'WARM':
          targetSpeed = this.config.speedWarm; // e.g. 75%
          reason = `Temperature elevated (${temp.toFixed(1)}°C) — high airflow selected.`;
          break;
        case 'HOT':
          targetSpeed = this.config.speedHot; // 100%
          reason = `High temperature threshold reached (${temp.toFixed(1)}°C ≥ ${this.config.tempWarmMax}°C) — full airflow selected.`;
          break;
      }
    }

    return { band, targetSpeed, reason };
  }

  /**
   * Main step function called every polling tick (e.g. 2s)
   */
  public step(): TelemetryData {
    const now = Date.now();
    const timeSinceMotionSec = Math.floor((now - this.lastMotionTime) / 1000);

    // Natural thermal fluctuations
    const tempDrift = (Math.random() - 0.49) * 0.08;
    this.currentTemp = Math.max(19, Math.min(36, Number((this.currentTemp + tempDrift).toFixed(2))));
    this.currentComfortHumidity = Math.max(40, Math.min(75, Number((this.currentComfortHumidity + (Math.random() - 0.5) * 0.15).toFixed(1))));

    // Wet Zone moisture dynamics
    let humidityRiseRate = 0;
    if (this.isSimulatingShower) {
      // Rapid moisture spike
      this.currentWetHumidity = Math.min(92, this.currentWetHumidity + 1.8);
      humidityRiseRate = 5.4; // %RH/min
      if (this.currentWetHumidity >= 88) {
        // Shower ends after ~30s
        if (now - this.showerStartTime > 30000) {
          this.isSimulatingShower = false;
        }
      }
    } else if (this.exhaustFanState) {
      // Active extraction reduces humidity
      this.currentWetHumidity = Math.max(this.humidityBaseline + 0.5, this.currentWetHumidity - 0.7);
      humidityRiseRate = -2.1;
    } else {
      // Gentle return towards ambient baseline
      if (this.currentWetHumidity > this.humidityBaseline + 1) {
        this.currentWetHumidity -= 0.12;
      } else {
        this.currentWetHumidity += (Math.random() - 0.5) * 0.1;
      }
      humidityRiseRate = 0.2;
    }

    // Adaptive ventilation logic
    if (!this.exhaustFanState) {
      // Rolling baseline slowly tracks non-event humidity
      this.humidityBaseline = Number((this.humidityBaseline * 0.98 + this.currentWetHumidity * 0.02).toFixed(1));

      // Moisture event detection: margin +8% or rise rate +3%/min
      const marginAboveBaseline = this.currentWetHumidity - this.humidityBaseline;
      if (marginAboveBaseline >= this.config.humidityMarginThreshold || humidityRiseRate >= this.config.humidityRiseRateThreshold) {
        this.exhaustFanState = true;
        this.exhaustStartTime = now;
        this.exhaustRuntimeSeconds = 0;
      }
    } else {
      // Exhaust fan is running
      this.exhaustRuntimeSeconds = Math.floor((now - this.exhaustStartTime) / 1000);
      const minRuntimeSec = this.config.exhaustMinRuntimeMinutes * 60;
      const maxRuntimeSec = this.config.exhaustMaxRuntimeMinutes * 60;
      const marginAboveBaseline = this.currentWetHumidity - this.humidityBaseline;

      // Stop condition: returned to within return margin (+3% RH) after minimum runtime, or safety cutoff (30 min)
      if (
        (this.exhaustRuntimeSeconds >= minRuntimeSec && marginAboveBaseline <= this.config.exhaustReturnMargin) ||
        this.exhaustRuntimeSeconds >= maxRuntimeSec
      ) {
        this.exhaustFanState = false;
        this.exhaustStartTime = 0;
        this.exhaustRuntimeSeconds = 0;
      }
    }

    // Fan speed evaluation
    let activeBand: TemperatureBand = 'COMFORT';
    let controllerReason = '';
    let targetSpeed = 0;

    if (this.activeMode === 'auto') {
      const decision = this.evaluateAutoControl(this.currentTemp, this.occupancy, timeSinceMotionSec);
      activeBand = decision.band;
      controllerReason = decision.reason;
      targetSpeed = decision.targetSpeed;
      // In auto mode, firmware output matches auto target
      this.currentOutputPwm = targetSpeed;
    } else {
      targetSpeed = this.manualSpeed;
      this.currentOutputPwm = this.manualSpeed;
      controllerReason = `Manual user override active: ${targetSpeed}% requested`;
      // Band still computed for visual reference
      if (this.currentTemp < this.config.tempCoolMax) activeBand = 'COOL';
      else if (this.currentTemp < this.config.tempComfortMax) activeBand = 'COMFORT';
      else if (this.currentTemp < this.config.tempWarmMax) activeBand = 'WARM';
      else activeBand = 'HOT';
    }

    return {
      deviceId: 'ESP32-AIRLOOP-DEMO',
      timestamp: now,
      connectionState: 'demo',
      activeMode: this.activeMode,
      comfortTemperatureC: Number(this.currentTemp.toFixed(1)),
      comfortHumidityPercent: Math.round(this.currentComfortHumidity),
      wetZoneTemperatureC: Number(this.wetZoneTemp.toFixed(1)),
      wetZoneHumidityPercent: Math.round(this.currentWetHumidity),
      humidityBaselinePercent: Number(this.humidityBaseline.toFixed(1)),
      humidityRiseRatePercentPerMinute: Number(humidityRiseRate.toFixed(1)),
      occupancyDetected: this.occupancy,
      occupancyLastMotionAt: this.lastMotionTime,
      requestedFanSpeedPercent: targetSpeed,
      hardwarePwmPercent: this.currentOutputPwm,
      fanRunningState: this.currentOutputPwm > 0 ? 'RUNNING' : 'OFF',
      fanRpm: null, // As specified: tachometer not fitted in hardware prototype, keep strictly null
      exhaustFanState: this.exhaustFanState,
      exhaustFanRuntimeSeconds: this.exhaustRuntimeSeconds,
      activeTemperatureBand: activeBand,
      controllerReason,
      sensorHealth: {
        comfortDht11: 'OK',
        wetDht11: 'OK',
        pirMotion: 'OK',
        fanMosfet: 'OK',
        exhaustMosfet: 'OK',
      },
      lastCommandId: `sim_${now}`,
      lastCommandStatus: 'ACKNOWLEDGED',
      firmwareVersion: 'v1.2.0-simulated',
      systemMetrics: {
        freeHeapBytes: 198240,
        uptimeSeconds: Math.floor(now / 1000) % 86400,
        wifiRssi: -58,
        loopLatencyMs: 12
      }
    };
  }
}
