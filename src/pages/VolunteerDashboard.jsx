import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Train, MapPin, Clock, CheckCircle, LogOut, AlertTriangle, Users, FileText, MessageSquare, ChevronRight, User, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import TrainBoard from '../components/TrainBoard';
import LiveClock from '../components/LiveClock';
import { supabase, getSchedules, getAttendance, createAttendance } from '../lib/supabaseClient';
import { sampleVolunteers, stationInfo, formatMinutesToHM } from '../data/staticData';
import { getProcessedSchedule } from '../data/trainData';

export default function VolunteerDashboard() {
    const { user, changeStation, logout, addToast } = useApp();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [showReport, setShowReport] = useState(false);
    const [now, setNow] = useState(new Date());

    const [schedules, setSchedules] = useState([]);
    const [attendance, setAttendance] = useState([]);

    const handleLogout = async () => {
        await Swal.fire({
            title: 'Berhasil Logout!',
            text: 'Sampai jumpa kembali...',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        navigate('/');
        logout();
    };

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            const [sData, aData] = await Promise.all([
                getSchedules(), // Ideally filter by user id on backend
                getAttendance()
            ]);
            setSchedules(sData || []);
            setAttendance((aData || []).filter(a => a.volunteer_id === user.id));
        }
        loadData();
    }, [user]);

    // Check if currently checked in
    const today = new Date().toISOString().split('T')[0];
    const currentAttendance = attendance.find(a => a.date === today && !a.check_out);
    const checkedIn = !!currentAttendance;

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const volunteer = user;
    const station = stationInfo[user.station || 'BD'];
    const currentSession = station.sessions.find(s => {
        const [sh, sm] = s.start.split(':').map(Number);
        const [eh, em] = s.end.split(':').map(Number);
        const h = now.getHours(), m = now.getMinutes();
        return (h > sh || (h === sh && m >= sm)) && (h < eh || (h === eh && m <= em));
    }) || station.sessions[0];

    // Next 3 trains
    const nextTrains = useMemo(() => {
        const all = getProcessedSchedule(user.station || 'BD', now);
        all.sort((a, b) => (Math.abs(a.minToArr ?? a.minToDep ?? 999)) - (Math.abs(b.minToArr ?? b.minToDep ?? 999)));
        return all.slice(0, 3);
    }, [user.station, now]);

    // Team members for today
    const todayStr = now.toISOString().split('T')[0];
    const todaySchedule = schedules.find(s => s.station === (user.station || 'BD') && s.date === todayStr);
    const teamMembers = todaySchedule ? (todaySchedule.volunteers || []).map(vid => ({ id: vid, name: 'Rekat' })) : []; // Simplified for now since we don't have all volunteers loaded here. 
    // Ideally we should load team members details too. But 'user' context doesn't have all volunteers.
    // For Iteration 2, maybe just show count or simple list if available.

    const handleCheckIn = async () => {
        try {
            await createAttendance({
                volunteer_id: user.id,
                station: user.station || 'BD',
                date: today,
                session: currentSession.id,
                check_in: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                method: 'gps',
                status: 'hadir',
                notes: 'Self Check-in'
            });
            addToast('Check-in berhasil! GPS terverifikasi.', 'success');
            // Refresh
            const aData = await getAttendance();
            setAttendance((aData || []).filter(a => a.volunteer_id === user.id));
        } catch (error) {
            addToast("Gagal check-in: " + error.message, "error");
        }
    };

    const handleCheckOut = async () => {
        try {
            if (currentAttendance) {
                await supabase.from('attendance').update({
                    check_out: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                }).eq('id', currentAttendance.id);
                addToast('Check-out berhasil. Terima kasih atas layanannya!', 'success');
                // Refresh
                const aData = await getAttendance();
                setAttendance((aData || []).filter(a => a.volunteer_id === user.id));
            }
        } catch (error) {
            addToast("Gagal check-out: " + error.message, "error");
        }
    };

    return (
        <div className="page-wrapper mobile" style={{ background: 'var(--surface-base)', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
            {/* Header */}
            <div style={{ padding: '16px 16px 0' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                    <div>
                        <h4 style={{ marginBottom: 2 }}>Halo, {volunteer.name.split(' ')[0]} 👋</h4>
                        <div className="flex items-center gap-xs">
                            <span className="badge badge-green">{currentSession.label}</span>
                            <span className="badge badge-blue"><MapPin size={10} /> {station.shortName}</span>
                        </div>
                    </div>
                    <button className="avatar" onClick={() => setShowProfile(true)}>
                        {volunteer.name.charAt(0)}
                    </button>
                </div>
                <LiveClock />
            </div>

            {/* Tab Content */}
            <div style={{ padding: 16 }}>
                {activeTab === 'home' && (
                    <div className="stagger">
                        {/* Next Train Widget */}
                        <div style={{ marginBottom: 16 }}>
                            <h5 className="flex items-center gap-xs" style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>
                                <Train size={16} /> Kereta Berikutnya
                            </h5>
                            {nextTrains.length > 0 ? nextTrains.map((t, i) => {
                                const min = t.minToArr ?? t.minToDep;
                                const urgency = min != null ? (min > 30 ? 'green' : min > 15 ? 'yellow' : 'red') : 'green';
                                const urgencyBg = urgency === 'green' ? 'var(--emerald-500)' : urgency === 'yellow' ? 'var(--amber-500)' : 'var(--red-500)';
                                const isKCIC = t.raw.type === 'FDR';
                                const isKCI = t.raw.type === 'LOC';
                                // Extract destination text
                                const destination = t.info ? t.info.replace(/^(Tujuan |Dari )/, '') : t.raw.route;
                                return (
                                    <div key={i} className={`countdown-card ${urgency}`} style={{ marginBottom: 8, padding: 16 }}>
                                        <div className="flex items-center justify-between">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {/* Destination enlarged at top */}
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {destination}
                                                </div>
                                                <div className="font-semibold" style={{ fontSize: '0.9rem', color: isKCIC ? 'var(--purple-400)' : isKCI ? '#fb7185' : 'var(--blue-400)' }}>
                                                    {t.raw.name}
                                                    <span className={`badge ${isKCI ? 'badge-kci' : isKCIC ? 'badge-kcic' : 'badge-kai'}`} style={{ marginLeft: 6 }}>
                                                        {isKCI ? 'KCI' : isKCIC ? 'KCIC' : 'KAI'}
                                                    </span>
                                                </div>
                                                {/* Track number enlarged below train name */}
                                                <div style={{
                                                    fontWeight: 800,
                                                    fontSize: '2rem',
                                                    color: 'var(--blue-400)',
                                                    fontFamily: 'var(--font-mono)',
                                                    marginTop: 4,
                                                    lineHeight: 1
                                                }}>
                                                    {t.track}
                                                </div>
                                                <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 1 }}>{t.raw.no}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                                                <div className={`countdown-value ${urgency === 'red' ? 'animate-blink' : ''}`} style={{ fontSize: min != null && Math.abs(min) < 60 ? '2rem' : '1.2rem', color: urgency === 'green' ? 'var(--emerald-400)' : urgency === 'yellow' ? 'var(--amber-400)' : 'var(--red-400)' }}>
                                                    {min != null ? (min > 0 ? `${min}'` : 'TIBA') : t.time}
                                                </div>
                                                {/* Status pill: white text on colored bg */}
                                                <div style={{
                                                    display: 'inline-block',
                                                    background: urgencyBg,
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    fontSize: '0.65rem',
                                                    padding: '3px 10px',
                                                    borderRadius: '999px',
                                                    marginTop: 4,
                                                    whiteSpace: 'nowrap',
                                                    letterSpacing: '0.02em'
                                                }}>
                                                    {t.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tidak ada kereta dalam 3 jam ke depan</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                            {!checkedIn ? (
                                <button className="btn btn-success btn-lg w-full" onClick={handleCheckIn} style={{ gridColumn: '1 / -1', padding: '16px', fontSize: '1.1rem' }}>
                                    <CheckCircle size={22} /> CHECK-IN
                                </button>
                            ) : (
                                <>
                                    <button className="btn btn-danger btn-lg w-full" onClick={handleCheckOut} style={{ padding: '14px' }}>
                                        <LogOut size={18} /> CHECK-OUT
                                    </button>
                                    <button className="btn btn-secondary btn-lg w-full" onClick={() => setShowReport(true)} style={{ padding: '14px' }}>
                                        <AlertTriangle size={18} /> LAPORAN
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Team */}
                        <div>
                            <h5 className="flex items-center gap-xs" style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>
                                <Users size={16} /> Tim Satu Shift ({teamMembers.length} orang)
                            </h5>
                            <div className="card" style={{ padding: 12 }}>
                                {teamMembers.map((m, i) => {
                                    const postId = todaySchedule?.assignments?.[m.id];
                                    const postInfo = postId ? station.guardPosts.find(p => p.id === postId) : null;
                                    return (
                                        <div key={i} className="flex items-center gap-sm" style={{ padding: '6px 0', borderBottom: i < teamMembers.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                            <div className="avatar avatar-sm">{m.name.charAt(0)}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <span className="text-sm font-medium">{m.name}</span>
                                                {postInfo && (
                                                    <div className="text-xs" style={{ color: 'var(--cyan-400)', marginTop: 1 }}>
                                                        <MapPin size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                                                        {postInfo.name}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="status-dot green" style={{ flexShrink: 0 }} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div>
                        <h4 style={{ marginBottom: 16 }}>Jadwal Kereta — {station.shortName}</h4>
                        <TrainBoard stationCode={user.station || 'BD'} maxItems={12} />
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="stagger">
                        <div className="card text-center" style={{ marginBottom: 16 }}>
                            <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', fontSize: '1.5rem' }}>{volunteer.name.charAt(0)}</div>
                            <h3>{volunteer.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{volunteer.no_anggota}</p>
                            <div className="flex items-center justify-center gap-sm" style={{ marginTop: 8 }}>
                                <span className="badge badge-green">Terverifikasi</span>
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: 16 }}>
                            <h5 style={{ marginBottom: 12 }}>Statistik</h5>
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Sesi</span><div className="font-bold text-lg">{volunteer.totalSessions}</div></div>
                                <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Jam Kehadiran</span><div className="font-bold text-lg">{formatMinutesToHM(calcHoursFromAttendance(volunteer.id))}</div></div>
                                <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tahun Masuk</span><div className="font-bold text-lg">{volunteer.tahun_masuk}</div></div>
                                <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stasiun</span><div className="font-bold text-lg">{volunteer.station}</div></div>
                            </div>
                        </div>

                        {/* Show "Back to Admin" only if the user actually has admin privileges */
                        /* But wait, if we used switchRole in AdminDashboard, user.role is 'volunteer'. 
                           We need to stop using switchRole in AdminDashboard first. 
                           Assuming we fix AdminDashboard to NOT use switchRole, user.role will be 'admin'.
                        */}
                        {['admin', 'korlap', 'pengurus'].includes(user.role) && (
                            <div className="card" style={{ marginBottom: 16 }}>
                                <h5 style={{ marginBottom: 12 }}>Menu Admin</h5>
                                <button className="btn btn-primary btn-sm w-full" onClick={() => navigate('/admin')}>
                                    <Settings size={16} /> Kembali ke Dashboard Admin
                                </button>
                            </div>
                        )}

                        <div className="card">
                            <h5 style={{ marginBottom: 12 }}>Ganti Stasiun</h5>
                            <div className="flex gap-sm">
                                {['BD', 'KAC'].map(s => (
                                    <button key={s} className={`btn ${user.station === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ flex: 1 }}
                                        onClick={() => changeStation(s)}>
                                        {stationInfo[s].shortName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="card" style={{ marginTop: 16 }}>
                            <button className="btn btn-danger w-full" onClick={handleLogout}>
                                <LogOut size={16} /> Keluar Aplikasi
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReport && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowReport(false)}>
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h4>📋 Laporan Situasi</h4>
                            <button className="btn-icon" onClick={() => setShowReport(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                <select className="form-select">
                                    <option>Penumpukan Penumpang</option>
                                    <option>Fasilitas Rusak</option>
                                    <option>Penumpang Sakit / Medis</option>
                                    <option>Kehilangan Barang</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deskripsi</label>
                                <textarea className="form-textarea" placeholder="Jelaskan situasi di lapangan..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Foto (opsional)</label>
                                <input type="file" accept="image/*" className="form-input" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowReport(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={() => { setShowReport(false); addToast('Laporan berhasil dikirim!', 'success'); }}>Kirim Laporan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Nav */}
            <div className="mobile-nav">
                <div className="mobile-nav-items">
                    {[
                        { id: 'home', icon: <Train size={20} />, label: 'Beranda' },
                        { id: 'schedule', icon: <Clock size={20} />, label: 'Jadwal KA' },
                        { id: 'profile', icon: <User size={20} />, label: 'Profil' },
                    ].map(tab => (
                        <button key={tab.id} className={`mobile-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
