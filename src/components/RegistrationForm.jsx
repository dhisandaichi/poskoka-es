import { useState } from 'react';
import { X, UserPlus, Calendar, MapPin, Info } from 'lucide-react';

const POSKO_START = new Date('2026-03-16');
const POSKO_END = new Date('2026-03-29');

function getDatesInRange() {
    const dates = [];
    for (let d = new Date(POSKO_START); d <= POSKO_END; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
}

const availableDates = getDatesInRange();

export default function RegistrationForm({ onClose }) {
    const [form, setForm] = useState({
        nama: '', no_anggota: '', tahun_masuk: '', domisili: '', station: 'BD',
        selectedDates: {}, // { '2026-03-16': 'pagi', ... }
    });
    const [submitted, setSubmitted] = useState(false);

    const sessions = form.station === 'BD'
        ? [{ id: 'pagi', label: 'Pagi (07:00-13:00)' }, { id: 'siang', label: 'Siang (14:00-20:00)' }]
        : [{ id: 'pagi', label: 'Pagi (07:00-11:30)' }, { id: 'sore', label: 'Sore (17:00-22:30)' }];

    const toggleDate = (date) => {
        setForm(prev => {
            const newDates = { ...prev.selectedDates };
            if (newDates[date]) { delete newDates[date]; }
            else { newDates[date] = sessions[0].id; }
            return { ...prev, selectedDates: newDates };
        });
    };

    const setSession = (date, session) => {
        setForm(prev => ({ ...prev, selectedDates: { ...prev.selectedDates, [date]: session } }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nama || !form.no_anggota || !form.tahun_masuk) return;
        setSubmitted(true);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 640, maxHeight: '95vh' }}>
                <div className="modal-header">
                    <div className="flex items-center gap-sm">
                        <UserPlus size={20} style={{ color: 'var(--blue-400)' }} />
                        <h3>Form Pendaftaran Relawan Tetap</h3>
                    </div>
                    <button className="btn-icon" onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
                </div>

                {submitted ? (
                    <div className="modal-body text-center" style={{ padding: '48px 24px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                        <h3 style={{ marginBottom: 8 }}>Pendaftaran Berhasil!</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            Data Anda telah dikirim. Menunggu persetujuan pengurus. Anda akan dihubungi via WA/email setelah diverifikasi.
                        </p>
                        <button className="btn btn-primary" onClick={onClose}>Tutup</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="badge badge-amber" style={{ alignSelf: 'flex-start' }}>
                                <Info size={12} /> Posko: 16 - 29 Maret 2026
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nama Anggota *</label>
                                <input className="form-input" placeholder="Nama lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Nomor Keanggotaan *</label>
                                    <input className="form-input" placeholder="VT-XXXX-XXX" value={form.no_anggota} onChange={e => setForm({ ...form, no_anggota: e.target.value })} required />
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>*jika lupa bisa konfirmasi ke pengurus</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tahun Masuk *</label>
                                    <input className="form-input" type="number" min="2018" max="2026" placeholder="2024" value={form.tahun_masuk} onChange={e => setForm({ ...form, tahun_masuk: e.target.value })} required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Domisili</label>
                                    <input className="form-input" placeholder="Kota domisili" value={form.domisili} onChange={e => setForm({ ...form, domisili: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stasiun Pilihan *</label>
                                    <select className="form-select" value={form.station} onChange={e => setForm({ ...form, station: e.target.value, selectedDates: {} })}>
                                        <option value="BD">Bandung</option>
                                        <option value="KAC">Kiaracondong</option>
                                    </select>
                                </div>
                            </div>

                            <div className="divider" />
                            <h4><Calendar size={16} style={{ display: 'inline', marginRight: 6 }} /> Pilih Tanggal & Sesi Komitmen</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, maxHeight: 280, overflowY: 'auto', padding: 4 }}>
                                {availableDates.map(date => {
                                    const isSelected = !!form.selectedDates[date];
                                    return (
                                        <div key={date} style={{ background: isSelected ? 'rgba(59,130,246,0.1)' : 'var(--navy-700)', border: `1px solid ${isSelected ? 'var(--blue-500)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius-md)', padding: '8px 12px', cursor: 'pointer', transition: 'all 0.15s' }}>
                                            <label className="form-checkbox" style={{ marginBottom: 4 }}>
                                                <input type="checkbox" checked={isSelected} onChange={() => toggleDate(date)} />
                                                <span className="text-sm font-medium">{formatDate(date)}</span>
                                            </label>
                                            {isSelected && (
                                                <select className="form-select" style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: 4 }} value={form.selectedDates[date]} onChange={e => setSession(date, e.target.value)}>
                                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={!form.nama || !form.no_anggota || !form.tahun_masuk || Object.keys(form.selectedDates).length === 0}>
                                <UserPlus size={16} /> Kirim Pendaftaran
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
