import { useState, useEffect, useMemo } from 'react';
import { getProcessedSchedule } from '../data/trainData';
import { Train, ArrowRight } from 'lucide-react';

function getCountdownColor(minutes) {
    if (minutes > 30) return 'countdown-green';
    if (minutes > 15) return 'countdown-yellow';
    return 'countdown-red';
}

function getUrgencyBg(minutes) {
    if (minutes > 30) return { background: 'var(--emerald-500)', color: '#fff' };
    if (minutes > 15) return { background: 'var(--amber-500)', color: '#fff' };
    return { background: 'var(--red-500)', color: '#fff' };
}

function TrainRow({ item }) {
    const isKCI = item.displayMode === 'KCI';
    const isKCIC = item.displayMode === 'KCIC';
    const minDisplay = item.minToArr ?? item.minToDep;
    const urgencyStyle = minDisplay != null ? getUrgencyBg(Math.abs(minDisplay)) : null;

    // Determine destination from info
    const destination = item.info ? item.info.replace(/^(Tujuan |Dari )/, '') : item.raw.route;

    return (
        <div className={`train-row ${item.isBlinking ? 'blink' : ''}`}>
            <div className="train-time">{item.time || '--:--'}</div>
            <div style={{ minWidth: 0 }}>
                {/* Tujuan above train name */}
                <div style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 2
                }}>
                    {destination}
                </div>
                <div className="train-name" style={{ color: isKCIC ? 'var(--purple-400)' : isKCI ? '#fb7185' : 'var(--blue-400)' }}>
                    {item.raw.name}
                    <span className={`badge ${isKCI ? 'badge-kci' : isKCIC ? 'badge-kcic' : item.raw.type === 'FDR' ? 'badge-kcic' : 'badge-kai'}`} style={{ marginLeft: 8 }}>
                        {item.raw.type === 'LOC' ? 'KCI' : item.raw.type === 'FDR' ? 'KCIC' : 'KAI'}
                    </span>
                </div>
                <div className="train-route">
                    {item.raw.no} · {item.info || item.raw.route}
                </div>
            </div>
            <div>
                {urgencyStyle ? (
                    <span className="train-status-pill" style={urgencyStyle}>
                        {item.status}
                    </span>
                ) : (
                    <div className="train-status">{item.status}</div>
                )}
            </div>
        </div>
    );
}

function BoardColumn({ title, subtitle, headerClass, colorAccent, trains, emptyText }) {
    return (
        <div className="train-board">
            <div className={`train-board-header ${headerClass}`}>
                <div className="flex items-center gap-sm">
                    <Train size={18} style={{ color: colorAccent }} />
                    <span className="font-semibold" style={{ color: colorAccent }}>{title}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
            </div>
            <div style={{ padding: '4px 0' }}>
                <div className="train-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>WAKTU</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>KERETA</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)', textAlign: 'right' }}>STATUS</div>
                </div>
                {trains.length > 0 ? trains.map((t, i) => <TrainRow key={i} item={t} />) : (
                    <div className="empty-state" style={{ padding: '24px 16px' }}>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrainBoard({ stationCode = 'BD', maxItems = 10, showHeader = true }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const processed = useMemo(() => {
        const all = getProcessedSchedule(stationCode, now);
        // Sort by time relevance
        all.sort((a, b) => {
            const aMin = Math.abs(a.minToArr ?? a.minToDep ?? 999);
            const bMin = Math.abs(b.minToArr ?? b.minToDep ?? 999);
            return aMin - bMin;
        });
        return all.slice(0, maxItems);
    }, [stationCode, now, maxItems]);

    const kciTrains = processed.filter(t => t.displayMode === 'KCI');
    const kcicTrains = processed.filter(t => t.displayMode === 'KCIC');
    const kaiTrains = processed.filter(t => t.displayMode === 'KAI');

    // Only show Whoosh/KCIC column for BD station (which has feeders)
    const hasKcic = stationCode === 'BD';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: hasKcic ? '1fr 1fr 1fr' : '1fr 1fr', gap: 16 }}>
            {/* KCI / Commuter Line */}
            <BoardColumn
                title="Commuter Line"
                subtitle="KCI"
                headerClass="kci"
                colorAccent="#fb7185"
                trains={kciTrains}
                emptyText="Tidak ada Commuter Line dalam 3 jam ke depan"
            />

            {/* Whoosh / KCIC Feeder */}
            {hasKcic && (
                <BoardColumn
                    title="Whoosh (KCIC)"
                    subtitle="KCIC"
                    headerClass="kcic"
                    colorAccent="var(--purple-400)"
                    trains={kcicTrains}
                    emptyText="Tidak ada Feeder Whoosh dalam 3 jam ke depan"
                />
            )}

            {/* KAI / Long Distance */}
            <BoardColumn
                title="KA Jarak Jauh"
                subtitle="KAI"
                headerClass="kai"
                colorAccent="var(--blue-400)"
                trains={kaiTrains}
                emptyText="Tidak ada KA jarak jauh dalam 3 jam ke depan"
            />
        </div>
    );
}
