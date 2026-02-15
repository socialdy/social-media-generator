'use client';

import { useSession, signOut } from '@/lib/auth/client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import './dashboard.css';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/creator', label: 'Creator', icon: '✨' },
    { href: '/dashboard/calendar', label: 'Kalender', icon: '📅' },
    { href: '/dashboard/media', label: 'Media', icon: '🖼️' },
    { href: '/dashboard/templates', label: 'Vorlagen', icon: '📋' },
    { href: '/dashboard/settings', label: 'Einstellungen', icon: '⚙️' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!isPending && !session) {
            router.push('/login');
        }
    }, [session, isPending, router]);

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    if (isPending) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <span>Laden...</span>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className={`dashboard-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">KI</div>
                        {sidebarOpen && <span className="logo-text">SocialHub</span>}
                    </div>
                    <button
                        className="sidebar-toggle hide-mobile"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(item.href);
                                setMobileOpen(false);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </a>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="user-details">
                                <span className="user-name">{session.user.name}</span>
                                <span className="user-email">{session.user.email}</span>
                            </div>
                        )}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Abmelden"
                    >
                        🚪
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        ☰
                    </button>
                    <div className="header-breadcrumb">
                        {navItems.find(i => i.href === pathname)?.icon}{' '}
                        {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => router.push('/dashboard/creator')}
                        >
                            ✨ Neuer Post
                        </button>
                    </div>
                </header>
                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
