import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface-base)',
            padding: 24,
            textAlign: 'center'
        }}>
            <Lock size={64} style={{ color: 'var(--red-400)', marginBottom: 24 }} />
            <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>403</h1>
            <h2 style={{ marginBottom: 16 }}>Dilarang Masuk</h2>
            <p className="text-secondary" style={{ maxWidth: 400, marginBottom: 32 }}>
                Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini terbatas tertentu.
            </p>
            <div className="flex gap-sm">
                <Link to="/" className="btn btn-secondary">
                    Ke Beranda
                </Link>
                <Link to="/login" className="btn btn-primary">
                    Ganti Akun
                </Link>
            </div>
        </div>
    );
}
