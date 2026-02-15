'use client';

import { useSession } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { InstagramLogo, FacebookLogo, LinkedInLogo, XLogo } from '@/components/SocialLogos';

interface Post {
    id: string;
    content: string;
    platform: string;
    status: string;
    scheduledAt: string | null;
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [stats, setStats] = useState({ total: 0, drafts: 0, scheduled: 0, published: 0 });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
                setStats(data.stats || { total: 0, drafts: 0, scheduled: 0, published: 0 });
            }
        } catch {
            // API not yet available
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Guten Morgen';
        if (hour < 18) return 'Guten Tag';
        return 'Guten Abend';
    };

    const platformIcon = (platform: string): React.ReactNode => {
        const icons: Record<string, React.ReactNode> = {
            facebook: <FacebookLogo size={20} />,
            instagram: <InstagramLogo size={20} />,
            linkedin: <LinkedInLogo size={20} />,
            twitter: <XLogo size={20} />
        };
        return icons[platform] || <span>📱</span>;
    };

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">
                {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="page-subtitle">
                Hier ist Ihre Social Media Übersicht
            </p>

            {/* Stats */}
            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Gesamt Posts</div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-value">{stats.drafts}</div>
                    <div className="stat-label">Entwürfe</div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-value">{stats.scheduled}</div>
                    <div className="stat-label">Geplant</div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{stats.published}</div>
                    <div className="stat-label">Veröffentlicht</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="section-title">Schnellaktionen</div>
            <div className="grid grid-3" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <button
                    className="glass-card"
                    onClick={() => router.push('/dashboard/creator')}
                    style={{ padding: 'var(--space-lg)', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>✨</div>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Neuer Post</div>
                    <div className="text-sm text-secondary">KI-gestützten Content erstellen</div>
                </button>
                <button
                    className="glass-card"
                    onClick={() => router.push('/dashboard/calendar')}
                    style={{ padding: 'var(--space-lg)', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>📅</div>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Kalender</div>
                    <div className="text-sm text-secondary">Posts planen & verwalten</div>
                </button>
                <button
                    className="glass-card"
                    onClick={() => router.push('/dashboard/media')}
                    style={{ padding: 'var(--space-lg)', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>🖼️</div>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>Media Upload</div>
                    <div className="text-sm text-secondary">Bilder hochladen & verwalten</div>
                </button>
            </div>

            {/* Recent Posts */}
            <div className="section-title">Letzte Posts</div>
            <div className="glass-card-static" style={{ overflow: 'hidden' }}>
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">Noch keine Posts</div>
                        <div className="empty-state-text">
                            Erstellen Sie Ihren ersten Social Media Post mit KI-Unterstützung
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => router.push('/dashboard/creator')}
                        >
                            ✨ Ersten Post erstellen
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {posts.slice(0, 5).map((post) => (
                            <div
                                key={post.id}
                                style={{
                                    padding: 'var(--space-md) var(--space-lg)',
                                    borderBottom: '1px solid var(--border-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                }}
                            >
                                <span style={{ fontSize: '1.25rem' }}>
                                    {platformIcon(post.platform)}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="truncate" style={{ fontWeight: 500 }}>
                                        {post.content.substring(0, 80)}...
                                    </div>
                                    <div className="text-xs text-tertiary">
                                        {new Date(post.createdAt).toLocaleDateString('de-AT')}
                                    </div>
                                </div>
                                <span className={`badge badge-${post.status}`}>
                                    {post.status === 'draft' && 'Entwurf'}
                                    {post.status === 'scheduled' && 'Geplant'}
                                    {post.status === 'published' && 'Veröffentlicht'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
