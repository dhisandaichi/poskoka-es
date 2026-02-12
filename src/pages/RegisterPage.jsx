import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { User, Shield, MapPin, Calendar, Hash, Eye, EyeOff, Loader, LogIn } from 'lucide-react';
import WilayahSelector from '../components/WilayahSelector';
import Swal from 'sweetalert2';
import { checkRateLimit } from '../utils/rateLimiter';

export default function RegisterPage() {
    const { addToast } = useApp();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Registration State
    const [name, setName] = useState('');
    const [noAnggota, setNoAnggota] = useState('');
    const [station, setStation] = useState('BD');
    // const [date, setDate] = useState(''); // Removed single date
    // const [session, setSession] = useState('pagi'); // Removed single session
    const [selectedSessions, setSelectedSessions] = useState([]);
    const [isFlexible, setIsFlexible] = useState(false);
    const [domisiliData, setDomisiliData] = useState(null);

    const handleSessionToggle = (dateStr, sessId) => {
        const id = `${dateStr}_${sessId}`;
        setSelectedSessions(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    // Available dates logic: 16 - 29 Maret 2026
    const getDates = () => {
        const dates = [];
        const start = new Date('2026-03-16');
        const end = new Date('2026-03-29');

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };
    const availableDates = getDates();

    const handleRegister = async (e) => {
        e.preventDefault();

        // Rate Limiting Check: 3 attempts per minute for registration
        const isAllowed = checkRateLimit('register_attempt', 3, 60000);
        if (!isAllowed) {
            Swal.fire({
                title: 'Terlalu Banyak Percobaan',
                text: 'Silakan coba lagi dalam beberapa saat.',
                icon: 'warning',
                timer: 3000
            });
            return;
        }

        setLoading(true);

        try {
            if (!domisiliData) {
                throw new Error("Mohon lengkapi data domisili.");
            }

            if (selectedSessions.length < 9) {
                throw new Error("Mohon pilih minimal 9 sesi jadwal piket.");
            }

            // SIGN UP
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        no_anggota: noAnggota,
                        station: station, // BD or KAC
                        domisili: domisiliData.fullAddress, // Simplified string
                        domisili_details: domisiliData, // Full object
                        selected_shifts: selectedSessions, // Array of strings
                        is_flexible: isFlexible
                    }
                }
            });

            if (error) throw error;

            await Swal.fire({
                title: 'Registrasi Berhasil!',
                text: 'Silakan cek email untuk verifikasi atau login langsung.',
                icon: 'success',
                timer: 3000
            });

            navigate('/login');

        } catch (error) {
            Swal.fire({
                title: 'Gagal Mendaftar',
                text: error.message,
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-hero)', padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 500 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', marginBottom: 16 }}>
                        <img src="/logo_es.png" alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                    </div>
                    <h1>Daftar Akun</h1>
                    <p className="text-secondary">Bergabung sebagai Relawan Posko</p>
                </div>

                <div className="card animate-fade-in-up" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        <div>
                            <label className="form-label">Nama Lengkap</label>
                            <div className="input-group">
                                <User size={18} style={{ color: 'var(--text-muted)' }} />
                                <input type="text" className="form-input" placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Nomor Keanggotaan</label>
                            <div className="input-group">
                                <Hash size={18} style={{ color: 'var(--text-muted)' }} />
                                <input type="text" className="form-input" placeholder="VT-XXXX-XXX" value={noAnggota} onChange={(e) => setNoAnggota(e.target.value)} required />
                            </div>
                        </div>

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

                        {/* Station Selection */}
                        <div>
                            <label className="form-label">Stasiun Pilihan</label>
                            <div className="input-group">
                                <MapPin size={18} style={{ color: 'var(--text-muted)' }} />
                                <select className="form-select" value={station} onChange={e => {
                                    setStation(e.target.value);
                                    setSelectedSessions([]); // Reset selection on station change
                                }}>
                                    <option value="BD">Bandung</option>
                                    <option value="KAC">Kiaracondong</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Domisili (Sesuai KTP/Tinggal)</label>
                            <WilayahSelector onSelect={setDomisiliData} />
                        </div>

                        <div className="divider" />

                        {/* Session Selection Grid */}
                        <div>
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Pilih Jadwal Piket (Min. 9 Sesi)</span>
                                <span className={`badge ${selectedSessions.length >= 9 ? 'badge-green' : 'badge-red'}`}>
                                    {selectedSessions.length} / 9 Terpilih
                                </span>
                            </label>

                            <div className="card" style={{ padding: 12, maxHeight: 300, overflowY: 'auto', background: 'var(--surface-base)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-base)', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: 8 }}>Tanggal</th>
                                            <th style={{ textAlign: 'center', padding: 8 }}>Pagi</th>
                                            <th style={{ textAlign: 'center', padding: 8 }}>{station === 'BD' ? 'Siang' : 'Sore'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availableDates.map((dateStr) => {
                                            const dateObj = new Date(dateStr);
                                            const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                                            const session2 = station === 'BD' ? 'siang' : 'sore';

                                            return (
                                                <tr key={dateStr} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <td style={{ padding: 8 }}>{dayName}</td>
                                                    <td style={{ textAlign: 'center', padding: 8 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSessions.includes(`${dateStr}_pagi`)}
                                                            onChange={() => handleSessionToggle(dateStr, 'pagi')}
                                                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: 8 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSessions.includes(`${dateStr}_${session2}`)}
                                                            onChange={() => handleSessionToggle(dateStr, session2)}
                                                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {selectedSessions.length < 9 && (
                                <p className="text-xs" style={{ color: 'var(--red-400)', marginTop: 4 }}>
                                    * Wajib memilih minimal 9 sesi dari 14 hari yang tersedia.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-sm">
                            <input type="checkbox" id="flexCheck" checked={isFlexible} onChange={e => setIsFlexible(e.target.checked)} style={{ width: 18, height: 18 }} />
                            <label htmlFor="flexCheck" className="text-sm cursor-pointer select-none">Saya fleksibel dengan jadwal lain jika penuh</label>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <Loader size={16} className="spin" /> : null}
                            {loading ? ' Memproses...' : ' Daftar Sekarang'}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Sudah punya akun?
                            <Link to="/login" style={{ color: 'var(--blue-400)', fontWeight: 600, textDecoration: 'none', marginLeft: 4 }}>
                                Login di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
