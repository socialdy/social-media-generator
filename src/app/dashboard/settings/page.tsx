'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth/client';
import { InstagramLogo, FacebookLogo, LinkedInLogo, XLogo } from '@/components/SocialLogos';
import './settings.css';

interface SocialAccount {
    id: string;
    platform: string;
    accountName: string;
    accountHandle: string;
}

interface BrandSettings {
    companyName: string;
    industry: string;
    targetAudience: string;
    toneOfVoice: string;
    primaryColor: string;
    secondaryColor: string;
    website: string;
}

const PLATFORM_OPTIONS = [
    { id: 'instagram', label: 'Instagram', icon: <InstagramLogo size={16} /> },
    { id: 'facebook', label: 'Facebook', icon: <FacebookLogo size={16} /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInLogo size={16} /> },
    { id: 'twitter', label: 'X (Twitter)', icon: <XLogo size={16} /> },
];

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('api-keys');

    // API Keys
    const [geminiKey, setGeminiKey] = useState('');
    const [nanoBananaKey, setNanoBananaKey] = useState('');
    const [hasGeminiKey, setHasGeminiKey] = useState(false);
    const [hasNanoBananaKey, setHasNanoBananaKey] = useState(false);
    const [savingKeys, setSavingKeys] = useState(false);

    // Social Accounts
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [newPlatform, setNewPlatform] = useState('instagram');
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountHandle, setNewAccountHandle] = useState('');
    const [addingAccount, setAddingAccount] = useState(false);

    // Brand
    const [brand, setBrand] = useState<BrandSettings>({
        companyName: '', industry: '', targetAudience: '', toneOfVoice: '',
        primaryColor: '#3B82F6', secondaryColor: '#8B5CF6', website: '',
    });
    const [savingBrand, setSavingBrand] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchAccounts();
        fetchBrand();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.settings) {
                    setHasGeminiKey(data.settings.hasGeminiKey);
                    setHasNanoBananaKey(data.settings.hasNanoBananaKey);
                }
            }
        } catch { }
    };

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/social-accounts');
            if (res.ok) {
                const data = await res.json();
                setAccounts(data.accounts || []);
            }
        } catch { }
    };

    const fetchBrand = async () => {
        try {
            const res = await fetch('/api/brand');
            if (res.ok) {
                const data = await res.json();
                if (data.brand) {
                    setBrand(prev => ({ ...prev, ...data.brand }));
                }
            }
        } catch { }
    };

    const saveApiKeys = async () => {
        setSavingKeys(true);
        try {
            const body: any = {};
            if (geminiKey) body.geminiApiKey = geminiKey;
            if (nanoBananaKey) body.nanoBananaApiKey = nanoBananaKey;

            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert('API-Keys gespeichert! ✅');
                setGeminiKey('');
                setNanoBananaKey('');
                fetchSettings();
            }
        } catch {
            alert('Fehler beim Speichern');
        } finally {
            setSavingKeys(false);
        }
    };

    const addAccount = async () => {
        if (!newAccountName.trim()) return;
        setAddingAccount(true);
        try {
            const res = await fetch('/api/social-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: newPlatform,
                    accountName: newAccountName,
                    accountHandle: newAccountHandle,
                }),
            });
            if (res.ok) {
                fetchAccounts();
                setNewAccountName('');
                setNewAccountHandle('');
            }
        } catch { } finally {
            setAddingAccount(false);
        }
    };

    const removeAccount = async (id: string) => {
        if (!confirm('Account wirklich entfernen?')) return;
        try {
            await fetch(`/api/social-accounts?id=${id}`, { method: 'DELETE' });
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch { }
    };

    const saveBrand = async () => {
        setSavingBrand(true);
        try {
            const res = await fetch('/api/brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(brand),
            });
            if (res.ok) {
                alert('Marken-Einstellungen gespeichert! ✅');
            }
        } catch {
            alert('Fehler beim Speichern');
        } finally {
            setSavingBrand(false);
        }
    };

    const platformIcon = (platform: string) => {
        return PLATFORM_OPTIONS.find(p => p.id === platform)?.icon || '📱';
    };

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Einstellungen</h1>
            <p className="page-subtitle">Konfigurieren Sie Ihr Social Media Tool</p>

            <div className="settings-layout">
                {/* Tabs */}
                <div className="settings-tabs glass-card-static">
                    <button className={`settings-tab ${activeTab === 'api-keys' ? 'active' : ''}`} onClick={() => setActiveTab('api-keys')}>
                        🔑 API-Keys
                    </button>
                    <button className={`settings-tab ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
                        📱 Social Accounts
                    </button>
                    <button className={`settings-tab ${activeTab === 'brand' ? 'active' : ''}`} onClick={() => setActiveTab('brand')}>
                        🏢 Marke
                    </button>
                    <button className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        👤 Profil
                    </button>
                </div>

                {/* Content */}
                <div className="settings-panel">
                    {/* ─── API Keys ─── */}
                    {activeTab === 'api-keys' && (
                        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                            <h2 className="settings-section-title">🔑 API-Schlüssel</h2>
                            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                                Ihre API-Keys werden sicher gespeichert und nur für die KI-Generierung verwendet.
                            </p>

                            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="label">
                                    Google Gemini API-Key
                                    {hasGeminiKey && <span className="badge badge-success" style={{ marginLeft: 'var(--space-sm)' }}>✅ Hinterlegt</span>}
                                </label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder={hasGeminiKey ? '••••••••••••' : 'AIza... (Google AI Studio API-Key)'}
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                />
                                <div className="text-xs text-tertiary" style={{ marginTop: 'var(--space-xs)' }}>
                                    Holen Sie sich Ihren Key: <a href="https://aistudio.google.com/apikey" target="_blank" className="text-accent">Google AI Studio →</a>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="label">
                                    Nano Banana API-Key
                                    {hasNanoBananaKey && <span className="badge badge-success" style={{ marginLeft: 'var(--space-sm)' }}>✅ Hinterlegt</span>}
                                </label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder={hasNanoBananaKey ? '••••••••••••' : 'Nano Banana API-Key für Bildgenerierung'}
                                    value={nanoBananaKey}
                                    onChange={(e) => setNanoBananaKey(e.target.value)}
                                />
                                <div className="text-xs text-tertiary" style={{ marginTop: 'var(--space-xs)' }}>
                                    Bildgenerierung für Social Media Posts
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={saveApiKeys}
                                disabled={savingKeys || (!geminiKey && !nanoBananaKey)}
                            >
                                {savingKeys ? 'Speichert...' : '💾 API-Keys speichern'}
                            </button>
                        </div>
                    )}

                    {/* ─── Social Accounts ─── */}
                    {activeTab === 'accounts' && (
                        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                            <h2 className="settings-section-title">📱 Social Media Accounts</h2>
                            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                                Verknüpfen Sie Ihre Social Media Konten, um Posts direkt zu veröffentlichen.
                            </p>

                            {/* Existing Accounts */}
                            {accounts.length > 0 && (
                                <div style={{ marginBottom: 'var(--space-lg)' }}>
                                    {accounts.map(account => (
                                        <div key={account.id} className="account-row">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                <span style={{ fontSize: '1.25rem' }}>{platformIcon(account.platform)}</span>
                                                <div>
                                                    <div className="font-semibold text-sm">{account.accountName}</div>
                                                    {account.accountHandle && (
                                                        <div className="text-xs text-tertiary">@{account.accountHandle}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <button className="btn btn-danger btn-sm" onClick={() => removeAccount(account.id)}>
                                                Entfernen
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Account */}
                            <div className="add-account-form">
                                <h3 className="text-sm font-semibold" style={{ marginBottom: 'var(--space-md)' }}>
                                    Account hinzufügen
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                    <select
                                        className="select"
                                        value={newPlatform}
                                        onChange={(e) => setNewPlatform(e.target.value)}
                                    >
                                        {PLATFORM_OPTIONS.map(p => (
                                            <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        className="input"
                                        placeholder="Account Name"
                                        value={newAccountName}
                                        onChange={(e) => setNewAccountName(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                    <input
                                        className="input"
                                        placeholder="@handle (optional)"
                                        value={newAccountHandle}
                                        onChange={(e) => setNewAccountHandle(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={addAccount}
                                        disabled={addingAccount || !newAccountName.trim()}
                                    >
                                        {addingAccount ? '...' : '+ Hinzufügen'}
                                    </button>
                                </div>
                            </div>

                            <div className="info-card" style={{ marginTop: 'var(--space-lg)' }}>
                                💡 <strong>Hinweis:</strong> OAuth-Verknüpfung (automatisches Posten) wird in einer zukünftigen Version verfügbar sein. Aktuell können Sie Accounts manuell verwalten.
                            </div>
                        </div>
                    )}

                    {/* ─── Brand ─── */}
                    {activeTab === 'brand' && (
                        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                            <h2 className="settings-section-title">🏢 Marken-Einstellungen</h2>
                            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                                Diese Informationen werden der KI übergeben, um besseren Content zu erstellen.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                                <div className="form-group">
                                    <label className="label">Firmenname</label>
                                    <input className="input" placeholder="z.B. KI-Kanzlei" value={brand.companyName} onChange={e => setBrand(prev => ({ ...prev, companyName: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="label">Branche</label>
                                    <input className="input" placeholder="z.B. IT-Dienstleistungen" value={brand.industry} onChange={e => setBrand(prev => ({ ...prev, industry: e.target.value }))} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Zielgruppe</label>
                                <input className="input" placeholder="z.B. KMUs in Österreich, 20-50 Mitarbeiter" value={brand.targetAudience} onChange={e => setBrand(prev => ({ ...prev, targetAudience: e.target.value }))} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Tone of Voice</label>
                                <textarea className="textarea" placeholder="z.B. Professionell aber nahbar, technisch versiert, vertrauenswürdig..." value={brand.toneOfVoice} onChange={e => setBrand(prev => ({ ...prev, toneOfVoice: e.target.value }))} rows={3} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Website</label>
                                <input className="input" placeholder="https://www.ki-kanzlei.at" value={brand.website} onChange={e => setBrand(prev => ({ ...prev, website: e.target.value }))} />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <div className="form-group">
                                    <label className="label">Primärfarbe</label>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                        <input type="color" value={brand.primaryColor} onChange={e => setBrand(prev => ({ ...prev, primaryColor: e.target.value }))} />
                                        <span className="text-sm text-secondary">{brand.primaryColor}</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="label">Sekundärfarbe</label>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                        <input type="color" value={brand.secondaryColor} onChange={e => setBrand(prev => ({ ...prev, secondaryColor: e.target.value }))} />
                                        <span className="text-sm text-secondary">{brand.secondaryColor}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={saveBrand} disabled={savingBrand}>
                                {savingBrand ? 'Speichert...' : '💾 Marke speichern'}
                            </button>
                        </div>
                    )}

                    {/* ─── Profile ─── */}
                    {activeTab === 'profile' && (
                        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                            <h2 className="settings-section-title">👤 Profil</h2>

                            <div className="profile-card">
                                <div className="profile-avatar">
                                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="font-semibold">{session?.user?.name || '—'}</div>
                                    <div className="text-sm text-secondary">{session?.user?.email || '—'}</div>
                                </div>
                            </div>

                            <div className="info-card">
                                ℹ️ Profiländerungen werden in einer zukünftigen Version verfügbar sein.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
