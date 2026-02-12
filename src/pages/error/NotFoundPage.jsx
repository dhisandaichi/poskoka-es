import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';

export default function NotFoundPage() {
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
            <MapPinOff size={64} style={{ color: 'var(--text-muted)', marginBottom: 24 }} />
            <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>404</h1>
            <h2 style={{ marginBottom: 16 }}>Halaman Tidak Ditemukan</h2>
            <p className="text-secondary" style={{ maxWidth: 400, marginBottom: 32 }}>
                Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            </p>
            <Link to="/" className="btn btn-primary">
                Kembali ke Beranda
            </Link>
        </div>
    );
}
