import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Train, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import LiveClock from '../components/LiveClock';
import { stationConfig, getProcessedSchedule } from '../data/trainData';

function getUrgencyBg(minutes) {
    if (minutes > 30) return { background: 'var(--emerald-500)', color: '#fff' };
    if (minutes > 15) return { background: 'var(--amber-500)', color: '#fff' };
    return { background: 'var(--red-500)', color: '#fff' };
}

export default function TrackViewPage() {
    const [station, setStation] = useState('BD');
    const [selectedTrack, setSelectedTrack] = useState(null);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const totalTracks = stationConfig[station]?.totalTracks || 7;

    const allSchedules = useMemo(() => {
        return getProcessedSchedule(station, now);
    }, [station, now]);

    // Group by track
    const byTrack = useMemo(() => {
        const grouped = {};
        for (let i = 1; i <= totalTracks; i++) {
            grouped[i] = allSchedules
                .filter(t => t.track === i)
                .sort((a, b) => {
                    const aMin = Math.abs(a.minToArr ?? a.minToDep ?? 999);
                    const bMin = Math.abs(b.minToArr ?? b.minToDep ?? 999);
                    return aMin - bMin;
                });
        }
        return grouped;
    }, [allSchedules, totalTracks]);

    // Filtered trains
    const displayTrains = selectedTrack === null
        ? allSchedules.sort((a, b) => (Math.abs(a.minToArr ?? a.minToDep ?? 999)) - (Math.abs(b.minToArr ?? b.minToDep ?? 999)))
        : byTrack[selectedTrack] || [];

    return (
        <div style={{ background: 'var(--surface-base)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'rgba(10, 14, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '16px 24px',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                        <div className="flex items-center gap-md">
                            <Link to="/" className="btn btn-secondary btn-sm">
                                <ArrowLeft size={16} /> Kembali
                            </Link>
                            <h3 style={{ margin: 0 }}>
                                🚆 Tampilan Per Jalur
                            </h3>
                        </div>
                        <LiveClock />
                    </div>

                    {/* Station Selector */}
                    <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                        <div className="flex items-center gap-sm">
                            <MapPin size={16} style={{ color: 'var(--blue-400)' }} />
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Stasiun:</span>
                            {Object.keys(stationConfig).map(code => (
                                <button
                                    key={code}
                                    className={`btn btn-sm ${station === code ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => { setStation(code); setSelectedTrack(null); }}
                                >
                                    {stationConfig[code].name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Selector */}
            <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px' }}>
                <div style={{ marginBottom: 20 }}>
                    <h5 style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>Pilih Jalur</h5>
                    <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                        <button
                            className={`btn ${selectedTrack === null ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedTrack(null)}
                            style={{ padding: '10px 20px', fontWeight: 700 }}
                        >
                            Semua Jalur
                        </button>
                        {Array.from({ length: totalTracks }, (_, i) => i + 1).map(track => {
                            const trainCount = (byTrack[track] || []).length;
                            return (
                                <button
                                    key={track}
                                    className={`btn ${selectedTrack === track ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectedTrack(track)}
                                    style={{
                                        padding: '10px 20px',
                                        fontWeight: 700,
                                        position: 'relative',
                                        minWidth: 80
                                    }}
                                >
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem' }}>
                                        {track}
                                    </div>
                                    {trainCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: -6,
                                            right: -6,
                                            background: 'var(--blue-500)',
                                            color: '#fff',
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%'
                                        }}>
                                            {trainCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Track Title */}
                {selectedTrack !== null && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.1))',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '20px 28px',
                        marginBottom: 20,
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '4rem',
                            fontWeight: 800,
                            color: 'var(--blue-400)',
                            lineHeight: 1
                        }}>
                            {selectedTrack}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
                            {stationConfig[station].name} — {displayTrains.length} kereta dalam 3 jam ke depan
                        </div>
                    </div>
                )}

                {/* Train Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
                    {displayTrains.length > 0 ? displayTrains.map((t, i) => {
                        const min = t.minToArr ?? t.minToDep;
                        const urgency = min != null ? (min > 30 ? 'green' : min > 15 ? 'yellow' : 'red') : 'green';
                        const urgencyBgStyle = min != null ? getUrgencyBg(Math.abs(min)) : { background: 'var(--emerald-500)', color: '#fff' };
                        const isKCIC = t.raw.type === 'FDR';
                        const isKCI = t.raw.type === 'LOC';
                        const destination = t.info ? t.info.replace(/^(Tujuan |Dari )/, '') : t.raw.route;

                        return (
                            <div key={i} className={`countdown-card ${urgency}`} style={{ padding: 16 }}>
                                <div className="flex items-center justify-between">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Track number & Tujuan enlarged at top */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <span style={{
                                                fontWeight: 800,
                                                fontSize: '1.8rem',
                                                color: 'var(--blue-400)',
                                                fontFamily: 'var(--font-mono)',
                                                background: 'rgba(59, 130, 246, 0.15)',
                                                padding: '2px 14px',
                                                borderRadius: 'var(--radius-sm)',
                                                lineHeight: 1.1,
                                                flexShrink: 0
                                            }}>
                                                {t.track}
                                            </span>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                color: 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {destination}
                                            </span>
                                        </div>
                                        <div className="font-semibold" style={{ fontSize: '0.9rem', color: isKCIC ? 'var(--purple-400)' : isKCI ? '#fb7185' : 'var(--blue-400)' }}>
                                            {t.raw.name}
                                            <span className={`badge ${isKCI ? 'badge-kci' : isKCIC ? 'badge-kcic' : 'badge-kai'}`} style={{ marginLeft: 6 }}>
                                                {isKCI ? 'KCI' : isKCIC ? 'KCIC' : 'KAI'}
                                            </span>
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 1 }}>{t.raw.no} · {t.time}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: min != null && Math.abs(min) < 60 ? '2rem' : '1.2rem',
                                            fontWeight: 800,
                                            color: urgency === 'green' ? 'var(--emerald-400)' : urgency === 'yellow' ? 'var(--amber-400)' : 'var(--red-400)'
                                        }}>
                                            {min != null ? (min > 0 ? `${min}'` : 'TIBA') : t.time}
                                        </div>
                                        {/* Status pill: white text on colored bg */}
                                        <div style={{
                                            display: 'inline-block',
                                            ...urgencyBgStyle,
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
                        <div className="card" style={{ textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
                            <Train size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                            <p style={{ color: 'var(--text-muted)' }}>
                                {selectedTrack !== null
                                    ? `Tidak ada kereta di Jalur ${selectedTrack} dalam 3 jam ke depan`
                                    : 'Tidak ada kereta dalam 3 jam ke depan'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
