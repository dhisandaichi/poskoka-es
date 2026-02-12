import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Users, Calendar, ClipboardCheck, MapPin, BarChart3, Settings, LogOut, Shield, AlertTriangle, CheckCircle, XCircle, Train, FileText, Eye, UserPlus, Zap, Menu, X, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import TrainBoard from '../components/TrainBoard';
import LiveClock from '../components/LiveClock';
import ScheduleCalendar from '../components/ScheduleCalendar';
import { supabase, getVolunteers, getSchedules, getAttendance, getRegistrationRequests, getReports, getBKORequests, updateRegistrationStatus, createVolunteer, createAttendance } from '../lib/supabaseClient';
import { stationInfo, calcHoursFromAttendance, formatMinutesToHM } from '../data/staticData';

const TABS = [
    { id: 'overview', icon: <BarChart3 size={18} />, label: 'Overview' },
    { id: 'roster', icon: <Users size={18} />, label: 'Roster' },
    { id: 'schedule', icon: <Calendar size={18} />, label: 'Jadwal' },
    { id: 'attendance', icon: <ClipboardCheck size={18} />, label: 'Absensi' },
    { id: 'registrations', icon: <UserPlus size={18} />, label: 'Pendaftaran' },
    { id: 'reports', icon: <FileText size={18} />, label: 'Laporan' },
    { id: 'trains', icon: <Train size={18} />, label: 'Jadwal KA' },
    { id: 'settings', icon: <Settings size={18} />, label: 'Pengaturan' },
];

export default function AdminDashboard() {
    const { user, logout, addToast } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stationFilter, setStationFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Data State
    const [volunteers, setVolunteers] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [reports, setReports] = useState([]);
    const [bkoRequests, setBkoRequests] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            try {
                const [vData, sData, aData, rData, repData, bkoData] = await Promise.all([
                    getVolunteers(),
                    getSchedules(),
                    getAttendance(),
                    getRegistrationRequests(), // I need to add this to client
                    getReports(),
                    getBKORequests() // I need to add this
                ]);

                setVolunteers(vData || []);
                setSchedules(sData || []);
                setAttendance(aData || []);
                setRegistrations(rData || []);
                setReports(repData || []);
                setBkoRequests(bkoData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                addToast("Gagal memuat data dari database", "error");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Korlap assist check-in/out state
    const [showAssistModal, setShowAssistModal] = useState(false);
    const [assistType, setAssistType] = useState('checkin'); // 'checkin' or 'checkout'
    const [assistVolunteer, setAssistVolunteer] = useState('');
    const [assistTime, setAssistTime] = useState('');

    const isReadOnly = user?.role === 'pengurus';
    const isKorlap = user?.role === 'korlap';
    const isPengurus = user?.role === 'pengurus';
    const isAdmin = user?.role === 'admin';
    const filteredVolunteers = stationFilter === 'all' ? volunteers : volunteers.filter(v => v.station === stationFilter);

    // Calculate active stats from TODAY'S schedule (mock logic adapted)
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = schedules.filter(s => s.date === today);
    const bdActive = todaySchedule.filter(s => s.station === 'BD').reduce((sum, s) => sum + (s.volunteers?.length || 0), 0);
    const kacActive = todaySchedule.filter(s => s.station === 'KAC').reduce((sum, s) => sum + (s.volunteers?.length || 0), 0);

    // Calculated Stats
    const aggregateStats = {
        totalVolunteers: volunteers.length,
        activeToday: bdActive + kacActive,
        stationBreakdown: {
            BD: { total: volunteers.filter(v => v.station === 'BD').length, activeToday: bdActive },
            KAC: { total: volunteers.filter(v => v.station === 'KAC').length, activeToday: kacActive }
        }
    };

    // Role-based permissions
    const canAcceptRegistrations = isPengurus || isAdmin; // Pengurus can accept volunteer registrations
    const canAcceptBKO = isKorlap || isAdmin; // Korlap can accept BKO only
    const canAssistCheckin = isKorlap || isAdmin; // Korlap can assist check-in/out

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setSidebarOpen(false);
    };

    const handleAssistSubmit = async () => {
        if (!assistVolunteer || !assistTime) {
            addToast('Pilih relawan dan waktu', 'warning');
            return;
        }

        try {
            const vol = volunteers.find(v => v.id === assistVolunteer);
            if (!vol) throw new Error("Relawan tidak ditemukan");

            // Format time to HH:MM:00
            const formattedTime = assistTime.length === 5 ? `${assistTime}:00` : assistTime;

            if (assistType === 'checkin') {
                await createAttendance({
                    volunteer_id: vol.id,
                    station: vol.station,
                    date: new Date().toISOString().split('T')[0],
                    session: 'manual', // or determine based on time
                    check_in: formattedTime,
                    method: 'korlap',
                    status: 'hadir',
                    notes: `Bantu check-in oleh ${user.name}`
                });
            } else {
                // Find latest active check-in for this volunteer
                const active = attendance.find(a => a.volunteer_id === vol.id && !a.check_out);
                if (active) {
                    await supabase.from('attendance').update({ check_out: formattedTime }).eq('id', active.id);
                } else {
                    addToast("Relawan belum check-in hari ini", "warning");
                    return;
                }
            }

            addToast(`${assistType === 'checkin' ? 'Check-in' : 'Check-out'} untuk ${vol.name} berhasil dicatat`, 'success');

            // Refresh Data
            const att = await getAttendance();
            setAttendance(att || []);

            setShowAssistModal(false);
            setAssistVolunteer('');
            setAssistTime('');
        } catch (error) {
            console.error(error);
            addToast("Gagal menyimpan absensi: " + error.message, "error");
        }
    };

    const handleAcceptRegistration = async (reg) => {
        try {
            // 1. Create Volunteer Record
            await createVolunteer({
                id: reg.user_id, // If linked to auth
                email: reg.email,
                name: reg.name,
                phone: reg.phone,
                station: reg.station,
                role: 'volunteer',
                status: 'verified',
                tahun_masuk: reg.tahun_masuk,
                domisili: reg.domisili,
                domisili_details: reg.domisili_details,
                no_anggota: reg.no_anggota,
                selected_shifts: reg.selected_shifts,
                is_flexible: reg.is_flexible
            });

            // 2. Update Registration Status
            await updateRegistrationStatus(reg.id, 'approved');

            addToast(`${reg.name} berhasil disetujui`, 'success');

            // Refresh
            const [vData, rData] = await Promise.all([getVolunteers(), getRegistrationRequests()]);
            setVolunteers(vData || []);
            setRegistrations(rData || []);
        } catch (error) {
            console.error(error);
            addToast("Gagal menyetujui: " + error.message, "error");
        }
    };

    const handleRejectRegistration = async (reg) => {
        try {
            await updateRegistrationStatus(reg.id, 'rejected');
            addToast(`${reg.name} ditolak`, 'warning');
            const rData = await getRegistrationRequests();
            setRegistrations(rData || []);
        } catch (error) {
            addToast("Gagal menolak: " + error.message, "error");
        }
    };

    return (
        <div className="admin-layout">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 45, backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="navbar-brand" style={{ fontSize: '1.1rem' }}>
                            <img src="/logo_es.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            <span>VOLUN<span className="text-gradient">TRAIN</span></span>
                        </Link>
                        <button
                            className="btn-icon"
                            onClick={() => setSidebarOpen(false)}
                            style={{ display: 'none', color: 'var(--text-muted)' }}
                            id="sidebar-close-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-xs" style={{ marginTop: 8 }}>
                        <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                        {isReadOnly && <span className="badge badge-amber">Read-Only</span>}
                    </div>
                </div>
                <nav style={{ flex: 1 }}>
                    {TABS.map(t => (
                        <div key={t.id} className={`sidebar-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => handleTabClick(t.id)}>
                            {t.icon} <span>{t.label}</span>
                        </div>
                    ))}
                </nav>
                <div className="divider" style={{ margin: '4px 16px' }} />
                <div className="sidebar-item" onClick={() => navigate('/dashboard')}>
                    <Eye size={18} /> <span>Mode Relawan</span>
                </div>
                <div className="sidebar-item" onClick={handleLogout} style={{ color: 'var(--red-400)' }}>
                    <LogOut size={18} /> <span>Keluar</span>
                </div>
            </aside>

            {/* Content */}
            <main className="admin-content">
                {/* Top Header */}
                <div className="admin-header">
                    <div className="admin-header-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            className="btn btn-secondary btn-icon mobile-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                            style={{ flexShrink: 0 }}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', lineHeight: 1.2 }}>
                                {TABS.find(t => t.id === activeTab)?.label || 'Dashboard'}
                            </h2>
                            <LiveClock />
                        </div>
                    </div>
                    <div className="admin-header-right">
                        <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={stationFilter} onChange={e => setStationFilter(e.target.value)}>
                            <option value="all">Semua Stasiun</option>
                            <option value="BD">Bandung</option>
                            <option value="KAC">Kiaracondong</option>
                        </select>
                        <div className="avatar">{user.name.charAt(0)}</div>
                    </div>
                </div>

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="stagger">
                        {/* Stats Row */}
                        <div className="stats-grid" style={{ marginBottom: 24 }}>
                            <div className="stat-card">
                                <Users size={20} style={{ color: 'var(--blue-400)' }} />
                                <div className="stat-number">{aggregateStats.totalVolunteers}</div>
                                <div className="stat-label">Total Relawan</div>
                            </div>
                            <div className="stat-card">
                                <CheckCircle size={20} style={{ color: 'var(--emerald-400)' }} />
                                <div className="stat-number">{aggregateStats.activeToday}</div>
                                <div className="stat-label">Bertugas Hari Ini</div>
                            </div>
                            <div className="stat-card">
                                <UserPlus size={20} style={{ color: 'var(--amber-400)' }} />
                                <div className="stat-number">{registrations.filter(r => r.status === 'pending').length}</div>
                                <div className="stat-label">Menunggu Verifikasi</div>
                            </div>
                            <div className="stat-card">
                                <AlertTriangle size={20} style={{ color: 'var(--red-400)' }} />
                                <div className="stat-number">{reports.filter(r => r.severity === 'high').length}</div>
                                <div className="stat-label">Laporan Kritis</div>
                            </div>
                        </div>

                        {/* Quota Monitor */}
                        <h4 style={{ marginBottom: 12 }}>📊 Monitoring Kuota Stasiun</h4>
                        <div className="quota-grid" style={{ marginBottom: 24 }}>
                            {[
                                { code: 'BD', name: 'Bandung', current: Math.min(bdActive, 14), min: 11, max: 17 },
                                { code: 'KAC', name: 'Kiaracondong', current: Math.min(kacActive, 8), min: 8, max: 11 },
                            ].map(st => {
                                const pct = (st.current / st.max) * 100;
                                const isCritical = st.current < st.min;
                                return (
                                    <div key={st.code} className="card" style={{ borderColor: isCritical ? 'rgba(239,68,68,0.3)' : undefined }}>
                                        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                                            <h5 style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MapPin size={14} /> {st.name}
                                            </h5>
                                            {isCritical && <span className="badge badge-red animate-blink">KRITIS</span>}
                                        </div>
                                        <div className="flex items-center gap-sm" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isCritical ? 'var(--red-400)' : 'var(--emerald-400)' }}>{st.current}</span>
                                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ {st.max}</span>
                                            <span className={`badge ${isCritical ? 'badge-red' : pct >= 80 ? 'badge-green' : 'badge-amber'}`} style={{ marginLeft: 'auto' }}>
                                                {isCritical ? 'Di bawah minimum' : pct >= 80 ? 'Aman' : 'Perhatian'}
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className={`progress-fill ${isCritical ? 'red' : pct >= 80 ? 'green' : 'yellow'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 4 }}>Min: {st.min} · Max: {st.max}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent Reports */}
                        <h4 style={{ marginBottom: 12 }}>📝 Laporan Terbaru</h4>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {reports.map((r, i) => {
                                const vol = volunteers.find(v => v.id === r.volunteer_id);
                                return (
                                    <div key={r.id} className="report-item">
                                        <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>{vol?.name.charAt(0)}</div>
                                        <div className="report-content" style={{ flex: 1, minWidth: 0 }}>
                                            <div className="text-sm font-medium" style={{ marginBottom: 2 }}>{r.description}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{vol?.name} · {r.station} · {r.time}</div>
                                        </div>
                                        <span className={`badge ${r.severity === 'high' ? 'badge-red' : 'badge-amber'}`} style={{ flexShrink: 0 }}>{r.severity.toUpperCase()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ROSTER — removed Rating, removed Senior, removed totalHours, show totalSessions & jam kehadiran */}
                {activeTab === 'roster' && (
                    <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                            {filteredVolunteers.length} relawan terdaftar
                        </p>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr><th>Nama</th><th>No. Anggota</th><th>Stasiun</th><th>Status</th><th>Sesi</th><th>Jam Kehadiran</th></tr>
                                </thead>
                                <tbody>
                                    {filteredVolunteers.map(v => {
                                        const totalMin = calcHoursFromAttendance(v.id);
                                        return (
                                            <tr key={v.id}>
                                                <td>
                                                    <div className="flex items-center gap-sm">
                                                        <div className="avatar avatar-sm">{v.name.charAt(0)}</div>
                                                        <span className="font-medium">{v.name}</span>
                                                    </div>
                                                </td>
                                                <td className="font-mono text-sm">{v.no_anggota}</td>
                                                <td><span className="badge badge-blue">{v.station}</span></td>
                                                <td><span className={`badge ${v.status === 'verified' ? 'badge-green' : 'badge-amber'}`}>{v.status === 'verified' ? 'Verified' : 'Pending'}</span></td>
                                                <td>{v.totalSessions}</td>
                                                <td>{totalMin > 0 ? formatMinutesToHM(totalMin) : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SCHEDULE — with position assignments */}
                {activeTab === 'schedule' && (
                    <div className="stagger">
                        <div className="flex items-center justify-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Jadwal Mingguan</p>
                            {!isReadOnly && (
                                <button className="btn btn-primary btn-sm" onClick={() => addToast('Algoritma penjadwalan akan tersedia di iterasi 2', 'info')}>
                                    <Zap size={14} /> Jalankan Algoritma
                                </button>
                            )}
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
                            {/* Left Col: Calendar */}
                            <div>
                                <h4 style={{ marginBottom: 12 }}>Kalender</h4>
                                <ScheduleCalendar
                                    schedules={schedules}
                                    stationFilter={stationFilter}
                                    onDateSelect={setSelectedDate}
                                />
                                <div style={{ marginTop: 16 }}>
                                    <h5 style={{ marginBottom: 8 }}>Filter Stasiun</h5>
                                    <div className="flex gap-sm">
                                        <button className={`btn ${stationFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setStationFilter('all')}>Semua</button>
                                        <button className={`btn ${stationFilter === 'BD' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setStationFilter('BD')}>Bandung</button>
                                        <button className={`btn ${stationFilter === 'KAC' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setStationFilter('KAC')}>Kiaracondong</button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col: Schedule Cards */}
                            <div>
                                <h4 style={{ marginBottom: 12 }}>
                                    Detail Jadwal — {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {schedules
                                        .filter(s => s.date === selectedDate && (stationFilter === 'all' || s.station === stationFilter))
                                        .map((sch, i) => {
                                            const stInfo = stationInfo[sch.station];
                                            const team = (sch.volunteers || []).map(vid => volunteers.find(v => v.id === vid)).filter(Boolean);
                                            return (
                                                <div key={i} className="card">
                                                    <div className="flex items-center gap-sm" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
                                                        <Calendar size={16} style={{ color: 'var(--blue-400)', flexShrink: 0 }} />
                                                        <span className="font-semibold">{sch.date}</span>
                                                        <span className="badge badge-blue">{sch.station}</span>
                                                        <span className="badge badge-cyan">{sch.session}</span>
                                                        <span className="text-sm" style={{ marginLeft: 'auto', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{team.length} relawan</span>
                                                    </div>
                                                    <div className="volunteer-tags">
                                                        {team.map(v => {
                                                            const postId = sch.assignments?.[v.id];
                                                            const post = postId ? stInfo?.guardPosts.find(p => p.id === postId) : null;
                                                            return (
                                                                <span key={v.id} className="badge badge-blue" title={post ? post.name : 'Belum diassign'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                    {v.name}
                                                                    {post && <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>· {post.name}</span>}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {schedules.filter(s => s.date === selectedDate && (stationFilter === 'all' || s.station === stationFilter)).length === 0 && (
                                        <div className="card text-center" style={{ padding: 32, borderStyle: 'dashed' }}>
                                            <Calendar size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                            <p className="text-muted">Tidak ada jadwal pada tanggal ini untuk stasiun yang dipilih.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ATTENDANCE — with Korlap assist check-in/out */}
                {activeTab === 'attendance' && (
                    <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rekap absensi hari ini</p>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {canAssistCheckin && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setAssistType('checkin'); setShowAssistModal(true); }}>
                                        <CheckCircle size={14} /> Bantu Check-In
                                    </button>
                                )}
                                {canAssistCheckin && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setAssistType('checkout'); setShowAssistModal(true); }}>
                                        <LogOut size={14} /> Bantu Check-Out
                                    </button>
                                )}
                                {!isReadOnly && (
                                    <Link to="/kiosk" className="btn btn-primary btn-sm">
                                        <Shield size={14} /> Mode Kiosk
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Relawan</th><th>Stasiun</th><th>Sesi</th><th>Check-In</th><th>Check-Out</th><th>Durasi</th><th>Metode</th><th>Status</th></tr></thead>
                                <tbody>
                                    {attendance.map(a => {
                                        const v = volunteers.find(x => x.id === a.volunteer_id);
                                        // Calculate duration from check-in to check-out
                                        let duration = '-';
                                        if (a.check_in && a.check_out) {
                                            const [inH, inM] = a.check_in.split(':').map(Number);
                                            const [outH, outM] = a.check_out.split(':').map(Number);
                                            const totalMin = (outH * 60 + outM) - (inH * 60 + inM);
                                            duration = formatMinutesToHM(totalMin);
                                        }
                                        return (
                                            <tr key={a.id}>
                                                <td>
                                                    <div className="flex items-center gap-sm">
                                                        <div className="avatar avatar-sm">{v?.name.charAt(0)}</div>
                                                        <span>{v?.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-blue">{a.station}</span></td>
                                                <td>{a.session}</td>
                                                <td className="font-mono text-sm">{a.check_in || '-'}</td>
                                                <td className="font-mono text-sm">{a.check_out || '-'}</td>
                                                <td className="font-mono text-sm">{duration}</td>
                                                <td><span className={`badge ${a.method === 'gps' ? 'badge-green' : a.method === 'kiosk' ? 'badge-blue' : a.method === 'korlap' ? 'badge-purple' : 'badge-red'}`}>{a.method || 'Belum'}</span></td>
                                                <td>
                                                    <span className={`status-dot ${a.status === 'hadir' ? 'green' : 'yellow'}`} style={{ marginRight: 6 }} />
                                                    {a.status}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* REGISTRATIONS — role-based: Pengurus = relawan tetap, Korlap = BKO only */}
                {activeTab === 'registrations' && (
                    <div>
                        <h4 style={{ marginBottom: 16 }}>Pendaftaran Relawan Tetap</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                            {registrations.map(reg => (
                                <div key={reg.id} className="card">
                                    <div className="flex items-center justify-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h5>{reg.name}</h5>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{reg.no_anggota} · Masuk {reg.tahun_masuk} · {reg.domisili}</span>
                                        </div>
                                        <span className="badge badge-amber" style={{ flexShrink: 0 }}>Pending</span>
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                                        <div>Stasiun: <strong>{reg.station}</strong></div>
                                        <div>
                                            {reg.selected_shifts ? (
                                                <span>
                                                    Jadwal: {reg.selected_shifts.length} Sesi
                                                    <span className="text-xs text-muted" style={{ display: 'block', marginTop: 2 }}>
                                                        ({reg.selected_shifts.map(s => {
                                                            const [d, sess] = s.split('_');
                                                            const dateObj = new Date(d);
                                                            return `${dateObj.getDate()}/${dateObj.getMonth() + 1} (${sess})`;
                                                        }).join(', ')})
                                                    </span>
                                                </span>
                                            ) : (
                                                <span>Tanggal: {reg.dates?.join(', ')}</span>
                                            )}
                                        </div>
                                    </div>
                                    {canAcceptRegistrations ? (
                                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                            <button className="btn btn-success btn-sm" onClick={() => handleAcceptRegistration(reg)}>
                                                <CheckCircle size={14} /> Terima
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectRegistration(reg)}>
                                                <XCircle size={14} /> Tolak
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => addToast(`${reg.name} → cadangan`, 'info')}>Cadangan</button>
                                        </div>
                                    ) : (
                                        <div className="text-xs" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            Hanya Pengurus / Admin yang dapat menerima pendaftaran relawan tetap
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="divider" style={{ margin: '16px 0' }} />
                        <h4 style={{ marginBottom: 16 }}>Form BKO</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {bkoRequests.map(bko => (
                                <div key={bko.id} className="card">
                                    <div className="flex items-center justify-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h5>{bko.name}</h5>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{bko.station} · {bko.session} · {bko.dates.join(', ')}</span>
                                        </div>
                                        <span className="badge badge-purple" style={{ flexShrink: 0 }}>BKO Pending</span>
                                    </div>
                                    {canAcceptBKO ? (
                                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                            <button className="btn btn-success btn-sm" onClick={() => addToast('Fitur Approve BKO di Iterasi 3', 'info')}><CheckCircle size={14} /> Setujui</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => addToast('Fitur Reject BKO di Iterasi 3', 'info')}><XCircle size={14} /> Tolak</button>
                                        </div>
                                    ) : (
                                        <div className="text-xs" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            Hanya Korlap / Admin yang dapat menyetujui BKO
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* REPORTS */}
                {activeTab === 'reports' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {reports.map(r => {
                            const vol = volunteers.find(v => v.id === r.volunteer_id);
                            return (
                                <div key={r.id} className="card">
                                    <div className="flex items-center justify-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                        <div className="flex items-center gap-sm" style={{ minWidth: 0 }}>
                                            <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>{vol?.name.charAt(0)}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <span className="font-medium">{vol?.name}</span>
                                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.station} · {r.date} {r.time}</div>
                                            </div>
                                        </div>
                                        <span className={`badge ${r.severity === 'high' ? 'badge-red' : 'badge-amber'}`} style={{ flexShrink: 0 }}>{r.category}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.description}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TRAINS */}
                {activeTab === 'trains' && (
                    <div>
                        <div className="tabs" style={{ maxWidth: 300, marginBottom: 16 }}>
                            <button className={`tab ${stationFilter !== 'KAC' ? 'active' : ''}`} onClick={() => setStationFilter('BD')}>Bandung</button>
                            <button className={`tab ${stationFilter === 'KAC' ? 'active' : ''}`} onClick={() => setStationFilter('KAC')}>Kiaracondong</button>
                        </div>
                        <TrainBoard stationCode={stationFilter === 'KAC' ? 'KAC' : 'BD'} maxItems={15} />
                    </div>
                )}

                {/* SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="card">
                            <h4 style={{ marginBottom: 12 }}>Akun Anda</h4>
                            <div className="flex flex-col gap-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary">Nama</span>
                                    <span className="font-semibold">{user.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary">Email</span>
                                    <span className="font-semibold">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary">Role</span>
                                    <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                                </div>
                                <div className="divider" />
                                <button className="btn btn-danger w-full" onClick={handleLogout}>
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        </div>
                        <div className="card">
                            <h4 style={{ marginBottom: 8 }}>Tentang Iterasi 2</h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <strong>Iterasi 2:</strong> Integrasi Backend Supabase (Auth & Database). CRUD Relawan, Absensi, dan Pendaftaran.
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>
                                Iterasi 2 selesai. Iterasi 3 akan fokus pada algoritma penjadwalan otomatis.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Korlap Assist Check-In/Out Modal */}
            {showAssistModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAssistModal(false)}>
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <h4>{assistType === 'checkin' ? '✅ Bantu Check-In' : '🚪 Bantu Check-Out'}</h4>
                            <button className="btn-icon" onClick={() => setShowAssistModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="badge badge-purple" style={{ alignSelf: 'flex-start' }}>
                                <Shield size={12} /> Korlap membantu relawan yang lupa {assistType === 'checkin' ? 'check-in' : 'check-out'}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pilih Relawan *</label>
                                <select className="form-select" value={assistVolunteer} onChange={e => setAssistVolunteer(e.target.value)}>
                                    <option value="">-- Pilih Relawan --</option>
                                    {volunteers.filter(v => v.status === 'verified').map(v => (
                                        <option key={v.id} value={v.id}>{v.name} ({v.no_anggota})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Waktu {assistType === 'checkin' ? 'Check-In' : 'Check-Out'} *</label>
                                <input type="time" className="form-input" value={assistTime} onChange={e => setAssistTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAssistModal(false)}>Batal</button>
                            <button className="btn btn-primary" onClick={handleAssistSubmit} disabled={!assistVolunteer || !assistTime}>
                                <CheckCircle size={16} /> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav for Admin */}
            <nav className="admin-mobile-nav">
                {TABS.slice(0, 5).map(t => (
                    <button key={t.id} className={`mobile-nav-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                        {t.icon}
                        <span>{t.label}</span>
                    </button>
                ))}
                <button className={`mobile-nav-item`} onClick={() => setSidebarOpen(true)}>
                    <Menu size={18} />
                    <span>Lainnya</span>
                </button>
            </nav>
        </div>
    );
}
