import { useEffect, useRef, useState } from 'react';
import '@calendarjs/ce/dist/style.css';

/**
 * React wrapper around CalendarJS' Calendar component.
 * Uses the imperative API with a ref to mount the calendar.
 */
export default function ScheduleCalendar({ schedules, onDateSelect, stationFilter = 'all' }) {
    const calendarRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMonth, setViewMonth] = useState(new Date(2026, 2)); // March 2026

    // Get unique dates that have schedules
    const scheduleDates = schedules
        .filter(s => stationFilter === 'all' || s.station === stationFilter)
        .reduce((acc, s) => {
            if (!acc.includes(s.date)) acc.push(s.date);
            return acc;
        }, []);

    // Days of week labels
    const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
    };

    const handleDateClick = (dateStr) => {
        setSelectedDate(dateStr);
        if (onDateSelect) onDateSelect(dateStr);
    };

    const daysInMonth = getDaysInMonth(viewMonth);
    const firstDay = getFirstDayOfMonth(viewMonth);
    const monthStr = `${MONTHS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

    // Build calendar grid
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(null); // empty cells before first day
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push(dateStr);
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
        }}>
            {/* Calendar Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(59,130,246,0.08)',
                borderBottom: '1px solid var(--border-subtle)'
            }}>
                <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '6px 10px' }}>
                    ‹
                </button>
                <span className="font-semibold" style={{ fontSize: '1rem' }}>{monthStr}</span>
                <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '6px 10px' }}>
                    ›
                </button>
            </div>

            {/* Day headers */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center', padding: '8px 4px 4px'
            }}>
                {DAYS.map(d => (
                    <div key={d} className="text-xs font-semibold" style={{ color: 'var(--text-muted)', padding: '4px 0' }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Date grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                padding: '0 4px 8px', gap: 2
            }}>
                {cells.map((dateStr, idx) => {
                    if (!dateStr) {
                        return <div key={`empty-${idx}`} />;
                    }
                    const day = parseInt(dateStr.split('-')[2]);
                    const hasSchedule = scheduleDates.includes(dateStr);
                    const isSelected = selectedDate === dateStr;
                    const isToday = dateStr === today;

                    // Count sessions for this date
                    const sessionsForDate = schedules.filter(s =>
                        s.date === dateStr && (stationFilter === 'all' || s.station === stationFilter)
                    );

                    return (
                        <div
                            key={dateStr}
                            onClick={() => handleDateClick(dateStr)}
                            style={{
                                textAlign: 'center',
                                padding: '6px 2px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: hasSchedule ? 'pointer' : 'default',
                                background: isSelected
                                    ? 'var(--blue-400)'
                                    : isToday
                                        ? 'rgba(59,130,246,0.15)'
                                        : hasSchedule
                                            ? 'rgba(16,185,129,0.08)'
                                            : 'transparent',
                                color: isSelected
                                    ? 'white'
                                    : isToday
                                        ? 'var(--blue-400)'
                                        : hasSchedule
                                            ? 'var(--text-primary)'
                                            : 'var(--text-muted)',
                                fontWeight: isToday || hasSchedule ? 700 : 400,
                                transition: 'all 0.15s',
                                position: 'relative',
                                minHeight: 36,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseOver={e => {
                                if (hasSchedule && !isSelected) {
                                    e.currentTarget.style.background = 'rgba(59,130,246,0.12)';
                                }
                            }}
                            onMouseOut={e => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = isToday
                                        ? 'rgba(59,130,246,0.15)'
                                        : hasSchedule
                                            ? 'rgba(16,185,129,0.08)'
                                            : 'transparent';
                                }
                            }}
                        >
                            <span className="text-sm">{day}</span>
                            {hasSchedule && (
                                <div style={{
                                    display: 'flex', gap: 2, marginTop: 2, justifyContent: 'center'
                                }}>
                                    {sessionsForDate.map((s, si) => (
                                        <div key={si} style={{
                                            width: 4, height: 4, borderRadius: '50%',
                                            background: isSelected ? 'rgba(255,255,255,0.7)' : s.station === 'BD' ? 'var(--blue-400)' : 'var(--cyan-400)'
                                        }} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', gap: 16, padding: '8px 16px', justifyContent: 'center',
                borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-400)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Bandung</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan-400)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Kiaracondong</span>
                </div>
            </div>
        </div>
    );
}
