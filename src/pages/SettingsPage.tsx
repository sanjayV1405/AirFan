import React, { useState } from 'react';
import { useAirLoop } from '../context/AirLoopContext';
import { ConfigService } from '../services/configService';
import { DeviceConfig } from '../types/telemetry';
import { 
  Settings, 
  Wifi, 
  Sliders, 
  Check, 
  Save, 
  Radio, 
  RefreshCw,
  Clock,
  Code
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    saveConfigToDevice, 
    pingDevice, 
    commandPending,
    connectionState
  } = useAirLoop();

  const isConnected = connectionState === 'connected';

  const [activeTab, setActiveTab] = useState<'preferences' | 'connection' | 'diagnostics'>('preferences');
  const [form, setForm] = useState<DeviceConfig>({ ...config });
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs: number; error?: string } | null>(null);
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
    updateConfig(form);
    if (isConnected) await saveConfigToDevice();
    setIsSaving(false);
    setSaveSuccessMsg('Settings saved successfully.');
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
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'connection', label: 'Connection', icon: Wifi },
    { id: 'diagnostics', label: 'Diagnostics', icon: Code },
  ] as const;

  const diagItems = [
    { label: 'Room Temperature Input', value: 'GPIO 4 — DHT11 1-Wire Single Bus' },
    { label: 'Wet Zone Moisture Input', value: 'GPIO 5 — DHT11 1-Wire Single Bus' },
    { label: 'Motion Detection Input', value: 'GPIO 27 — HC-SR501 PIR Interrupt' },
    { label: 'Ceiling Fan Output', value: 'GPIO 25 — IRLZ44N 25kHz LEDC PWM' },
    { label: 'Exhaust Fan Output', value: 'GPIO 26 — Opto-Isolated Digital Relay' },
    { label: 'Telemetry Polling', value: `Every ${form.pollingIntervalMs}ms` },
  ];

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto' }}>

      {/* Page header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="icon-container icon-container-teal" style={{ width: 38, height: 38 }}>
            <Settings size={18} />
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Comfort thresholds, hardware connection, and device diagnostics</p>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{
        display: 'flex',
        gap: 4,
        background: 'var(--bg-secondary)',
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
                background: isActive ? '#FAFCFE' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                borderRadius: 'calc(var(--radius-md) - 3px)',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 500,
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
            border: '1px solid rgba(192, 57, 43, 0.25)',
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
            border: '1px solid rgba(26, 158, 106, 0.25)',
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

        {/* ── Tab 1: Comfort & Preferences ────────────────────── */}
        {activeTab === 'preferences' && (
          <>
            <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Sliders size={17} color="var(--accent-primary)" />
                <h3 className="section-heading">Comfort Temperature Boundaries</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                Temperature thresholds that trigger automatic fan speed changes.
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
                <h3 className="section-heading">Occupancy & Power-Saving</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Vacancy Timer (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.occupancyTimeoutMinutes}
                    onChange={e => setForm({ ...form, occupancyTimeoutMinutes: Number(e.target.value) })}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Time before power-saving mode activates
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Empty Room Fan Speed (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.emptyRoomSpeed}
                    onChange={e => setForm({ ...form, emptyRoomSpeed: Number(e.target.value) })}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Fan speed when room is vacant
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Tab 2: Device Connection ─────────────────────────── */}
        {activeTab === 'connection' && (
          <div className="card-solid" style={{ padding: '22px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Wifi size={17} color="var(--accent-primary)" />
              <h3 className="section-heading">ESP32 Network Configuration</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>
              Set the IP address where your ESP32 microcontroller serves its REST API.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Device Name
                </label>
                <input
                  type="text"
                  value={form.deviceName}
                  onChange={e => setForm({ ...form, deviceName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  ESP32 Base URL
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={form.esp32BaseUrl}
                    onChange={e => setForm({ ...form, esp32BaseUrl: e.target.value })}
                    placeholder="http://192.168.1.100"
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

            {pingResult && (
              <div style={{
                marginTop: 14,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: pingResult.ok ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                border: `1px solid ${pingResult.ok ? 'rgba(26, 158, 106, 0.25)' : 'rgba(192, 57, 43, 0.25)'}`,
                fontSize: '0.82rem',
                color: pingResult.ok ? 'var(--color-success)' : 'var(--color-error)',
                fontWeight: 600,
              }}>
                {pingResult.ok 
                  ? `✓ Device responsive (${pingResult.latencyMs}ms roundtrip).` 
                  : `✗ Connection failed: ${pingResult.error || 'Device unreachable. Check Wi-Fi and IP.'}`}
              </div>
            )}
          </div>
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
                  background: 'var(--bg-secondary)',
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
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '11px 28px',
              fontSize: '0.90rem',
              fontWeight: 600,
              cursor: isSaving ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-teal)',
              transition: 'all var(--transition-fast)',
              fontFamily: 'var(--font-sans)',
              opacity: (isSaving || commandPending) ? 0.7 : 1,
            }}
          >
            {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
