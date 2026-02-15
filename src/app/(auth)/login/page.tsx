'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/client';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
                callbackURL: '/dashboard'
            });
            if (result.error) {
                setError(result.error.message || 'Anmeldung fehlgeschlagen');
            } else {
                router.push('/dashboard');
            }
        } catch {
            setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <h1 className="auth-title">Willkommen zurück</h1>
            <p className="auth-subtitle">Melden Sie sich in Ihrem SocialHub-Konto an</p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label" htmlFor="email">E-Mail</label>
                    <input
                        id="email"
                        type="email"
                        className="input"
                        placeholder="ihre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="label" htmlFor="password">Passwort</label>
                    <input
                        id="password"
                        type="password"
                        className="input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full"
                    disabled={loading}
                >
                    {loading ? 'Anmeldung...' : 'Anmelden'}
                </button>
            </form>
        </div>
    );
}
