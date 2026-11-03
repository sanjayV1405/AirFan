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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.45rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          letterSpacing: '-0.02em'
        }}>
          <Settings size={24} color="var(--accent-primary)" />
          <span>System Settings</span>
        </h1>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Manage your indoor comfort boundaries, network connection parameters, and hardware drivers.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        background: 'rgba(11, 17, 32, 0.8)',
        padding: 4,
        borderRadius: 14,
        border: '1px solid var(--border-subtle)',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          style={{
            background: activeTab === 'preferences' ? 'var(--accent-primary-dim)' : 'transparent',
            color: activeTab === 'preferences' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: activeTab === 'preferences' ? '1px solid var(--border-accent)' : '1px solid transparent',
            boxShadow: activeTab === 'preferences' ? '0 0 16px rgba(0, 242, 254, 0.2)' : 'none',
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
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
            background: activeTab === 'connection' ? 'var(--accent-primary-dim)' : 'transparent',
            color: activeTab === 'connection' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: activeTab === 'connection' ? '1px solid var(--border-accent)' : '1px solid transparent',
            boxShadow: activeTab === 'connection' ? '0 0 16px rgba(0, 242, 254, 0.2)' : 'none',
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
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
            background: activeTab === 'diagnostics' ? 'var(--accent-primary-dim)' : 'transparent',
            color: activeTab === 'diagnostics' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: activeTab === 'diagnostics' ? '1px solid var(--border-accent)' : '1px solid transparent',
            boxShadow: activeTab === 'diagnostics' ? '0 0 16px rgba(0, 242, 254, 0.2)' : 'none',
            borderRadius: 10,
            padding: '8px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Advanced Diagnostics
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {validationErrors.length > 0 && (
          <div style={{
            background: 'var(--color-error-dim)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 14,
            padding: '14px 18px',
            color: '#EF4444',
            fontSize: '0.84rem'
          }}>
            {validationErrors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        {saveSuccessMsg && (
          <div style={{
            background: 'var(--color-success-dim)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 14,
            padding: '14px 18px',
            color: '#10B981',
            fontSize: '0.86rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.15)'
          }}>
            <Check size={18} /> {saveSuccessMsg}
          </div>
        )}

        {/* Tab 1: Comfort & Preferences */}
        {activeTab === 'preferences' && (
          <>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Sliders size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Comfort Temperature Boundaries (°C)
                </h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                Configure trigger temperatures for automatic fan speeds.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                    Cool Limit (&lt; Cool)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tempCoolMax}
                    onChange={e => setForm({ ...form, tempCoolMax: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                    Comfort Upper Bound
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tempComfortMax}
                    onChange={e => setForm({ ...form, tempComfortMax: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                    Warm Upper Bound (Hot above)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.tempWarmMax}
                    onChange={e => setForm({ ...form, tempWarmMax: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Clock size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Occupancy &amp; Power-Saving Policies
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
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
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
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
                      padding: '10px 14px',
                      fontSize: '0.9rem',
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
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Wifi size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ESP32 Hardware IP Address
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
              Configure the network endpoint where your microcontroller serves its REST API endpoints.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
                  Device Name
                </label>
                <input
                  type="text"
                  value={form.deviceName}
                  onChange={e => setForm({ ...form, deviceName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 700 }}>
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
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePing}
                    disabled={isPinging}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      borderRadius: 10,
                      padding: '9px 18px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {isPinging ? <RefreshCw size={14} className="spin" /> : <Radio size={15} />}
                    <span>Test Ping</span>
                  </button>
                </div>
              </div>
            </div>

            {pingResult && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: 10,
                background: pingResult.ok ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
                border: `1px solid ${pingResult.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '0.82rem',
                color: pingResult.ok ? '#10B981' : '#EF4444',
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
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Code size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Hardware Specifications &amp; Pinout
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>
              Technical architecture details of the physical microcontroller integration.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div style={{ background: 'rgba(11, 17, 32, 0.65)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room Temperature Input</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3 }}>
                  GPIO 4 (DHT11 1-Wire Single Bus)
                </div>
              </div>

              <div style={{ background: 'rgba(11, 17, 32, 0.65)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wet Zone Moisture Input</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3 }}>
                  GPIO 5 (DHT11 1-Wire Single Bus)
                </div>
              </div>

              <div style={{ background: 'rgba(11, 17, 32, 0.65)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Motion Detection Input</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3 }}>
                  GPIO 27 (HC-SR501 PIR Digital Interrupt)
                </div>
              </div>

              <div style={{ background: 'rgba(11, 17, 32, 0.65)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room Ceiling Fan Output</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3 }}>
                  GPIO 25 (IRLZ44N 25kHz LEDC PWM)
                </div>
              </div>

              <div style={{ background: 'rgba(11, 17, 32, 0.65)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exhaust Ventilation Output</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3 }}>
                  GPIO 26 (Opto-Isolated Digital Relay)
                </div>
              </div>

              <div style={{ background: 'rgba(11, 17, 32, 0.65)', padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Telemetry Polling Frequency</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC', marginTop: 3 }}>
                  Every {form.pollingIntervalMs}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <button
            type="submit"
            disabled={isSaving || commandPending}
            style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #3B82F6 100%)',
              color: '#070B14',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: isSaving ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 0 24px rgba(0, 242, 254, 0.35)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={18} />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
