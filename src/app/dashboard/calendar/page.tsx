'use client';

import { useState, useEffect } from 'react';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, format, isSameMonth, isSameDay,
    addMonths, subMonths, isToday
} from 'date-fns';
import { de } from 'date-fns/locale';
import { InstagramLogo, FacebookLogo, LinkedInLogo, XLogo } from '@/components/SocialLogos';
import './calendar.css';

interface Post {
    id: string;
    content: string;
    platform: string;
    status: string;
    scheduledAt: string | null;
    createdAt: string;
    hashtags: string | null;
}

const PLATFORM_COLORS: Record<string, string> = {
    instagram: 'var(--platform-instagram)',
    facebook: 'var(--platform-facebook)',
    linkedin: 'var(--platform-linkedin)',
    twitter: 'var(--platform-twitter)',
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    instagram: <InstagramLogo size={14} />,
    facebook: <FacebookLogo size={14} />,
    linkedin: <LinkedInLogo size={14} />,
    twitter: <XLogo size={14} />,
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'list'>('month');
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [filterPlatform, setFilterPlatform] = useState<string>('all');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } catch { }
    };

    const deletePost = async (id: string) => {
        if (!confirm('Post wirklich löschen?')) return;
        try {
            await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            setPosts(prev => prev.filter(p => p.id !== id));
            setSelectedPost(null);
        } catch { }
    };

    const filteredPosts = filterPlatform === 'all'
        ? posts
        : posts.filter(p => p.platform === filterPlatform);

    // Month view calendar days
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getPostsForDay = (day: Date) =>
        filteredPosts.filter(p => {
            const date = p.scheduledAt ? new Date(p.scheduledAt) : new Date(p.createdAt);
            return isSameDay(date, day);
        });

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Content-Kalender</h1>
            <p className="page-subtitle">Planen und verwalten Sie Ihre Social Media Posts</p>

            {/* Controls */}
            <div className="calendar-controls">
                <div className="calendar-nav">
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        ←
                    </button>
                    <span className="calendar-month-label">
                        {format(currentDate, 'MMMM yyyy', { locale: de })}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        →
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCurrentDate(new Date())}>
                        Heute
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <select
                        className="select"
                        style={{ width: '140px' }}
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                    >
                        <option value="all">Alle Plattformen</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">X/Twitter</option>
                    </select>

                    <div className="tabs">
                        <button className={`tab ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Monat</button>
                        <button className={`tab ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Woche</button>
                        <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>Liste</button>
                    </div>
                </div>
            </div>

            {/* Month View */}
            {view === 'month' && (
                <div className="glass-card-static calendar-grid-wrapper">
                    <div className="calendar-weekdays">
                        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                            <div key={day} className="calendar-weekday">{day}</div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {calendarDays.map(day => {
                            const dayPosts = getPostsForDay(day);
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isToday(day) ? 'today' : ''}`}
                                >
                                    <div className="calendar-day-number">{format(day, 'd')}</div>
                                    <div className="calendar-day-posts">
                                        {dayPosts.slice(0, 3).map(post => (
                                            <div
                                                key={post.id}
                                                className="calendar-post-dot"
                                                style={{ borderLeftColor: PLATFORM_COLORS[post.platform] || 'var(--accent-primary)' }}
                                                onClick={() => setSelectedPost(post)}
                                                title={post.content.substring(0, 50)}
                                            >
                                                <span className="text-xs">{PLATFORM_ICONS[post.platform]}</span>
                                                <span className="truncate text-xs">{post.content.substring(0, 25)}</span>
                                            </div>
                                        ))}
                                        {dayPosts.length > 3 && (
                                            <div className="text-xs text-tertiary" style={{ padding: '0 4px' }}>
                                                +{dayPosts.length - 3} mehr
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {(view === 'list' || view === 'week') && (
                <div className="glass-card-static" style={{ overflow: 'hidden' }}>
                    {filteredPosts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📅</div>
                            <div className="empty-state-title">Keine Posts gefunden</div>
                            <div className="empty-state-text">Erstellen Sie Ihren ersten Post im Creator</div>
                        </div>
                    ) : (
                        filteredPosts
                            .sort((a, b) => new Date(b.scheduledAt || b.createdAt).getTime() - new Date(a.scheduledAt || a.createdAt).getTime())
                            .map(post => (
                                <div
                                    key={post.id}
                                    className="list-post-item"
                                    onClick={() => setSelectedPost(post)}
                                    style={{ borderLeftColor: PLATFORM_COLORS[post.platform] }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, minWidth: 0 }}>
                                        <span style={{ fontSize: '1.25rem' }}>{PLATFORM_ICONS[post.platform]}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="truncate font-semibold text-sm">{post.content.substring(0, 80)}</div>
                                            <div className="text-xs text-tertiary">
                                                {post.scheduledAt
                                                    ? format(new Date(post.scheduledAt), 'dd.MM.yyyy HH:mm', { locale: de })
                                                    : format(new Date(post.createdAt), 'dd.MM.yyyy', { locale: de })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`badge badge-${post.status}`}>
                                        {post.status === 'draft' && 'Entwurf'}
                                        {post.status === 'scheduled' && 'Geplant'}
                                        {post.status === 'published' && 'Veröffentlicht'}
                                    </span>
                                </div>
                            ))
                    )}
                </div>
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{PLATFORM_ICONS[selectedPost.platform]} Post-Details</h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPost(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <span className={`badge badge-${selectedPost.status}`} style={{ marginRight: 'var(--space-sm)' }}>
                                    {selectedPost.status === 'draft' && 'Entwurf'}
                                    {selectedPost.status === 'scheduled' && 'Geplant'}
                                    {selectedPost.status === 'published' && 'Veröffentlicht'}
                                </span>
                                <span className={`badge badge-${selectedPost.platform}`}>
                                    {selectedPost.platform}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 'var(--space-md)' }}>
                                {selectedPost.content}
                            </div>
                            {selectedPost.hashtags && (
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-accent)', marginBottom: 'var(--space-md)' }}>
                                    {selectedPost.hashtags}
                                </div>
                            )}
                            <div className="text-xs text-tertiary">
                                {selectedPost.scheduledAt
                                    ? `Geplant: ${format(new Date(selectedPost.scheduledAt), 'dd.MM.yyyy HH:mm', { locale: de })}`
                                    : `Erstellt: ${format(new Date(selectedPost.createdAt), 'dd.MM.yyyy', { locale: de })}`
                                }
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger btn-sm" onClick={() => deletePost(selectedPost.id)}>
                                🗑️ Löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
