import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { LogIn, Eye, EyeOff, Loader, Shield } from 'lucide-react';
import Swal from 'sweetalert2';
import { checkRateLimit } from '../utils/rateLimiter';

export default function LoginPage() {
    const { addToast } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Rate Limit Config
    const LOGIN_MAX_ATTEMPTS = 5;
    const LOGIN_WINDOW_MS = 60000; // 1 minute

    const handleLogin = async (e) => {
        e.preventDefault();

        // Check Rate Limit
        if (!checkRateLimit('login_attempt', LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
            Swal.fire({
                title: 'Terlalu Banyak Percobaan',
                text: 'Silakan tunggu 1 menit sebelum mencoba lagi.',
                icon: 'warning',
                timer: 3000
            });
            return;
        }

        setLoading(true);

        try {
            // SIGN IN
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check profile role
            const { data: profile } = await supabase
                .from('volunteers')
                .select('role')
                .eq('id', data.user.id)
                .single();

            const role = profile?.role || 'volunteer';

            await Swal.fire({
                title: 'Berhasil Login!',
                text: 'Mohon tunggu sebentar...',
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Strict Redirection
            if (['admin', 'korlap', 'pengurus'].includes(role)) {
                navigate('/admin');
            } else if (role === 'volunteer') {
                navigate('/dashboard');
            } else {
                navigate('/401'); // Fallback
            }

        } catch (error) {
            Swal.fire({
                title: 'Gagal Login',
                text: error.message,
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-hero)', padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', marginBottom: 16 }}>
                        <img src="/logo_es.png" alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                    </div>
                    <h1>Selamat Datang</h1>
                    <p className="text-secondary">Sistem Informasi Manajemen Posko</p>
                </div>

                <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="form-label">Email</label>
                            <div className="input-group">
                                <LogIn size={18} style={{ color: 'var(--text-muted)' }} />
                                <input type="email" className="form-input" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="input-group" style={{ position: 'relative' }}>
                                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••" style={{ paddingRight: 40 }} value={password} onChange={e => setPassword(e.target.value)} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <Loader size={16} className="spin" /> : null}
                            {loading ? ' Memproses...' : ' Masuk Sistem'}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Belum punya akun?
                            <button className="btn-link" onClick={() => navigate('/register')} style={{ color: 'var(--blue-400)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>
                                Daftar di sini
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
