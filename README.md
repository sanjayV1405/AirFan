# AIRLOOP — Smart Fan & Adaptive Ventilation System

> **"Sense the room. Adapt the airflow."**  
> Premium IoT smart climate controller and multi-zone adaptive ventilation web application engineered for ESP32 microcontrollers.

---

## 1. Project Overview

**AirLoop** is a dual-zone smart climate control application designed for real-time monitoring and command orchestration of low-voltage DC fans and environmental sensors managed by an ESP32 microcontroller.

The system is architected around two primary zones:
- **Comfort Zone**: Regulates room climate using a DHT11 temperature/humidity sensor and an HC-SR501 PIR motion sensor. Supports autonomous closed-loop speed adaptation based on configured temperature bands (with ±1°C hysteresis) as well as temporary manual PWM overrides.
- **Wet Zone**: Manages bathroom/moisture-prone spaces using a second DHT11 sensor and an adaptive humidity algorithm. Evaluates a 30-minute rolling median baseline and rate-of-rise (+% RH/min) to actuate a separate exhaust fan driver without false-triggering during rainy weather.

---

## 2. Hardware Architecture & GPIO Pinout

AirLoop interfaces with the ESP32 over a local REST API on a 2.4 GHz Wi-Fi network. The ESP32 serves as the authoritative autonomous controller: if the website or browser is closed, all local control loops, hysteresis, and safety cutoffs continue operating on the microcontroller.

| ESP32 GPIO | Connected Component | Signal Type | Electrical Rating | Circuit Safeguards |
| :--- | :--- | :--- | :--- | :--- |
| **GPIO 4** | Comfort Zone DHT11 Sensor | 1-Wire Digital Bus | 3.3V Logic | 4.7kΩ Pull-up Resistor |
| **GPIO 5** | Wet Zone DHT11 Sensor | 1-Wire Digital Bus | 3.3V Logic | 4.7kΩ Pull-up Resistor |
| **GPIO 27**| HC-SR501 PIR Motion Sensor | Digital GPIO Input | 3.3V Output / 5V VCC | Hardware Retrigger Window |
| **GPIO 25**| Comfort Fan MOSFET Driver | LEDC Hardware PWM | 12V DC Motor Rail | IRLZ44N Logic Gate + 1N4007 Flyback Diode |
| **GPIO 26**| Wet Exhaust Fan Driver | Digital Output (ON/OFF) | 12V DC Motor Rail | IRLZ44N Logic Gate + 1N4007 Flyback Diode |

> **Electrical Safety Notice:** The prototype is designed exclusively for low-voltage 12V DC fans driven by logic-level MOSFETs. Do not connect mains AC 110V/220V household ceiling fans directly to ESP32 GPIOs without certified relays, optoisolators, and qualified electrical safety reviews.

---

## 3. Autonomous Control Policies

### A. Comfort Zone Temperature Bands
In **Automatic Mode**, the ESP32 determines fan speed using the following initial bands:
- **COOL (< 26.0°C)**: Low airflow (~25%) when room is occupied.
- **COMFORT (26.0°C – 29.0°C)**: Medium airflow (~50%).
- **WARM (29.0°C – 32.0°C)**: High airflow (~75%).
- **HOT (≥ 32.0°C)**: Full airflow (100%).
- **Hysteresis**: ±1.0°C band buffer to prevent fan speed hunting around transition boundaries.
- **Occupancy Policy**: When unoccupied for 5 minutes, fan airflow throttles down to energy-saving policy (0% or 25%). Detected motion immediately resets the timer.

### B. Wet Zone Adaptive Humidity Extraction
- **Rolling Baseline**: 30-minute median baseline of ambient relative humidity. Baseline updates freeze automatically while the exhaust fan is running.
- **Moisture Event Detection**: Triggers when smoothed humidity exceeds baseline by **+8% RH** or rise-rate exceeds **+3% RH/minute** for 10–20 seconds.
- **Exhaust Cutoff**: Terminates when humidity returns within **+3% RH** of baseline after a minimum runtime of **2 minutes**, or forcibly after **30 minutes** maximum safety cutoff.

---

## 4. Hardware REST API Contract

The frontend hardware client (`src/services/esp32Client.ts`) uses the following REST interface:

### Telemetry & Diagnostics
- `GET /data` — Returns live telemetry snapshot:
  ```json
  {
    "deviceId": "ESP32-AIRLOOP-01",
    "timestamp": 1793198000000,
    "activeMode": "auto",
    "comfortTemperatureC": 28.4,
    "comfortHumidityPercent": 55,
    "wetZoneTemperatureC": 26.8,
    "wetZoneHumidityPercent": 52,
    "humidityBaselinePercent": 51.5,
    "humidityRiseRatePercentPerMinute": 0.2,
    "occupancyDetected": true,
    "requestedFanSpeedPercent": 50,
    "hardwarePwmPercent": 50,
    "fanRunningState": "RUNNING",
    "fanRpm": null,
    "exhaustFanState": false,
    "exhaustFanRuntimeSeconds": 0,
    "activeTemperatureBand": "COMFORT",
    "controllerReason": "Room in comfort zone (28.4°C) — moderate airflow selected.",
    "sensorHealth": {
      "comfortDht11": "OK",
      "wetDht11": "OK",
      "pirMotion": "OK",
      "fanMosfet": "OK",
      "exhaustMosfet": "OK"
    },
    "firmwareVersion": "v1.2.0-esp32"
  }
  ```
- `GET /status` — Microcontroller ping and Wi-Fi RSSI health check.

### Command Endpoints
- `POST /mode` — Sets operating mode:
  ```json
  { "mode": "manual", "commandId": "cmd_mode_12345" }
  ```
- `POST /fan/speed` — Sets Comfort Fan PWM setpoint (0–100%):
  ```json
  { "speedPercent": 75, "commandId": "cmd_spd_12345" }
  ```
- `POST /fan/exhaust` — Manually actuates Wet Zone exhaust:
  ```json
  { "enabled": true, "commandId": "cmd_exh_12345" }
  ```
- `POST /config` — Updates non-volatile thresholds and timings on the device.

---

## 5. Running the Application

### Prerequisites
- Node.js v18+ (tested on v22.19.0)
- npm v10+

### Development Server
```bash
npm install
npm run dev
```
The application will start at `http://localhost:5173/` (or `http://localhost:5174/` if 5173 is occupied).

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 6. Demo Mode vs. Live Hardware Mode

- **Demo Mode (Default for evaluation)**: Runs an internal physical simulation engine in the browser (`src/services/simulationEngine.ts`). Simulates thermal drift, occupancy events, and shower moisture spikes without needing physical hardware connected. Marked prominently with an amber **DEMO DATA** banner.
- **Live ESP32 Mode**: Connects directly to your microcontroller at the configured IP (e.g. `http://192.168.1.100`). Real hardware data is never manufactured or simulated when in hardware mode.
- **Mixed Content Notice**: Browsers prevent HTTPS origins from calling local plain-HTTP IP addresses. Run the web app over `http://localhost` during testing with real ESP32 hardware.
