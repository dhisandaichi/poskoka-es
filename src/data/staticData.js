// Static data for Iteration 1 (no backend)

export const POSKO_DATES = { start: '2026-03-16', end: '2026-03-29' };

export const stationInfo = {
    BD: {
        code: 'BD', name: 'Stasiun Bandung', shortName: 'Bandung',
        lat: -6.912, lng: 107.602, geofenceRadius: 250,
        sessions: [
            { id: 'pagi', label: 'Sesi Pagi', start: '07:00', end: '13:00' },
            { id: 'siang', label: 'Sesi Siang', start: '14:00', end: '20:00' }
        ],
        guardPosts: [
            { id: 'pintu-selatan', name: 'Pintu Selatan', min: 3, max: 5, type: 'flexible' },
            { id: 'skybridge', name: 'Skybridge', min: 3, max: 3, type: 'fixed' },
            { id: 'peron-jauh', name: 'Peron Jarak Jauh', min: 3, max: 6, type: 'flexible' },
            { id: 'pintu-utara', name: 'Pintu Utara', min: 2, max: 3, type: 'flexible' }
        ],
        minPersonnel: 11, maxPersonnel: 17,
        entrance: { utara: 'Pintu Utara', selatan: 'Pintu Selatan (St. Hall)' }
    },
    KAC: {
        code: 'KAC', name: 'Stasiun Kiaracondong', shortName: 'Kiaracondong',
        lat: -6.925, lng: 107.646, geofenceRadius: 250,
        sessions: [
            { id: 'pagi', label: 'Sesi Pagi', start: '07:00', end: '11:30' },
            { id: 'sore', label: 'Sesi Sore', start: '17:00', end: '22:30' }
        ],
        guardPosts: [
            { id: 'pintu-peron-utara', name: 'Pintu & Peron Utara', min: 2, max: 4, type: 'flexible' },
            { id: 'skybridge', name: 'Skybridge', min: 2, max: 2, type: 'fixed' },
            { id: 'peron-selatan', name: 'Peron Selatan', min: 2, max: 3, type: 'flexible' },
            { id: 'peron-jauh', name: 'Peron K.A Jarak Jauh', min: 2, max: 2, type: 'fixed' }
        ],
        minPersonnel: 8, maxPersonnel: 11,
        entrance: { utara: 'Pintu/Peron Utara', selatan: 'Peron Selatan' }
    }
};

export const sampleVolunteers = [
    { id: 'v001', name: 'Budi Santoso', no_anggota: 'VT-2024-001', tahun_masuk: 2022, domisili: 'Bandung', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 48, phone: '08123456789' },
    { id: 'v002', name: 'Siti Rahayu', no_anggota: 'VT-2024-002', tahun_masuk: 2023, domisili: 'Cimahi', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 24, phone: '08234567890' },
    { id: 'v003', name: 'Ahmad Fauzi', no_anggota: 'VT-2024-003', tahun_masuk: 2021, domisili: 'Bandung', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 72, phone: '08345678901' },
    { id: 'v004', name: 'Dewi Lestari', no_anggota: 'VT-2024-004', tahun_masuk: 2023, domisili: 'Bandung', station: 'KAC', role: 'volunteer', status: 'verified', totalSessions: 16, phone: '08456789012' },
    { id: 'v005', name: 'Rizky Pratama', no_anggota: 'VT-2024-005', tahun_masuk: 2022, domisili: 'Cimahi', station: 'KAC', role: 'volunteer', status: 'verified', totalSessions: 40, phone: '08567890123' },
    { id: 'v006', name: 'Nadia Putri', no_anggota: 'VT-2024-006', tahun_masuk: 2024, domisili: 'Bandung', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 8, phone: '08678901234' },
    { id: 'v007', name: 'Fajar Hidayat', no_anggota: 'VT-2024-007', tahun_masuk: 2021, domisili: 'Bandung', station: 'KAC', role: 'volunteer', status: 'verified', totalSessions: 64, phone: '08789012345' },
    { id: 'v008', name: 'Laras Wulandari', no_anggota: 'VT-2024-008', tahun_masuk: 2023, domisili: 'Garut', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 20, phone: '08890123456' },
    { id: 'v009', name: 'Ilham Kurniawan', no_anggota: 'VT-2024-009', tahun_masuk: 2022, domisili: 'Bandung', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 32, phone: '08901234567' },
    { id: 'v010', name: 'Maya Anggraini', no_anggota: 'VT-2024-010', tahun_masuk: 2024, domisili: 'Cimahi', station: 'KAC', role: 'volunteer', status: 'pending', totalSessions: 0, phone: '08012345678' },
    { id: 'v011', name: 'Dimas Aditya', no_anggota: 'VT-2024-011', tahun_masuk: 2022, domisili: 'Bandung', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 36, phone: '08123450000' },
    { id: 'v012', name: 'Rina Sulistyo', no_anggota: 'VT-2024-012', tahun_masuk: 2023, domisili: 'Bandung', station: 'KAC', role: 'volunteer', status: 'verified', totalSessions: 12, phone: '08234560000' },
    { id: 'v013', name: 'Yoga Permana', no_anggota: 'VT-2024-013', tahun_masuk: 2024, domisili: 'Bandung', station: 'BD', role: 'volunteer', status: 'pending', totalSessions: 0, phone: '08345670000' },
    { id: 'v014', name: 'Fitri Handayani', no_anggota: 'VT-2024-014', tahun_masuk: 2021, domisili: 'Bandung', station: 'KAC', role: 'volunteer', status: 'verified', totalSessions: 56, phone: '08456780000' },
    { id: 'v015', name: 'Arief Rahman', no_anggota: 'VT-2024-015', tahun_masuk: 2023, domisili: 'Cimahi', station: 'BD', role: 'volunteer', status: 'verified', totalSessions: 18, phone: '08567890000' },
];

// Schedules now include position assignments per volunteer
export const sampleSchedules = [
    {
        date: '2026-03-16', station: 'BD', session: 'pagi', volunteers: ['v001', 'v002', 'v003', 'v006', 'v008', 'v009', 'v011', 'v015', 'v013', 'v010', 'v004'],
        assignments: { v001: 'pintu-selatan', v002: 'skybridge', v003: 'peron-jauh', v006: 'pintu-selatan', v008: 'peron-jauh', v009: 'skybridge', v011: 'peron-jauh', v015: 'pintu-utara', v013: 'pintu-selatan', v010: 'pintu-utara', v004: 'peron-jauh' }
    },
    {
        date: '2026-03-16', station: 'BD', session: 'siang', volunteers: ['v002', 'v003', 'v006', 'v008', 'v009', 'v011', 'v015'],
        assignments: { v002: 'pintu-selatan', v003: 'peron-jauh', v006: 'skybridge', v008: 'peron-jauh', v009: 'skybridge', v011: 'pintu-selatan', v015: 'pintu-utara' }
    },
    {
        date: '2026-03-16', station: 'KAC', session: 'pagi', volunteers: ['v004', 'v005', 'v007', 'v012', 'v014'],
        assignments: { v004: 'pintu-peron-utara', v005: 'skybridge', v007: 'peron-selatan', v012: 'peron-jauh', v014: 'pintu-peron-utara' }
    },
    {
        date: '2026-03-16', station: 'KAC', session: 'sore', volunteers: ['v004', 'v005', 'v007', 'v012', 'v014'],
        assignments: { v004: 'peron-selatan', v005: 'skybridge', v007: 'pintu-peron-utara', v012: 'peron-jauh', v014: 'pintu-peron-utara' }
    },
    {
        date: '2026-03-17', station: 'BD', session: 'pagi', volunteers: ['v001', 'v002', 'v006', 'v009', 'v011', 'v015', 'v003', 'v008'],
        assignments: { v001: 'pintu-selatan', v002: 'skybridge', v006: 'pintu-utara', v009: 'skybridge', v011: 'peron-jauh', v015: 'pintu-selatan', v003: 'peron-jauh', v008: 'pintu-selatan' }
    },
    {
        date: '2026-03-17', station: 'KAC', session: 'pagi', volunteers: ['v005', 'v007', 'v012', 'v014', 'v004'],
        assignments: { v005: 'skybridge', v007: 'pintu-peron-utara', v012: 'peron-selatan', v014: 'peron-jauh', v004: 'pintu-peron-utara' }
    },
];

export const sampleAttendance = [
    { id: 'a001', volunteerId: 'v001', date: '2026-03-16', station: 'BD', session: 'pagi', checkIn: '06:55', checkOut: '13:05', method: 'gps', status: 'hadir' },
    { id: 'a002', volunteerId: 'v002', date: '2026-03-16', station: 'BD', session: 'pagi', checkIn: '07:02', checkOut: '13:00', method: 'gps', status: 'hadir' },
    { id: 'a003', volunteerId: 'v003', date: '2026-03-16', station: 'BD', session: 'pagi', checkIn: '07:10', checkOut: null, method: 'gps', status: 'hadir' },
    { id: 'a004', volunteerId: 'v004', date: '2026-03-16', station: 'KAC', session: 'pagi', checkIn: '06:58', checkOut: '11:30', method: 'kiosk', status: 'hadir' },
    { id: 'a005', volunteerId: 'v005', date: '2026-03-16', station: 'KAC', session: 'pagi', checkIn: '07:05', checkOut: '11:25', method: 'gps', status: 'hadir' },
    { id: 'a006', volunteerId: 'v006', date: '2026-03-16', station: 'BD', session: 'pagi', checkIn: null, checkOut: null, method: null, status: 'belum' },
];

export const sampleReports = [
    { id: 'r001', volunteerId: 'v001', date: '2026-03-16', time: '08:30', station: 'BD', category: 'crowding', description: 'Penumpukan penumpang di Skybridge saat KA Argo Parahyangan tiba', severity: 'high' },
    { id: 'r002', volunteerId: 'v005', date: '2026-03-16', time: '09:15', station: 'KAC', category: 'facility', description: 'Eskalator peron utara tidak berfungsi', severity: 'medium' },
    { id: 'r003', volunteerId: 'v003', date: '2026-03-16', time: '10:00', station: 'BD', category: 'medical', description: 'Penumpang lansia membutuhkan kursi roda di peron 4', severity: 'high' },
];

export const sampleRegistrations = [
    { id: 'reg001', name: 'Yoga Permana', no_anggota: 'VT-2024-013', tahun_masuk: 2024, domisili: 'Bandung', station: 'BD', dates: ['2026-03-16', '2026-03-17', '2026-03-18'], sessions: { '2026-03-16': 'pagi', '2026-03-17': 'pagi', '2026-03-18': 'siang' }, status: 'pending', submittedAt: '2026-02-10T08:00:00' },
    { id: 'reg002', name: 'Maya Anggraini', no_anggota: 'VT-2024-010', tahun_masuk: 2024, domisili: 'Cimahi', station: 'KAC', dates: ['2026-03-16', '2026-03-17'], sessions: { '2026-03-16': 'pagi', '2026-03-17': 'sore' }, status: 'pending', submittedAt: '2026-02-11T09:30:00' },
];

export const sampleBKO = [
    { id: 'bko001', name: 'Hendra Wijaya', no_anggota: 'VT-2025-050', tahun_masuk: 2025, station: 'BD', session: 'pagi', date: '2026-03-20', linkedUser: null, status: 'pending', submittedAt: '2026-02-12T07:00:00' },
];

// Helper: calculate total hours from attendance check-in to check-out
export function calcHoursFromAttendance(volunteerId, attendanceData = sampleAttendance) {
    let totalMinutes = 0;
    for (const a of attendanceData) {
        if (a.volunteerId === volunteerId && a.checkIn && a.checkOut) {
            const [inH, inM] = a.checkIn.split(':').map(Number);
            const [outH, outM] = a.checkOut.split(':').map(Number);
            totalMinutes += (outH * 60 + outM) - (inH * 60 + inM);
        }
    }
    return totalMinutes;
}

export function formatMinutesToHM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

export const aggregateStats = {
    totalVolunteers: 42, activeToday: 28, totalSessions: 2496,
    stationBreakdown: { BD: { total: 25, activeToday: 16 }, KAC: { total: 17, activeToday: 12 } }
};
