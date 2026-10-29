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
  RefreshCw 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    saveConfigToDevice, 
    pingDevice, 
    toggleDemoMode, 
    commandPending 
  } = useAirLoop();

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
    const success = await saveConfigToDevice();
    setIsSaving(false);
    if (success) {
      setSaveSuccessMsg('Configuration synced successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900, margin: '0 auto' }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Settings size={20} color="var(--accent-primary)" />
          <span>Device Configuration &amp; Network Setup</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Fine-tune temperature trigger bands, baseline decay parameters, and ESP32 endpoints.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {validationErrors.length > 0 && (
          <div style={{
            background: 'var(--color-error-dim)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 10,
            padding: '12px',
            color: 'var(--color-error)',
            fontSize: '0.8rem'
          }}>
            {validationErrors.map((err, i) => (
              <div key={i}>• {err}</div>
            ))}
          </div>
        )}

        {saveSuccessMsg && (
          <div style={{
            background: 'var(--color-success-dim)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 10,
            padding: '12px',
            color: 'var(--color-success)',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Check size={16} /> {saveSuccessMsg}
          </div>
        )}

        {/* 1. Hardware Connection */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Wifi size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              ESP32 HTTP Integration
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Device Identifier
              </label>
              <input
                type="text"
                value={form.deviceName}
                onChange={e => setForm({ ...form, deviceName: e.target.value })}
                style={{
                  width: '100%',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                ESP32 Base URL (HTTP)
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={form.esp32BaseUrl}
                  onChange={e => setForm({ ...form, esp32BaseUrl: e.target.value })}
                  placeholder="http://192.168.1.100"
                  style={{
                    flex: 1,
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--accent-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handlePing}
                  disabled={isPinging}
                  style={{
                    background: 'var(--btn-subtle-bg)',
                    border: '1px solid var(--btn-subtle-border)',
                    color: 'var(--text-secondary)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {isPinging ? <RefreshCw size={13} className="spin" /> : <Radio size={13} />}
                  <span>Ping</span>
                </button>
              </div>
            </div>
          </div>

          {pingResult && (
            <div style={{
              marginTop: 10,
              fontSize: '0.75rem',
              color: pingResult.ok ? 'var(--color-success)' : 'var(--color-error)',
              fontFamily: 'var(--font-mono)'
            }}>
              {pingResult.ok ? `✓ Node responsive (${pingResult.latencyMs}ms latency)` : `✗ Ping error: ${pingResult.error}`}
            </div>
          )}
        </div>

        {/* 2. Temperature Thresholds */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <Sliders size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Automatic Temperature Trigger Thresholds (°C)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Cool Max (&lt; Low band)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.tempCoolMax}
                onChange={e => setForm({ ...form, tempCoolMax: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Comfort Max (Medium band)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.tempComfortMax}
                onChange={e => setForm({ ...form, tempComfortMax: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Warm Max (High band)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.tempWarmMax}
                onChange={e => setForm({ ...form, tempWarmMax: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Demo Mode Switch */}
        <div className="glass-panel" style={{
          padding: '16px 20px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
              Simulation Engine
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Generate synthetic thermal and moisture telemetry for live testing without hardware.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !form.demoMode;
              setForm({ ...form, demoMode: next });
              toggleDemoMode(next);
            }}
            style={{
              background: form.demoMode ? 'var(--accent-amber-dim)' : 'var(--surface-2)',
              border: form.demoMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
              color: form.demoMode ? 'var(--accent-amber)' : 'var(--text-secondary)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {form.demoMode ? 'Simulation Active' : 'Live ESP32 Mode'}
          </button>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="submit"
            disabled={isSaving || commandPending}
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--text-on-accent)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 16px var(--accent-primary-glow)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {isSaving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
