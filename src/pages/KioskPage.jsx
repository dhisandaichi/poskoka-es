import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, LogOut, Users, ArrowLeft, Search, X, MapPin } from 'lucide-react';
import { sampleVolunteers, stationInfo, formatMinutesToHM } from '../data/staticData';

const IDLE_TIMEOUT = 30000; // 30 seconds before reset

export default function KioskPage() {
    const [station, setStation] = useState('BD');
    const [step, setStep] = useState('search'); // search, confirm, success
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [action, setAction] = useState('checkin'); // checkin or checkout
    const [now, setNow] = useState(new Date());
    const idleTimer = useRef(null);

    // Kiosk-local attendance records (no DB)
    const [kioskAttendance, setKioskAttendance] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-reset after idle
    const resetIdle = () => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            resetKiosk();
        }, IDLE_TIMEOUT);
    };

    useEffect(() => {
        resetIdle();
        return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
    }, [step, searchQuery]);

    const resetKiosk = () => {
        setStep('search');
        setSearchQuery('');
        setSelectedVolunteer(null);
    };

    const verifiedVolunteers = sampleVolunteers.filter(v => v.status === 'verified' && v.station === station);

    const filteredVols = searchQuery.length >= 2
        ? verifiedVolunteers.filter(v =>
            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.no_anggota.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const getVolunteerAttendance = (volId) => {
        return kioskAttendance.find(a => a.volunteerId === volId && !a.checkOut);
    };

    const handleSelectVolunteer = (vol) => {
        setSelectedVolunteer(vol);
        const existing = getVolunteerAttendance(vol.id);
        setAction(existing ? 'checkout' : 'checkin');
        setStep('confirm');
        resetIdle();
    };

    const handleConfirm = () => {
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (action === 'checkin') {
            setKioskAttendance(prev => [...prev, {
                id: `kiosk-${Date.now()}`,
                volunteerId: selectedVolunteer.id,
                date: now.toISOString().split('T')[0],
                station: station,
                checkIn: timeStr,
                checkOut: null,
                method: 'kiosk',
                status: 'hadir'
            }]);
        } else {
            setKioskAttendance(prev => prev.map(a =>
                a.volunteerId === selectedVolunteer.id && !a.checkOut
                    ? { ...a, checkOut: timeStr }
                    : a
            ));
        }
        setStep('success');
        resetIdle();
    };

    // Calculate duration for check-out
    const getDuration = () => {
        const existing = getVolunteerAttendance(selectedVolunteer?.id);
        if (!existing) return null;
        const [inH, inM] = existing.checkIn.split(':').map(Number);
        const outH = now.getHours(), outM = now.getMinutes();
        const totalMin = (outH * 60 + outM) - (inH * 60 + inM);
        return totalMin > 0 ? formatMinutesToHM(totalMin) : '-';
    };

    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--navy-900) 0%, #0a1628 50%, var(--navy-900) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative'
        }}>
            {/* Back button */}
            <Link to="/admin" style={{
                position: 'absolute', top: 20, left: 20,
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6,
                textDecoration: 'none', fontSize: '0.9rem'
            }}>
                <ArrowLeft size={18} /> Kembali ke Dashboard
            </Link>

            {/* Station Selector */}
            <div style={{
                position: 'absolute', top: 20, right: 20,
                display: 'flex', gap: 8
            }}>
                {['BD', 'KAC'].map(s => (
                    <button key={s}
                        className={`btn ${station === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => { setStation(s); resetKiosk(); }}
                    >
                        <MapPin size={14} /> {stationInfo[s].shortName}
                    </button>
                ))}
            </div>

            {/* Kiosk Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                    <Shield size={32} style={{ color: 'var(--blue-400)' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
                        KIOSK <span className="text-gradient">CHECK-IN</span>
                    </h1>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--cyan-400)', letterSpacing: 2 }}>
                    {timeStr}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                    {dateStr} · {stationInfo[station].name}
                </div>
            </div>

            {/* Main Kiosk Card */}
            <div style={{
                width: '100%', maxWidth: 520,
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                backdropFilter: 'blur(20px)'
            }}>
                {/* STEP: SEARCH */}
                {step === 'search' && (
                    <div>
                        <h3 style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Search size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                            Cari Nama atau No. Anggota
                        </h3>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ketik nama atau nomor keanggotaan..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); resetIdle(); }}
                                autoFocus
                                style={{ fontSize: '1.1rem', padding: '14px 16px', paddingRight: 40 }}
                            />
                            {searchQuery && (
                                <button className="btn-icon" onClick={() => setSearchQuery('')}
                                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {searchQuery.length >= 2 && (
                            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                {filteredVols.length > 0 ? filteredVols.map(v => {
                                    const existing = getVolunteerAttendance(v.id);
                                    return (
                                        <div key={v.id}
                                            onClick={() => handleSelectVolunteer(v)}
                                            style={{
                                                padding: '14px 16px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: 'var(--radius-md)',
                                                marginBottom: 8,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--blue-400)'}
                                            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                                        >
                                            <div className="avatar">{v.name.charAt(0)}</div>
                                            <div style={{ flex: 1 }}>
                                                <div className="font-semibold">{v.name}</div>
                                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.no_anggota}</div>
                                            </div>
                                            {existing ? (
                                                <span className="badge badge-green">Sudah Check-In ({existing.checkIn})</span>
                                            ) : (
                                                <span className="badge badge-blue">Belum Check-In</span>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <div className="text-sm text-center" style={{ color: 'var(--text-muted)', padding: 24 }}>
                                        Tidak ditemukan relawan dengan "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}

                        {searchQuery.length > 0 && searchQuery.length < 2 && (
                            <div className="text-sm text-center" style={{ color: 'var(--text-muted)', padding: 16 }}>
                                Ketik minimal 2 karakter untuk mencari...
                            </div>
                        )}

                        {/* Recent kiosk activity */}
                        {kioskAttendance.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <div className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={14} /> Aktivitas Kiosk Hari Ini ({kioskAttendance.length})
                                </div>
                                {kioskAttendance.slice(-5).reverse().map(a => {
                                    const vol = sampleVolunteers.find(v => v.id === a.volunteerId);
                                    return (
                                        <div key={a.id} className="text-xs" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{vol?.name}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>
                                                In: {a.checkIn} {a.checkOut ? `· Out: ${a.checkOut}` : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP: CONFIRM */}
                {step === 'confirm' && selectedVolunteer && (
                    <div style={{ textAlign: 'center' }}>
                        <div className="avatar avatar-lg" style={{ margin: '0 auto 16px', fontSize: '2rem' }}>
                            {selectedVolunteer.name.charAt(0)}
                        </div>
                        <h2 style={{ marginBottom: 4 }}>{selectedVolunteer.name}</h2>
                        <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                            {selectedVolunteer.no_anggota} · {stationInfo[station].shortName}
                        </p>

                        <div style={{
                            background: action === 'checkin' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${action === 'checkin' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: 20,
                            marginBottom: 24
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
                                {action === 'checkin' ? '✅ CHECK-IN' : '🚪 CHECK-OUT'}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: action === 'checkin' ? 'var(--emerald-400)' : 'var(--red-400)' }}>
                                {timeStr.slice(0, 5)}
                            </div>
                            {action === 'checkout' && getDuration() && (
                                <div className="text-sm" style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                                    Durasi bertugas: <strong>{getDuration()}</strong>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-secondary" onClick={resetKiosk} style={{ flex: 1, padding: 14 }}>
                                Batal
                            </button>
                            <button
                                className={`btn ${action === 'checkin' ? 'btn-success' : 'btn-danger'}`}
                                onClick={handleConfirm}
                                style={{ flex: 2, padding: 14, fontSize: '1.1rem' }}
                            >
                                {action === 'checkin' ? <><CheckCircle size={20} /> Konfirmasi Check-In</> : <><LogOut size={20} /> Konfirmasi Check-Out</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP: SUCCESS */}
                {step === 'success' && selectedVolunteer && (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: action === 'checkin' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'scaleIn 0.3s ease'
                        }}>
                            {action === 'checkin'
                                ? <CheckCircle size={40} style={{ color: 'var(--emerald-400)' }} />
                                : <LogOut size={40} style={{ color: 'var(--red-400)' }} />
                            }
                        </div>
                        <h2 style={{ marginBottom: 8 }}>
                            {action === 'checkin' ? 'Check-In Berhasil!' : 'Check-Out Berhasil!'}
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                            {selectedVolunteer.name} · {timeStr.slice(0, 5)}
                        </p>
                        {action === 'checkout' && getDuration() && (
                            <p style={{ color: 'var(--cyan-400)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                                Total bertugas: {getDuration()}
                            </p>
                        )}
                        <p className="text-xs" style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                            Terima kasih atas layanannya! Layar akan kembali dalam beberapa detik.
                        </p>
                        <button className="btn btn-primary" onClick={resetKiosk} style={{ padding: '12px 32px' }}>
                            Selesai
                        </button>
                    </div>
                )}
            </div>

            {/* Kiosk footer */}
            <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>
                <Shield size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Mode Kiosk · Data disimpan lokal (belum terhubung database)
            </div>
        </div>
    );
}
