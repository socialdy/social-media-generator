'use client';

import { useState, useRef } from 'react';
import { InstagramLogo, FacebookLogo, LinkedInLogo, XLogo } from '@/components/SocialLogos';
import './creator.css';

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: <InstagramLogo size={18} />, maxChars: 2200 },
    { id: 'facebook', label: 'Facebook', icon: <FacebookLogo size={18} />, maxChars: 63206 },
    { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInLogo size={18} />, maxChars: 3000 },
    { id: 'twitter', label: 'X (Twitter)', icon: <XLogo size={18} />, maxChars: 280 },
];

const TONALITIES = [
    { id: 'professional', label: 'Professionell', icon: '👔' },
    { id: 'friendly', label: 'Locker & Freundlich', icon: '😊' },
    { id: 'informative', label: 'Informativ', icon: '📚' },
    { id: 'inspiring', label: 'Inspirierend', icon: '💡' },
    { id: 'humorous', label: 'Humorvoll', icon: '😄' },
];

interface PostVariant {
    text: string;
    hashtags: string;
}

export default function CreatorPage() {
    // Step management
    const [step, setStep] = useState(1);

    // Step 1: Briefing
    const [topic, setTopic] = useState('');
    const [tonality, setTonality] = useState('professional');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
    const [targetAudience, setTargetAudience] = useState('');
    const [additionalContext, setAdditionalContext] = useState('');

    // Step 2: Content
    const [variants, setVariants] = useState<PostVariant[]>([]);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [editedText, setEditedText] = useState('');
    const [editedHashtags, setEditedHashtags] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatingText, setGeneratingText] = useState(false);
    const [generatingImage, setGeneratingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 3: Publish
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('');
    const [saving, setSaving] = useState(false);

    const togglePlatform = (platform: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const generateContent = async () => {
        if (!topic.trim()) return;
        setGeneratingText(true);

        try {
            const res = await fetch('/api/ai/generate-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    tonality,
                    platforms: selectedPlatforms,
                    targetAudience,
                    additionalContext,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setVariants(data.variants || []);
                if (data.variants?.length > 0) {
                    setSelectedVariant(0);
                    setEditedText(data.variants[0].text);
                    setEditedHashtags(data.variants[0].hashtags);
                }
                setStep(2);
            } else {
                const err = await res.json();
                alert(err.error || 'Fehler bei der Generierung. Bitte überprüfen Sie Ihren API-Key in den Einstellungen.');
            }
        } catch {
            alert('Fehler bei der Verbindung zum Server.');
        } finally {
            setGeneratingText(false);
        }
    };

    const generateImage = async () => {
        setGeneratingImage(true);
        try {
            const res = await fetch('/api/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: editedText.substring(0, 200), topic }),
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.imageUrl);
                setUploadedImage(null);
            } else {
                const err = await res.json();
                alert(err.error || 'Bild-Generierung fehlgeschlagen. Bitte überprüfen Sie Ihren Nano Banana API-Key.');
            }
        } catch {
            alert('Fehler bei der Bild-Generierung.');
        } finally {
            setGeneratingImage(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target?.result as string);
            setImageUrl(null);
        };
        reader.readAsDataURL(file);
    };

    const selectVariant = (index: number) => {
        setSelectedVariant(index);
        setEditedText(variants[index].text);
        setEditedHashtags(variants[index].hashtags);
    };

    const savePost = async (status: 'draft' | 'scheduled') => {
        setSaving(true);
        try {
            let scheduledAt = null;
            if (status === 'scheduled' && publishDate && publishTime) {
                scheduledAt = new Date(`${publishDate}T${publishTime}`).toISOString();
            }

            // Save post for each selected platform
            for (const platform of selectedPlatforms) {
                await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: editedText,
                        platform,
                        status,
                        scheduledAt,
                        hashtags: editedHashtags,
                        tonality,
                        imageUrl: uploadedImage || imageUrl,
                    }),
                });
            }

            // Reset
            setStep(1);
            setTopic('');
            setEditedText('');
            setEditedHashtags('');
            setImageUrl(null);
            setUploadedImage(null);
            setVariants([]);
            alert(status === 'draft' ? 'Entwurf gespeichert!' : 'Post geplant!');
        } catch {
            alert('Fehler beim Speichern.');
        } finally {
            setSaving(false);
        }
    };

    const currentImage = uploadedImage || imageUrl;
    const currentPlatform = PLATFORMS.find(p => selectedPlatforms.includes(p.id));
    const charLimit = currentPlatform?.maxChars || 2200;

    return (
        <div className="creator-page animate-fade-in">
            {/* Steps Indicator */}
            <div className="creator-steps">
                <div className={`creator-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <span>Briefing</span>
                </div>
                <div className="step-line" />
                <div className={`creator-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <span>Content</span>
                </div>
                <div className="step-line" />
                <div className={`creator-step ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <span>Veröffentlichen</span>
                </div>
            </div>

            <div className="creator-layout">
                {/* Left: Form */}
                <div className="creator-form-panel">
                    {/* ─── Step 1: Briefing ─── */}
                    {step === 1 && (
                        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                                📝 Briefing
                            </h2>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Thema / Inhalt *</label>
                                <textarea
                                    className="textarea"
                                    placeholder="Worüber möchten Sie posten? z.B. 'Neues Produkt Launch', 'Tipps für KMUs', 'Behind the Scenes'..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Tonalität</label>
                                <div className="tonality-grid">
                                    {TONALITIES.map(t => (
                                        <button
                                            key={t.id}
                                            className={`tonality-option ${tonality === t.id ? 'selected' : ''}`}
                                            onClick={() => setTonality(t.id)}
                                        >
                                            <span>{t.icon}</span>
                                            <span>{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Plattformen</label>
                                <div className="platform-grid">
                                    {PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            className={`platform-option ${selectedPlatforms.includes(p.id) ? 'selected' : ''}`}
                                            onClick={() => togglePlatform(p.id)}
                                        >
                                            <span>{p.icon}</span>
                                            <span>{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Zielgruppe (optional)</label>
                                <input
                                    className="input"
                                    placeholder="z.B. KMU-Inhaber, junge Gründer, Marketing-Manager..."
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="label">Zusätzlicher Kontext (optional)</label>
                                <textarea
                                    className="textarea"
                                    placeholder="Weitere Informationen für die KI, z.B. Unternehmensdetails, spezifische Punkte die erwähnt werden sollen..."
                                    value={additionalContext}
                                    onChange={(e) => setAdditionalContext(e.target.value)}
                                    rows={2}
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-lg w-full"
                                onClick={generateContent}
                                disabled={!topic.trim() || generatingText || selectedPlatforms.length === 0}
                            >
                                {generatingText ? (
                                    <>
                                        <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                        KI generiert...
                                    </>
                                ) : (
                                    '✨ Content generieren'
                                )}
                            </button>
                        </div>
                    )}

                    {/* ─── Step 2: Content Editing ─── */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {/* Variant Selection */}
                            {variants.length > 1 && (
                                <div className="glass-card-static" style={{ padding: 'var(--space-md)' }}>
                                    <label className="label" style={{ marginBottom: 'var(--space-sm)' }}>
                                        Variante wählen
                                    </label>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                        {variants.map((_, i) => (
                                            <button
                                                key={i}
                                                className={`btn ${selectedVariant === i ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                                onClick={() => selectVariant(i)}
                                            >
                                                Variante {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Text Editor */}
                            <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                    <label className="label" style={{ margin: 0 }}>Post-Text</label>
                                    <span className="text-xs text-tertiary">
                                        {editedText.length} / {charLimit} Zeichen
                                    </span>
                                </div>
                                <textarea
                                    className="textarea"
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    rows={8}
                                    style={{ minHeight: '180px' }}
                                />
                            </div>

                            {/* Hashtags */}
                            <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                                <label className="label">Hashtags</label>
                                <input
                                    className="input"
                                    value={editedHashtags}
                                    onChange={(e) => setEditedHashtags(e.target.value)}
                                    placeholder="#socialmedia #marketing #ki"
                                />
                            </div>

                            {/* Image Section */}
                            <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                                <label className="label" style={{ marginBottom: 'var(--space-md)' }}>Bild</label>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        📤 Bild hochladen
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={generateImage}
                                        disabled={generatingImage}
                                    >
                                        {generatingImage ? '⏳ Generiert...' : '🎨 KI-Bild generieren'}
                                    </button>
                                    {currentImage && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => { setImageUrl(null); setUploadedImage(null); }}
                                        >
                                            ✕ Bild entfernen
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                {currentImage && (
                                    <div className="image-preview-editor">
                                        <img src={currentImage} alt="Post Bild" />
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                                    ← Zurück
                                </button>
                                <div style={{ flex: 1 }} />
                                <button className="btn btn-primary" onClick={() => setStep(3)}>
                                    Weiter →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── Step 3: Publish ─── */}
                    {step === 3 && (
                        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                                🚀 Veröffentlichen
                            </h2>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Plattformen</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                    {selectedPlatforms.map(pId => {
                                        const p = PLATFORMS.find(x => x.id === pId);
                                        return (
                                            <span key={pId} className={`badge badge-${pId}`}>
                                                {p?.icon} {p?.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                <label className="label">Veröffentlichungsdatum</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={publishDate}
                                    onChange={(e) => setPublishDate(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                                <label className="label">Uhrzeit</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={publishTime}
                                    onChange={(e) => setPublishTime(e.target.value)}
                                />
                            </div>

                            <div className="publish-tip glass-card-static" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)', background: 'var(--accent-glow)' }}>
                                <div className="text-sm font-semibold" style={{ marginBottom: 'var(--space-xs)' }}>
                                    💡 Beste Posting-Zeiten
                                </div>
                                <div className="text-xs text-secondary">
                                    Instagram: Di-Do 11:00-13:00 & 19:00-21:00 •
                                    LinkedIn: Di-Do 8:00-10:00 •
                                    Facebook: Mi-Fr 13:00-16:00
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button className="btn btn-ghost" onClick={() => setStep(2)}>
                                    ← Zurück
                                </button>
                                <div style={{ flex: 1 }} />
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => savePost('draft')}
                                    disabled={saving}
                                >
                                    📄 Als Entwurf
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => savePost('scheduled')}
                                    disabled={saving || !publishDate || !publishTime}
                                >
                                    {saving ? 'Speichert...' : '🚀 Planen'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="creator-preview-panel">
                    <div className="glass-card-static preview-sticky">
                        <div className="preview-header">
                            <span className="text-sm font-semibold">Live-Vorschau</span>
                            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                {selectedPlatforms.map(pId => {
                                    const p = PLATFORMS.find(x => x.id === pId);
                                    return (
                                        <span key={pId} className={`badge badge-${pId}`} style={{ fontSize: '0.6875rem' }}>
                                            {p?.icon}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="preview-card">
                            {/* Mock Social Media Post */}
                            <div className="preview-post">
                                <div className="preview-post-header">
                                    <div className="preview-avatar">K</div>
                                    <div>
                                        <div className="text-sm font-semibold">Ihr Unternehmen</div>
                                        <div className="text-xs text-tertiary">Jetzt</div>
                                    </div>
                                </div>

                                {currentImage && (
                                    <div className="preview-image">
                                        <img src={currentImage} alt="Post" />
                                    </div>
                                )}

                                <div className="preview-text">
                                    {editedText || (
                                        <span className="text-tertiary" style={{ fontStyle: 'italic' }}>
                                            {step === 1
                                                ? 'Füllen Sie das Briefing aus und die KI erstellt Ihren Content...'
                                                : 'Ihr Post-Text erscheint hier...'}
                                        </span>
                                    )}
                                </div>

                                {editedHashtags && (
                                    <div className="preview-hashtags">
                                        {editedHashtags}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Character Count */}
                        {editedText && (
                            <div className="preview-meta">
                                <div className="text-xs text-tertiary">
                                    {editedText.length} Zeichen
                                    {editedText.length > charLimit && (
                                        <span style={{ color: 'var(--error)', marginLeft: 'var(--space-xs)' }}>
                                            ⚠️ Limit überschritten
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    height: 3,
                                    background: 'var(--border-color)',
                                    borderRadius: 'var(--radius-full)',
                                    marginTop: 'var(--space-xs)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min((editedText.length / charLimit) * 100, 100)}%`,
                                        background: editedText.length > charLimit ? 'var(--error)' : 'var(--accent-primary)',
                                        borderRadius: 'var(--radius-full)',
                                        transition: 'width var(--transition-fast)'
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
