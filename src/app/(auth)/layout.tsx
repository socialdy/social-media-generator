import './auth.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-wrapper">
            <div className="auth-bg-effect" />
            <div className="auth-container">
                <div className="auth-logo">
                    <div className="auth-logo-icon">KI</div>
                    <span className="auth-logo-text">SocialHub</span>
                    <span className="auth-logo-sub">by KI-Kanzlei</span>
                </div>
                {children}
            </div>
        </div>
    );
}
