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
    if (isConnected) {
      await saveConfigToDevice();
    }
    setIsSaving(false);
    setSaveSuccessMsg('Settings saved successfully.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960, margin: '0 auto' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Settings size={22} color="var(--accent-primary)" />
          <span>System Settings</span>
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Customize your climate comfort preferences, hardware IP connection, and energy policies.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        background: 'var(--surface-3)',
        padding: 4,
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          style={{
            background: activeTab === 'preferences' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'preferences' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: activeTab === 'preferences' ? '1px solid var(--border-subtle)' : '1px solid transparent',
            boxShadow: activeTab === 'preferences' ? 'var(--shadow-sm)' : 'none',
            borderRadius: 8,
            padding: '7px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Comfort &amp; Preferences
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('connection')}
          style={{
            background: activeTab === 'connection' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'connection' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: activeTab === 'connection' ? '1px solid var(--border-subtle)' : '1px solid transparent',
            boxShadow: activeTab === 'connection' ? 'var(--shadow-sm)' : 'none',
            borderRadius: 8,
            padding: '7px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Device Connection
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          style={{
            background: activeTab === 'diagnostics' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'diagnostics' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: activeTab === 'diagnostics' ? '1px solid var(--border-subtle)' : '1px solid transparent',
            boxShadow: activeTab === 'diagnostics' ? 'var(--shadow-sm)' : 'none',
            borderRadius: 8,
            padding: '7px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Advanced Diagnostics
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {validationErrors.length > 0 && (
          <div style={{
            background: 'var(--color-error-dim)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            borderRadius: 12,
            padding: '14px 18px',
            color: 'var(--color-error)',
            fontSize: '0.82rem'
          }}>
            {validationErrors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        {saveSuccessMsg && (
          <div style={{
            background: 'var(--color-success-dim)',
            border: '1px solid rgba(5, 150, 105, 0.25)',
            borderRadius: 12,
            padding: '14px 18px',
            color: 'var(--color-success)',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Check size={18} /> {saveSuccessMsg}
          </div>
        )}

        {/* Tab 1: Comfort & Preferences */}
        {activeTab === 'preferences' && (
          <>
            <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sliders size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Comfort Temperature Boundaries (°C)
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Define when the automatic climate system transitions between Cool, Comfortable, and Warm.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Cool Limit (&lt; Cool)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tempCoolMax}
                    onChange={e => setForm({ ...form, tempCoolMax: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '0.86rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Comfort Upper Limit
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tempComfortMax}
                    onChange={e => setForm({ ...form, tempComfortMax: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '0.86rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Warm Upper Limit (Hot above)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tempWarmMax}
                    onChange={e => setForm({ ...form, tempWarmMax: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '0.86rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Clock size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Occupancy &amp; Ventilation Preferences
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Vacancy Power-Saving Timer (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.occupancyTimeoutMinutes}
                    onChange={e => setForm({ ...form, occupancyTimeoutMinutes: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '0.86rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Empty Room Fan Speed (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.emptyRoomSpeed}
                    onChange={e => setForm({ ...form, emptyRoomSpeed: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '0.86rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Device Connection */}
        {activeTab === 'connection' && (
          <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Wifi size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Physical ESP32 Device Connection
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Specify the local network address of your ESP32 microcontroller to transmit commands and stream telemetry.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Device Label
                </label>
                <input
                  type="text"
                  value={form.deviceName}
                  onChange={e => setForm({ ...form, deviceName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  ESP32 Base URL (HTTP)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={form.esp32BaseUrl}
                    onChange={e => setForm({ ...form, esp32BaseUrl: e.target.value })}
                    placeholder="http://192.168.1.100"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      fontSize: '0.86rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePing}
                    disabled={isPinging}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      boxShadow: 'var(--shadow-sm)',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {isPinging ? <RefreshCw size={13} className="spin" /> : <Radio size={14} />}
                    <span>Test Ping</span>
                  </button>
                </div>
              </div>
            </div>

            {pingResult && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 8,
                background: pingResult.ok ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
                border: `1px solid ${pingResult.ok ? 'rgba(5, 150, 105, 0.25)' : 'rgba(220, 38, 38, 0.25)'}`,
                fontSize: '0.78rem',
                color: pingResult.ok ? 'var(--color-success)' : 'var(--color-error)',
                fontFamily: 'var(--font-mono)'
              }}>
                {pingResult.ok 
                  ? `✓ Device responsive (${pingResult.latencyMs}ms roundtrip latency).` 
                  : `✗ Connection test failed: ${pingResult.error || 'Device unreachable. Check Wi-Fi.'}`}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Advanced Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div className="glass-panel" style={{ padding: '22px', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Code size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Advanced Diagnostics &amp; Microcontroller Specs
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Hardware interface mapping and firmware configuration.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Room Temp Sensor</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  GPIO 4 (DHT11 1-Wire)
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Moisture Sensor</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  GPIO 5 (DHT11 1-Wire)
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Motion Detector</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  GPIO 27 (HC-SR501 PIR)
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Room Fan Driver</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  GPIO 25 (25kHz LEDC PWM)
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ventilation Fan</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  GPIO 26 (Opto Relay)
                </div>
              </div>

              <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MCU Polling Rate</span>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  Every {form.pollingIntervalMs}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="submit"
            disabled={isSaving || commandPending}
            style={{
              background: 'var(--accent-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isSaving ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isSaving ? <RefreshCw size={15} className="spin" /> : <Save size={16} />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
