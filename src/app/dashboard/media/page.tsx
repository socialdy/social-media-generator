'use client';

import { useState, useRef, useEffect } from 'react';
import './media.css';

interface MediaItem {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number | null;
    tags: string | null;
    createdAt: string;
}

export default function MediaPage() {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/media');
            if (res.ok) {
                const data = await res.json();
                setMediaItems(data.media || []);
            }
        } catch { }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/media', {
                    method: 'POST',
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    setMediaItems(prev => [data.media, ...prev]);
                }
            } catch {
                console.error('Upload failed for:', file.name);
            }
        }

        setUploading(false);
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const deleteMedia = async (id: string) => {
        if (!confirm('Bild wirklich löschen?')) return;
        try {
            await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
            setMediaItems(prev => prev.filter(m => m.id !== id));
            setSelectedItem(null);
        } catch { }
    };

    const filteredMedia = mediaItems.filter(m =>
        m.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.tags && m.tags.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Media Library</h1>
            <p className="page-subtitle">Verwalten Sie Ihre Bilder und Medien</p>

            {/* Upload Zone */}
            <div
                className={`upload-zone glass-card-static ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(e) => handleUpload(e.target.files)}
                    style={{ display: 'none' }}
                />
                {uploading ? (
                    <>
                        <div className="loading-spinner" />
                        <span>Wird hochgeladen...</span>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: '2rem' }}>📤</div>
                        <div className="font-semibold">Bilder hier ablegen oder klicken</div>
                        <div className="text-xs text-tertiary">PNG, JPG, WebP • Max 10MB</div>
                    </>
                )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                <input
                    className="input"
                    placeholder="🔍 Bilder durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* Grid */}
            {filteredMedia.length === 0 ? (
                <div className="glass-card-static">
                    <div className="empty-state">
                        <div className="empty-state-icon">🖼️</div>
                        <div className="empty-state-title">Noch keine Bilder</div>
                        <div className="empty-state-text">Laden Sie Bilder hoch, um sie in Ihren Posts zu verwenden</div>
                    </div>
                </div>
            ) : (
                <div className="media-grid">
                    {filteredMedia.map(item => (
                        <div
                            key={item.id}
                            className="media-item glass-card"
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="media-item-image">
                                <img src={item.fileUrl} alt={item.fileName} />
                            </div>
                            <div className="media-item-info">
                                <div className="truncate text-sm font-semibold">{item.fileName}</div>
                                <div className="text-xs text-tertiary">{formatFileSize(item.fileSize)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                        <div className="modal-header">
                            <h3>🖼️ {selectedItem.fileName}</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedItem(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
                                <img src={selectedItem.fileUrl} alt={selectedItem.fileName} style={{ width: '100%', display: 'block' }} />
                            </div>
                            <div className="text-sm text-secondary">
                                <p>Typ: {selectedItem.fileType}</p>
                                <p>Größe: {formatFileSize(selectedItem.fileSize)}</p>
                                <p>Hochgeladen: {new Date(selectedItem.createdAt).toLocaleDateString('de-AT')}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger btn-sm" onClick={() => deleteMedia(selectedItem.id)}>
                                🗑️ Löschen
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                navigator.clipboard.writeText(selectedItem.fileUrl);
                                alert('URL kopiert!');
                            }}>
                                📋 URL kopieren
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
