import React, { useState } from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { ConfigService } from '../services/configService';
import { normalizeEsp32Url } from '../services/esp32Client';
import { DeviceConfig } from '../types/telemetry';
import { 
  Settings, 
  Wifi, 
  WifiOff,
  Sliders, 
  Check, 
  Save, 
  Radio, 
  RefreshCw,
  Clock,
  Code,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    saveConfigToDevice, 
    pingDevice, 
    connect,
    disconnect,
    commandPending,
    connectionState,
    connectionError
  } = useAirLoop();

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  const [activeTab, setActiveTab] = useState<'preferences' | 'connection' | 'diagnostics'>('connection');
  const [form, setForm] = useState<DeviceConfig>({ ...config });
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs: number; error?: string; data?: any } | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handlePing = async () => {
    setIsPinging(true);
    const res = await pingDevice();
    setPingResult(res);
    setIsPinging(false);
  };

  const handleConnectToggle = async () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      updateConfig({ esp32BaseUrl: normalizeEsp32Url(form.esp32BaseUrl) });
      await connect();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    const validation = ConfigService.validate(form);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);
    setIsSaving(true);
    const normalized = { ...form, esp32BaseUrl: normalizeEsp32Url(form.esp32BaseUrl) };
    setForm(normalized);
    updateConfig(normalized);
    if (isConnected) await saveConfigToDevice();
    setIsSaving(false);
    setSaveSuccessMsg('Configuration saved and applied.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.90rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-medium)',
    background: 'var(--surface-input)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  };

  const TABS = [
    { id: 'connection', label: 'ESP32 Wi-Fi Connection', icon: Wifi },
    { id: 'preferences', label: 'Comfort Preferences', icon: Sliders },
    { id: 'diagnostics', label: 'Hardware Architecture', icon: Code },
  ] as const;

  const diagItems = [
    { label: 'Room Sensor Input', value: 'GPIO 4 — DHT22 Temperature & Humidity (1-Wire)' },
    { label: 'Ceiling Fan PWM Output', value: 'GPIO 25 — Motor Driver PWM (25kHz LEDC)' },
    { label: 'Wi-Fi HTTP Endpoint', value: `${normalizeEsp32Url(form.esp32BaseUrl)}/api/status` },
    { label: 'Telemetry Polling Rate', value: 'Every 2000ms (2 seconds)' },
    { label: 'Firmware Communication', value: 'Local Wi-Fi REST API (GET /api/status)' },
    { label: 'Serial Baud Rate', value: '115200 baud' },
  ];

  const resolvedEndpoint = `${normalizeEsp32Url(form.esp32BaseUrl)}/api/status`;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto' }}>

      {/* Page header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <Settings size={18} />
          </div>
          <div>
            <h1 className="page-title">Device Settings</h1>
            <p className="page-subtitle">ESP32 local Wi-Fi connection, comfort thresholds, and hardware diagnostics</p>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--surface-2)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-medium)',
        width: 'fit-content',
      }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: isActive ? 'var(--surface-card)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--border-card)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div style={{
            background: 'var(--color-error-bg)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            color: 'var(--color-error)',
            fontSize: '0.84rem',
            lineHeight: 1.6,
          }}>
            {validationErrors.map((err, i) => <div key={i}>• {err}</div>)}
          </div>
        )}

        {/* Success message */}
        {saveSuccessMsg && (
          <div style={{
            background: 'var(--color-success-bg)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            color: 'var(--color-success)',
            fontSize: '0.86rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Check size={16} /> {saveSuccessMsg}
          </div>
        )}

        {/* ── Tab 1: Device Connection ─────────────────────────── */}
        {activeTab === 'connection' && (
          <div className="card-solid" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wifi size={18} color="var(--accent-primary)" />
                <h3 className="section-heading">ESP32 Wi-Fi HTTP Configuration</h3>
              </div>

              {/* Status Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isConnected ? (
                  <span className="badge badge-success" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                    <span className="live-indicator" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
                    Connected
                  </span>
                ) : isConnecting ? (
                  <span className="badge badge-teal" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                    <RefreshCw size={11} className="spin" />
                    Connecting…
                  </span>
                ) : (
                  <span className="badge badge-error" style={{ fontSize: '0.74rem', padding: '4px 12px' }}>
                    <WifiOff size={11} />
                    Hardware Offline
                  </span>
                )}
              </div>
            </div>

            <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.55 }}>
              Enter your ESP32's local network IP address. The website fetches live sensor readings and fan PWM duty every 2 seconds via <code style={{ color: 'var(--accent-primary)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>GET /api/status</code>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Device Name
                </label>
                <input
                  type="text"
                  value={form.deviceName}
                  onChange={e => setForm({ ...form, deviceName: e.target.value })}
                  style={inputStyle}
                  placeholder="AirLoop ESP32"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  ESP32 IP Address or Hostname
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={form.esp32BaseUrl}
                    onChange={e => setForm({ ...form, esp32BaseUrl: e.target.value })}
                    placeholder="192.168.1.50 or http://192.168.1.50"
                    style={{ ...inputStyle, flex: 1, fontVariantNumeric: 'tabular-nums' }}
                  />
                  <button
                    type="button"
                    onClick={handlePing}
                    disabled={isPinging}
                    className="btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 16px',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isPinging ? <RefreshCw size={14} className="spin" /> : <Radio size={14} />}
                    <span>Test Ping</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resolved URL banner */}
            <div style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 18,
            }}>
              <div>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Active API Endpoint
                </span>
                <div style={{ fontSize: '0.86rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  GET {resolvedEndpoint}
                </div>
              </div>

              {/* Connect / Disconnect button */}
              <button
                type="button"
                onClick={handleConnectToggle}
                className={isConnected ? 'btn-secondary' : 'btn-primary'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {isConnected ? (
                  <>
                    <WifiOff size={14} />
                    <span>Disconnect</span>
                  </>
                ) : (
                  <>
                    <Radio size={14} />
                    <span>{isConnecting ? 'Connecting…' : 'Connect ESP32'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Connection error feedback */}
            {connectionError && (
              <div style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-error-bg)',
                border: '1px solid rgba(248, 113, 113, 0.25)',
                fontSize: '0.82rem',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <WifiOff size={15} style={{ flexShrink: 0 }} />
                <span>{connectionError}</span>
              </div>
            )}

            {/* Ping Result Feedback */}
            {pingResult && (
              <div style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: pingResult.ok ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                border: `1px solid ${pingResult.ok ? 'rgba(52, 211, 153, 0.25)' : 'rgba(248, 113, 113, 0.25)'}`,
                fontSize: '0.82rem',
                color: pingResult.ok ? 'var(--color-success)' : 'var(--color-error)',
                fontWeight: 600,
              }}>
                {pingResult.ok 
                  ? `✓ ESP32 responsive (${pingResult.latencyMs}ms roundtrip). Valid JSON returned from /api/status.` 
                  : `✗ Connection test failed: ${pingResult.error || 'Device unreachable. Check Wi-Fi and IP.'}`}
              </div>
            )}

            {/* Expected JSON Schema format */}
            <div style={{
              background: 'var(--surface-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
                <Info size={14} color="var(--accent-primary)" />
                <span>ESP32 Arduino Firmware Status API Specification:</span>
              </div>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
                overflowX: 'auto',
              }}>
{`{
  "temperature": 29.3,
  "humidity": 52.0,
  "fanPWM": 100,
  "fanState": "ON",
  "sensorStatus": "OK",
  "connected": true
}`}
              </pre>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                • <strong>fanPWM</strong>: 0 to 100 (or 0-255). 0 stops the fan; greater than 0 animates the visualizer.<br/>
                • <strong>temperature / humidity</strong>: Read from DHT22 (GPIO 4) on ESP32.<br/>
                • <strong>Wi-Fi</strong>: The laptop running the dashboard and the ESP32 must be on the same local network.
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Comfort & Preferences ────────────────────── */}
        {activeTab === 'preferences' && (
          <>
            <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Sliders size={17} color="var(--accent-primary)" />
                <h3 className="section-heading">Automatic Fan Temperature Boundaries</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                Temperature thresholds configured for automatic fan speed regulation.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Cool Limit (°C)', key: 'tempCoolMax', hint: 'Below this = Cool' },
                  { label: 'Comfort Upper (°C)', key: 'tempComfortMax', hint: 'Below this = Comfortable' },
                  { label: 'Warm Upper (°C)', key: 'tempWarmMax', hint: 'Above this = Hot' },
                ].map(({ label, key, hint }) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                      {label}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={(form as unknown as Record<string, number>)[key]}
                      onChange={e => setForm({ ...form, [key]: Number(e.target.value) })}
                      style={{ ...inputStyle, fontVariantNumeric: 'tabular-nums' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Clock size={17} color="var(--accent-primary)" />
                <h3 className="section-heading">Telemetry Polling Rate</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Polling Interval (ms)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    step="500"
                    value={form.pollingIntervalMs}
                    onChange={e => setForm({ ...form, pollingIntervalMs: Number(e.target.value) })}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Standard polling frequency (2000ms recommended)
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Request Timeout (ms)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="8000"
                    step="500"
                    value={form.connectionTimeoutMs}
                    onChange={e => setForm({ ...form, connectionTimeoutMs: Number(e.target.value) })}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Timeout before marking query failed (3500ms default)
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Tab 3: Diagnostics ───────────────────────────────── */}
        {activeTab === 'diagnostics' && (
          <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Code size={17} color="var(--accent-primary)" />
              <h3 className="section-heading">Hardware Specifications & Pinout</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>
              Read-only technical architecture of the ESP32 microcontroller integration.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {diagItems.map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--surface-2)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="submit"
            disabled={isSaving || commandPending}
            className="btn-primary"
            style={{
              padding: '11px 28px',
              fontSize: '0.90rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: (isSaving || commandPending) ? 0.7 : 1,
            }}
          >
            {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
