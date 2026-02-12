import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Train, Users, Clock, Shield, ChevronRight, MapPin, Calendar, ArrowRight, Activity, FileText, UserPlus } from 'lucide-react';
import TrainBoard from '../components/TrainBoard';
import LiveClock from '../components/LiveClock';
import { aggregateStats, stationInfo } from '../data/staticData';
import RegistrationForm from '../components/RegistrationForm';
import BKOForm from '../components/BKOForm';

export default function LandingPage() {
    const [activeStation, setActiveStation] = useState('BD');
    const [showRegForm, setShowRegForm] = useState(false);
    const [showBKOForm, setShowBKOForm] = useState(false);

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <img src="/logo_es.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        <span>VOLUN<span className="text-gradient">TRAIN</span></span>
                    </Link>
                    <div className="navbar-links">
                        <a href="#about" className="navbar-link">Tentang</a>
                        <a href="#schedule" className="navbar-link">Jadwal KA</a>
                        <a href="#stats" className="navbar-link">Statistik</a>
                        <button className="btn btn-outline btn-sm" onClick={() => setShowRegForm(true)}>
                            <UserPlus size={14} /> Daftar Relawan
                        </button>
                        <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero" style={{ paddingTop: 100 }}>
                <div className="container" style={{ width: '100%' }}>
                    <div className="hero-content" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
                        <div className="animate-fade-in-up">
                            <div className="badge badge-cyan" style={{ marginBottom: 16 }}>
                                <Activity size={12} /> Sistem Manajemen Relawan Terpadu
                            </div>
                            <h1 style={{ marginBottom: 16, fontSize: '3rem' }}>
                                Jadikan Stasiun Lebih <span className="text-gradient">Aman & Nyaman</span>
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
                                VOLUNTRAIN mengelola jadwal, absensi, dan koordinasi relawan di Stasiun Bandung & Kiaracondong secara digital — menggantikan proses manual yang rawan kesalahan.
                            </p>
                            <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
                                <button className="btn btn-primary btn-lg" onClick={() => setShowRegForm(true)}>
                                    <UserPlus size={18} /> Daftar Jadi Relawan
                                </button>
                                <button className="btn btn-secondary btn-lg" onClick={() => setShowBKOForm(true)}>
                                    <FileText size={18} /> Form BKO
                                </button>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Login <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                        <div style={{ marginTop: 48 }}>
                            <LiveClock />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section id="stats" className="section" style={{ background: 'var(--navy-800)', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="container">
                    <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div className="stat-card">
                            <Users size={24} style={{ color: 'var(--blue-400)' }} />
                            <div className="stat-number">{aggregateStats.totalVolunteers}</div>
                            <div className="stat-label">Total Relawan Terdaftar</div>
                        </div>
                        <div className="stat-card">
                            <Activity size={24} style={{ color: 'var(--emerald-400)' }} />
                            <div className="stat-number">{aggregateStats.activeToday}</div>
                            <div className="stat-label">Relawan Bertugas Hari Ini</div>
                        </div>
                        {/* Removed Total Sessions as per request */}
                        <div className="stat-card">
                            <MapPin size={24} style={{ color: 'var(--amber-400)' }} />
                            <div className="stat-number">2</div>
                            <div className="stat-label">Stasiun Operasi</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Train Schedule */}
            <section id="schedule" className="section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>🚆 Jadwal Kereta Terdekat</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Data GAPEKA statis — 3 kereta terdekat di setiap stasiun</p>
                    </div>
                    <div className="tabs" style={{ maxWidth: 400, margin: '0 auto 24px' }}>
                        <button className={`tab ${activeStation === 'BD' ? 'active' : ''}`} onClick={() => setActiveStation('BD')}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Bandung
                        </button>
                        <button className={`tab ${activeStation === 'KAC' ? 'active' : ''}`} onClick={() => setActiveStation('KAC')}>
                            <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} /> Kiaracondong
                        </button>
                    </div>
                    <TrainBoard stationCode={activeStation} maxItems={6} />
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/track-view" className="btn btn-outline btn-lg">
                            🛤️ Tampilan Per Jalur <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* About */}
            <section id="about" className="section" style={{ background: 'var(--navy-800)' }}>
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Mengapa VOLUNTRAIN?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Transformasi dari proses manual ke sistem digital terpadu</p>
                    </div>
                    <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        {[
                            { icon: <Users size={28} />, title: 'Penjadwalan Otomatis', desc: 'Algoritma rule-based menggantikan "siapa cepat dia dapat" di grup WA dengan alokasi slot yang adil.' },
                            { icon: <MapPin size={28} />, title: 'Absensi GPS Geofencing', desc: 'Check-in digital dalam radius 250m stasiun. Tidak bisa lagi titip absen — timestamp server yang sah.' },
                            { icon: <Train size={28} />, title: 'Widget Next Train', desc: 'Hitung mundur kereta berikutnya langsung di HP. Alert H-15 menit untuk siaga di peron.' },
                            { icon: <Shield size={28} />, title: 'Laporan Digital', desc: 'Form laporan terstruktur menggantikan foto di grup WA yang memenuhi memori HP.' },
                            { icon: <Calendar size={28} />, title: 'Rotasi Adil', desc: 'Maksimal 3 hari berturut-turut. Shift balancing otomatis untuk kesejahteraan relawan.' },
                            { icon: <Activity size={28} />, title: 'Monitoring Real-time', desc: 'Dashboard admin melihat sebaran relawan, status kehadiran, dan alert kuota kritis per stasiun.' },
                        ].map((item, i) => (
                            <div key={i} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ color: 'var(--blue-400)', marginBottom: 12 }}>{item.icon}</div>
                                <h4 style={{ marginBottom: 8 }}>{item.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Station Info */}
            <section className="section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>🏢 Profil Stasiun</h2>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
                        {Object.values(stationInfo).map(st => (
                            <div key={st.code} className="card">
                                <div className="flex items-center gap-sm" style={{ marginBottom: 16 }}>
                                    <MapPin size={20} style={{ color: 'var(--blue-400)' }} />
                                    <h3>{st.name}</h3>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Waktu Shift:</p>
                                    {st.sessions.map(s => (
                                        <div key={s.id} className="badge badge-blue" style={{ marginRight: 8, marginBottom: 4 }}>
                                            {s.label}: {s.start} - {s.end} WIB
                                        </div>
                                    ))}
                                </div>
                                <div className="table-container" style={{ marginBottom: 12 }}>
                                    <table>
                                        <thead><tr><th>Titik Jaga</th><th>Personel</th><th>Sifat</th></tr></thead>
                                        <tbody>
                                            {st.guardPosts.map(gp => (
                                                <tr key={gp.id}>
                                                    <td>{gp.name}</td>
                                                    <td>{gp.min} - {gp.max} orang</td>
                                                    <td><span className={`badge ${gp.type === 'fixed' ? 'badge-amber' : 'badge-cyan'}`}>{gp.type === 'fixed' ? 'Tetap' : 'Fleksibel'}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    <span>Total per sesi: <strong style={{ color: 'var(--text-primary)' }}>{st.minPersonnel} - {st.maxPersonnel} orang</strong></span>
                                    <span>Pintu Masuk: Utara / Selatan</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: 'var(--navy-800)', borderTop: '1px solid var(--border-subtle)', padding: '32px 0' }}>
                <div className="container text-center">
                    <div className="flex items-center justify-center gap-sm" style={{ marginBottom: 12 }}>
                        <img src="/logo_es.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        <span className="font-semibold">VOLUNTRAIN</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                        Sistem Manajemen Relawan Terpadu — Daerah Operasi 2 Bandung
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        &copy; 2026 VOLUNTRAIN. Program relawan ini merupakan kegiatan sosial non-komersial.
                    </p>
                </div>
            </footer>

            {/* Registration Modal */}
            {showRegForm && <RegistrationForm onClose={() => setShowRegForm(false)} />}
            {showBKOForm && <BKOForm onClose={() => setShowBKOForm(false)} />}
        </div>
    );
}
