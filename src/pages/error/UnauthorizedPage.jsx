import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
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
            <ShieldAlert size={64} style={{ color: 'var(--amber-400)', marginBottom: 24 }} />
            <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>401</h1>
            <h2 style={{ marginBottom: 16 }}>Akses Ditolak</h2>
            <p className="text-secondary" style={{ maxWidth: 400, marginBottom: 32 }}>
                Anda harus login terlebih dahulu untuk mengakses halaman ini. Silakan masuk dengan akun Anda.
            </p>
            <Link to="/login" className="btn btn-primary">
                Login Sekarang
            </Link>
        </div>
    );
}
