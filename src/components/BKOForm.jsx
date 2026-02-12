import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Info } from 'lucide-react';
import { supabase, getVolunteers, createBKORequest } from '../lib/supabaseClient';

const POSKO_START = new Date('2026-03-16');
const POSKO_END = new Date('2026-03-29');

function getDatesInRange() {
    const dates = [];
    for (let d = new Date(POSKO_START); d <= POSKO_END; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
}

export default function BKOForm({ onClose }) {
    const [form, setForm] = useState({
        nama: '', no_anggota: '', tahun_masuk: '', station: 'BD', session: 'pagi', date: '', linkedUser: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const [volunteers, setVolunteers] = useState([]);
    useEffect(() => {
        getVolunteers().then(data => setVolunteers(data || []));
    }, []);

    const sessions = form.station === 'BD'
        ? [{ id: 'pagi', label: 'Pagi (07:00-13:00)' }, { id: 'siang', label: 'Siang (14:00-20:00)' }]
        : [{ id: 'pagi', label: 'Pagi (07:00-11:30)' }, { id: 'sore', label: 'Sore (17:00-22:30)' }];

    const verifiedVolunteers = volunteers.filter(v => v.status === 'verified');
    const availableDates = getDatesInRange();

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nama || !form.no_anggota || !form.date) return;

        try {
            await createBKORequest({
                name: form.nama,
                station: form.station,
                dates: [form.date], // Changed to array to match schema
                session: form.session,
                status: 'pending',
                linked_volunteer_id: form.linkedUser || null
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 520 }}>
                <div className="modal-header">
                    <div className="flex items-center gap-sm">
                        <FileText size={20} style={{ color: 'var(--purple-400)' }} />
                        <h3>Form BKO (Bantuan Kendali Operasi)</h3>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                {submitted ? (
                    <div className="modal-body text-center" style={{ padding: '48px 24px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
                        <h3 style={{ marginBottom: 8 }}>Form BKO Terkirim!</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            Permintaan BKO Anda akan ditinjau oleh Koordinator Lapangan (Korlap). Harap menunggu konfirmasi.
                        </p>
                        <button className="btn btn-primary" onClick={onClose}>Tutup</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="badge badge-purple" style={{ alignSelf: 'flex-start' }}>
                                <Info size={12} /> BKO disetujui/ditolak oleh Korlap
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nama Anggota *</label>
                                <input className="form-input" placeholder="Nama lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Nomor Keanggotaan *</label>
                                    <input className="form-input" placeholder="VT-XXXX-XXX" value={form.no_anggota} onChange={e => setForm({ ...form, no_anggota: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tahun Masuk *</label>
                                    <input className="form-input" type="number" min="2018" max="2026" placeholder="2024" value={form.tahun_masuk} onChange={e => setForm({ ...form, tahun_masuk: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Stasiun Terpilih *</label>
                                    <select className="form-select" value={form.station} onChange={e => setForm({ ...form, station: e.target.value, session: 'pagi' })}>
                                        <option value="BD">Bandung</option>
                                        <option value="KAC">Kiaracondong</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sesi *</label>
                                    <select className="form-select" value={form.session} onChange={e => setForm({ ...form, session: e.target.value })}>
                                        {sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tanggal Pilihan *</label>
                                <select className="form-select" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required>
                                    <option value="">-- Pilih Tanggal --</option>
                                    {availableDates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Link ke Akun Relawan Tetap (opsional)</label>
                                <select className="form-select" value={form.linkedUser} onChange={e => setForm({ ...form, linkedUser: e.target.value })}>
                                    <option value="">-- Pilih jika terdaftar --</option>
                                    {verifiedVolunteers.map(v => <option key={v.id} value={v.id}>{v.name} ({v.no_anggota})</option>)}
                                </select>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Opsional, hanya jika terdaftar sebagai relawan tetap</span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={!form.nama || !form.no_anggota || !form.date}>
                                <FileText size={16} /> Kirim BKO
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
