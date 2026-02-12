/**
 * train_data.js
 * * DATA & LOGIC CONTROL
 * - Mencakup jadwal statis Kiaracondong (KAC) & Bandung (BD).
 * - Logika perhitungan waktu mundur (ETA).
 * - Logika format teks tampilan (KCI Style vs KAI Style).
 */

// ==========================================
// 1. STATION CONFIGURATION & RULES
// ==========================================
const stationConfig = {
    KAC: {
        code: "KAC",
        name: "KIARACONDONG",
        totalTracks: 6,
        rules: {
            boardingOpen: 60, // menit sebelum berangkat
            stopCheck: 10,    // menit sebelum kedatangan (singgah)
            boardingClose: 5  // menit sebelum berangkat (tutup pintu)
        }
    },
    BD: {
        code: "BD",
        name: "BANDUNG",
        totalTracks: 7,
        rules: {
            feederCheck: 5,   // Jalur 7 notif
            boardingOpen: 60,
            stopCheck: 20,
            boardingClose: 5
        }
    }
};

// ==========================================
// 2. STATIC SCHEDULE DATA (GABUNGAN)
// ==========================================
// Type: 'LD' (Long Distance/KAI), 'LOC' (Local/KCI/Commuter), 'FDR' (Feeder)

const trainSchedule = [
    // --- STASIUN KIARACONDONG (KAC) ---
    { station: 'KAC', no: 'KA 287', name: 'Serayu', route: 'KROYA - PASAR SENEN', arr: '00:08', dep: '00:13', track: 6, type: 'LD' },
    { station: 'KAC', no: 'PLB 7021B', name: 'Penumpang Tambahan Kac', route: 'SURABAYA GUBENG -> KIARACONDONG', arr: '01:25', dep: null, track: 5, type: 'LD' },
    { station: 'KAC', no: 'PLB 7029A', name: 'Kutojaya Selatan Tambahan', route: 'KUTOARJO - KIARACONDONG', arr: '01:52', dep: '03:04', track: 4, type: 'LD' },
    { station: 'KAC', no: 'KA 798', name: 'Lodaya', route: 'SOLO BALAPAN - BANDUNG', arr: '03:02', dep: '03:47', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 370', name: 'Commuter Line Bandung Raya', route: 'BANDUNG - CICALENGKA', arr: '03:45', dep: '04:50', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 380', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '04:48', dep: '05:05', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 71', name: 'Mutiara Selatan', route: 'SURABAYA GUBENG -> BANDUNG', arr: '04:57', dep: '05:24', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 371', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '05:23', dep: '05:25', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'PLB 7030A', name: 'Kutojaya Selatan Tambahan', route: 'KIARACONDONG - KUTOARJO', arr: null, dep: '05:25', track: 4, type: 'LD' },
    { station: 'KAC', no: 'KA 360', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '05:30', dep: '05:33', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 67', name: 'Malabar', route: 'MALANG -> BANDUNG', arr: '05:33', dep: '05:35', track: 6, type: 'LD' },
    { station: 'KAC', no: 'PLB 7013B', name: 'Lodaya Tambahan', route: 'SOLO BALAPAN -> BANDUNG', arr: '05:49', dep: '05:52', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 399', name: 'Commuter Line Bandung Raya', route: 'KIARACONDONG - PADALARANG', arr: null, dep: '05:50', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 11', name: 'Turangga', route: 'SURABAYA GUBENG -> BANDUNG', arr: null, dep: '06:02', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 357', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '06:03', dep: '06:10', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 381', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '06:33', dep: '06:35', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 78B', name: 'Lodaya', route: 'BANDUNG -> SOLO BALAPAN', arr: '06:39', dep: '06:41', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 391', name: 'Commuter Line Garut', route: 'CIBATU - PADALARANG', arr: '06:56', dep: '06:58', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 273', name: 'Kahuripan', route: 'BLITAR - KIARACONDONG', arr: '07:14', dep: null, track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 348', name: 'Commuter Line Garut', route: 'PURWAKARTA - GARUT', arr: '07:18', dep: '07:23', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 361', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '07:27', dep: '07:30', track: 4, type: 'LOC' },
    { station: 'KAC', no: 'KA 10A', name: 'Argo Wilis', route: 'BANDUNG - SURABAYA GUBENG', arr: null, dep: '07:42', track: 2, type: 'LD' },
    { station: 'KAC', no: 'KA 299', name: 'Cikuray', route: 'GARUT - PASAR SENEN', arr: '07:52', dep: '07:54', track: 6, type: 'LD' },
    { station: 'KAC', no: 'PLB 7022B', name: 'Pasundan Lebaran', route: 'KIARACONDONG -> SURABAYA GUBENG', arr: null, dep: '08:00', track: 5, type: 'LD' },
    { station: 'KAC', no: 'KA 372', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '08:14', dep: '08:15', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 351', name: 'Commuter Line Garut', route: 'GARUT - PADALARANG', arr: '08:30', dep: '08:35', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 382', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '08:46', dep: '08:48', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 392', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '09:22', dep: '09:24', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 70', name: 'Malabar', route: 'BANDUNG -> MALANG', arr: '09:38', dep: '09:42', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 373', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '09:58', dep: '10:00', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 130B', name: 'Papandayan', route: 'GAMBIR -> GARUT', arr: '09:59', dep: '10:02', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 305', name: 'Parcel Selatan', route: 'SURABAYA KOTA - BANDUNG', arr: '10:11', dep: '10:21', track: 6, type: 'LD' },
    { station: 'KAC', no: 'PLB 7014B', name: 'Lodaya Tambahan', route: 'BANDUNG -> SOLO BALAPAN', arr: '10:20', dep: '10:23', track: 4, type: 'LD' },
    { station: 'KAC', no: 'KA 362', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '10:36', dep: '10:38', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 383', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '10:48', dep: '10:56', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 276', name: 'Pasundan', route: 'KIARACONDONG - SURABAYA GUBENG', arr: null, dep: '11:10', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 352', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '11:15', dep: '11:21', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 393', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '11:28', dep: '11:30', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 1288', name: 'Pangandaran', route: 'GAMBIR -> BANJAR', arr: '12:02', dep: '12:05', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 374', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '12:36', dep: '12:39', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 384', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '13:07', dep: '13:09', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 284', name: 'Serayu', route: 'PASAR SENEN - KROYA', arr: '13:16', dep: '13:20', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 283', name: 'Serayu', route: 'KROYA - PASAR SENEN', arr: '13:18', dep: '13:21', track: 4, type: 'LD' },
    { station: 'KAC', no: 'KA 353', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '13:30', dep: '13:32', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 394', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '14:08', dep: '14:10', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 349', name: 'Commuter Line Garut', route: 'GARUT - PURWAKARTA', arr: '14:21', dep: '14:26', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 1298', name: 'Papandayan', route: 'GARUT - GAMBIR', arr: '14:32', dep: '14:37', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 375', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '14:46', dep: '14:53', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 364', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '15:13', dep: '15:18', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 77B', name: 'Lodaya', route: 'SOLO BALAPAN -> BANDUNG', arr: '15:15', dep: '15:17', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 385', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '15:26', dep: '15:27', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 395', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '15:54', dep: '16:00', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 354', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '16:25', dep: '16:30', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'PLB 7011B', name: 'Lodaya Tambahan', route: 'SOLO BALAPAN - BANDUNG', arr: '16:36', dep: '16:40', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 291', name: 'Kutojaya Selatan', route: 'KUTOARJO -> KIARACONDONG', arr: '16:57', dep: null, track: 5, type: 'LD' },
    { station: 'KAC', no: 'KA 365', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '17:12', dep: '17:19', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 376', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '17:26', dep: '17:28', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 12', name: 'Turangga', route: 'BANDUNG -> SURABAYA GUBENG', arr: null, dep: '17:47', track: 2, type: 'LD' },
    { station: 'KAC', no: 'KA 69', name: 'Malabar', route: 'MALANG -> BANDUNG', arr: '17:51', dep: '17:55', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 386', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '17:59', dep: '18:00', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 9A', name: 'Argo Wilis', route: 'SURABAYA GUBENG -> BANDUNG', arr: null, dep: '18:09', track: 3, type: 'LD' },
    { station: 'KAC', no: 'KA 68', name: 'Malabar', route: 'BANDUNG - MALANG', arr: '18:18', dep: '18:24', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 355', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '18:29', dep: '18:31', track: 4, type: 'LOC' },
    { station: 'KAC', no: 'KA 396', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '18:29', dep: '18:35', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 306', name: 'Parcel Selatan', route: 'BANDUNG -> SURABAYA KOTA', arr: '18:35', dep: '18:45', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 275B', name: 'Pasundan', route: 'KIARACONDONG - SURABAYA GUBENG', arr: '18:58', dep: null, track: 4, type: 'LD' },
    { station: 'KAC', no: 'KA 80B', name: 'Lodaya', route: 'BANDUNG - SOLO BALAPAN', arr: '19:09', dep: '19:11', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 350', name: 'Commuter Line Garut', route: 'PURWAKARTA - GARUT', arr: '19:18', dep: '19:23', track: 6, type: 'LOC' },
    { station: 'KAC', no: 'KA 363', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '19:29', dep: '19:31', track: 4, type: 'LOC' },
    { station: 'KAC', no: 'KA 377', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '19:30', dep: '19:32', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 366', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '19:39', dep: '19:41', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 387', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '19:57', dep: '19:59', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 72', name: 'Mutiara Selatan', route: 'BANDUNG - SURABAYA GUBENG', arr: '20:08', dep: '20:10', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 397', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '20:28', dep: '20:30', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 292', name: 'Kutojaya Selatan', route: 'KIARACONDONG - KUTOARJO', arr: null, dep: '20:50', track: 5, type: 'LD' },
    { station: 'KAC', no: 'KA 300', name: 'Cikuray', route: 'PASAR SENEN - GARUT', arr: '21:00', dep: '21:09', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 356', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '21:17', dep: '21:18', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 1278', name: 'Pangandaran', route: 'BANJAR -> GAMBIR', arr: '21:21', dep: '21:29', track: 6, type: 'LD' },
    { station: 'KAC', no: 'PLB 7012B', name: 'Lodaya Tambahan', route: 'SOLO BALAPAN - BANDUNG', arr: '21:25', dep: '21:28', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 367', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PURWAKARTA', arr: '21:33', dep: '21:36', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 378', name: 'Commuter Line Garut', route: 'PADALARANG - CIBATU', arr: '21:40', dep: '21:42', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 388', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '22:07', dep: '22:09', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 274', name: 'Kahuripan', route: 'KIARACONDONG - BLITAR', arr: null, dep: '22:20', track: 6, type: 'LD' },
    { station: 'KAC', no: '398A', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '22:36', dep: '22:41', track: 1, type: 'LOC' },
    { station: 'KAC', no: '357A', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '23:04', dep: '23:10', track: 1, type: 'LOC' },
    { station: 'KAC', no: 'KA 288', name: 'Serayu', route: 'PASAR SENEN - KROYA', arr: '23:26', dep: '23:30', track: 6, type: 'LD' },
    { station: 'KAC', no: 'KA 389', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - BANDUNG', arr: '23:46', dep: '23:48', track: 1, type: 'LOC' },

    // --- STASIUN BANDUNG (BD) ---
    { station: 'BD', no: 'KA 400', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - BANDUNG', arr: '00:18', dep: null, track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 287', name: 'Serayu', route: 'KROYA - PASAR SENEN', arr: '00:24', dep: '00:33', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 140B', name: 'Parahyangan', route: 'GAMBIR - BANDUNG', arr: '02:02', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 79B', name: 'Lodaya', route: 'SOLO BALAPAN -> BANDUNG', arr: '03:14', dep: null, track: 3, type: 'LD' },
    { station: 'BD', no: 'KA 370', name: 'Commuter Line Bandung Raya', route: 'BANDUNG - CICALENGKA', arr: null, dep: '03:35', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 98', name: 'Harina', route: 'CIKAMPEK - BANDUNG', arr: '04:14', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 380', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '04:34', dep: '04:36', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 131B', name: 'Parahyangan', route: 'BANDUNG -> GAMBIR', arr: null, dep: '05:00', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 71', name: 'Mutiara Selatan', route: 'SURABAYA GUBENG -> BANDUNG', arr: '05:15', dep: null, track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 601', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '05:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 398', name: 'Commuter Line Bandung Raya', route: 'PADALARANG -> KIARACONDONG', arr: '05:16', dep: '05:18', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 371', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '05:37', dep: '05:42', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 67', name: 'Malabar', route: 'MALANG -> BANDUNG', arr: '05:44', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 603', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '05:46', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 602', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '05:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 399', name: 'Commuter Line Bandung Raya', route: 'KIARACONDONG -> PADALARANG', arr: '06:01', dep: '06:03', track: 1, type: 'LOC' },
    { station: 'BD', no: 'PLB 7013B', name: 'Lodaya Tambahan', route: 'SOLO BALAPAN - BANDUNG', arr: '06:02', dep: null, track: 6, type: 'LD' },
    { station: 'BD', no: 'KA 11', name: 'Turangga', route: 'SURABAYA GUBENG -> BANDUNG', arr: '06:09', dep: null, track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 605', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '06:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 357', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '06:21', dep: '06:30', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 604', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '06:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 78B', name: 'Lodaya', route: 'BANDUNG -> SOLO BALAPAN', arr: null, dep: '06:30', track: 3, type: 'LD' },
    { station: 'BD', no: 'KA 135B', name: 'Parahyangan', route: 'BANDUNG -> GAMBIR', arr: null, dep: '06:35', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 607', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '06:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 381', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '06:47', dep: '06:49', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 348', name: 'Commuter Line Garut', route: 'PURWAKARTA - GARUT', arr: '06:54', dep: '07:07', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 606', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '06:58', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 391', name: 'Commuter Line Garut', route: 'CIBATU - PADALARANG', arr: '07:11', dep: '07:14', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 609', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '07:16', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 608', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '07:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 10A', name: 'Argo Wilis', route: 'BANDUNG -> SURABAYA GUBENG', arr: null, dep: '07:35', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 361', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '07:41', dep: '07:47', track: 3, type: 'LOC' },
    { station: 'BD', no: 'KA 372', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '07:45', dep: '08:03', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 611', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '07:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 610', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '07:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 299', name: 'Cikuray', route: 'GARUT - PASAR SENEN', arr: '08:03', dep: '08:08', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 613', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '08:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 382', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '08:26', dep: '08:35', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 612', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '08:28', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 615', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '08:46', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 351', name: 'Commuter Line Garut', route: 'GARUT - PADALARANG', arr: '08:48', dep: '08:57', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 614', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '08:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 392', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '09:02', dep: '09:11', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 617', name: 'Feeder Whoosh', route: 'BANDUNG -> PADALARANG', arr: null, dep: '09:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 616', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '09:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 70', name: 'Malabar', route: 'BANDUNG - MALANG', arr: null, dep: '09:30', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 101', name: 'Harina', route: 'BANDUNG - CIKAMPEK', arr: null, dep: '09:35', track: 3, type: 'LD' },
    { station: 'BD', no: 'KA 130B', name: 'Papandayan', route: 'GAMBIR -> GARUT', arr: '09:42', dep: '09:50', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 619', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '09:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 618', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '09:58', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'PLB 7014B', name: 'Lodaya Tambahan', route: 'BANDUNG -> SOLO BALAPAN', arr: null, dep: '10:10', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 373', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '10:12', dep: '10:18', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 621', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '10:16', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 362', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '10:16', dep: '10:23', track: 3, type: 'LOC' },
    { station: 'BD', no: 'KA 132B', name: 'Parahyangan', route: 'GAMBIR - BANDUNG', arr: '10:22', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 141B', name: 'Parahyangan', route: 'BANDUNG - GAMBIR', arr: null, dep: '10:25', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 620', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '10:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 305', name: 'Parcel Selatan', route: 'SURABAYA KOTA - BANDUNG', arr: '10:32', dep: null, track: 6, type: 'LD' },
    { station: 'BD', no: 'KA 623', name: 'Feeder Whoosh', route: 'BANDUNG -> PADALARANG', arr: null, dep: '10:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 352', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '10:57', dep: '11:03', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 622', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '10:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 133B', name: 'Parahyangan', route: 'BANDUNG - GAMBIR', arr: null, dep: '11:05', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 383', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '11:08', dep: '11:15', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 625', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '11:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 624', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '11:28', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 393', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '11:42', dep: '11:46', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 128B', name: 'Pangandaran', route: 'GAMBIR -> BANJAR', arr: '11:43', dep: '11:53', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 627', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '11:46', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 626', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '11:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 629', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '12:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 138B', name: 'Parahyangan', route: 'GAMBIR - BANDUNG', arr: '12:18', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 374', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '12:20', dep: '12:24', track: 3, type: 'LOC' },
    { station: 'BD', no: 'KA 628', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '12:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 631', name: 'Feeder Whoosh', route: 'BANDUNG -> PADALARANG', arr: null, dep: '12:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 284', name: 'Serayu', route: 'PASAR SENEN - KROYA', arr: '12:51', dep: '13:07', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 384', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '12:53', dep: '12:56', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 630', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '12:58', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 137B', name: 'Parahyangan', route: 'BANDUNG -> GAMBIR', arr: null, dep: '13:05', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 633', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '13:16', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 136B', name: 'Parahyangan', route: 'GAMBIR - BANDUNG', arr: '13:18', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 632', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '13:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 283', name: 'Serayu', route: 'KROYA - PASAR SENEN', arr: '13:32', dep: '13:54', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 353', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '13:45', dep: '13:48', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 635', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '13:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 394', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '13:52', dep: '13:56', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 634', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '13:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 637', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '14:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 636', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '14:28', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 349', name: 'Commuter Line Garut', route: 'GARUT - PURWAKARTA', arr: '14:37', dep: '14:51', track: 3, type: 'LOC' },
    { station: 'BD', no: 'KA 639', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '14:46', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 1298', name: 'Papandayan', route: 'GARUT - GAMBIR', arr: '14:47', dep: '14:54', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 364', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '14:55', dep: '15:00', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 638', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '14:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 1748', name: 'Ciremai', route: 'CIKAMPEK -> BANDUNG', arr: '15:12', dep: null, track: 2, type: 'LD' },
    { station: 'BD', no: 'KA 641', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '15:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 77B', name: 'Lodaya', route: 'SOLO BALAPAN - BANDUNG', arr: '15:27', dep: null, track: 3, type: 'LD' },
    { station: 'BD', no: 'KA 640', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '15:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 385', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '15:40', dep: '15:42', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 643', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '15:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 642', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '15:58', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 354', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '16:00', dep: '16:14', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 395', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '16:12', dep: '16:18', track: 3, type: 'LOC' },
    { station: 'BD', no: 'KA 645', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '16:16', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 102', name: 'Harina', route: 'CIKAMPEK -> BANDUNG', arr: '16:20', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 644', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '16:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 142B', name: 'Parahyangan', route: 'GAMBIR - BANDUNG', arr: '16:42', dep: null, track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 647', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '16:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'PLB 7011B', name: 'Lodaya Tambahan', route: 'SOLO BALAPAN - BANDUNG', arr: '16:50', dep: null, track: 6, type: 'LD' },
    { station: 'BD', no: 'KA 1738', name: 'Ciremai', route: 'BANDUNG - CIKAMPEK', arr: null, dep: '16:55', track: 2, type: 'LD' },
    { station: 'BD', no: 'KA 646', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '16:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 376', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '17:01', dep: '17:14', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 649', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '17:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 386', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '17:26', dep: '17:46', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 648', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '17:28', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 365', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '17:32', dep: '17:42', track: 4, type: 'LOC' },
    { station: 'BD', no: 'KA 12B', name: 'Turangga', route: 'BANDUNG - SURABAYA GUBENG', arr: null, dep: '17:40', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 651', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '17:46', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 650', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '17:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 396', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '18:00', dep: '18:17', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 69', name: 'Malabar', route: 'MALANG -> BANDUNG', arr: '18:04', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 68', name: 'Malabar', route: 'BANDUNG -> MALANG', arr: null, dep: '18:10', track: 2, type: 'LD' },
    { station: 'BD', no: 'KA 653', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '18:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 9A', name: 'Argo Wilis', route: 'SURABAYA GUBENG -> BANDUNG', arr: '18:17', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 306', name: 'Parcel Selatan', route: 'BANDUNG -> SURABAYA KOTA', arr: null, dep: '18:24', track: 2, type: 'LD' },
    { station: 'BD', no: 'KA 652', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '18:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 355', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '18:42', dep: '18:49', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 655', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '18:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 350', name: 'Commuter Line Garut', route: 'PURWAKARTA - GARUT', arr: '18:54', dep: '19:07', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 654', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '18:58', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 80B', name: 'Lodaya', route: 'BANDUNG -> SOLO BALAPAN', arr: null, dep: '19:00', track: 3, type: 'LD' },
    { station: 'BD', no: 'KA 657', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '19:16', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 139B', name: 'Parahyangan', route: 'BANDUNG -> GAMBIR', arr: null, dep: '19:25', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 366', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '19:25', dep: '19:27', track: 7, type: 'LOC' }, // Track 7 biasanya Feeder, tapi sesuai data PDF
    { station: 'BD', no: 'KA 656', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '19:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 377', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '19:45', dep: '19:48', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 659', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '19:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 658', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '19:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 72', name: 'Mutiara Selatan', route: 'BANDUNG - SURABAYA GUBENG', arr: null, dep: '19:59', track: 2, type: 'LD' },
    { station: 'BD', no: 'KA 387', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '20:12', dep: '20:15', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 661', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '20:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 660', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '20:28', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 300', name: 'Cikuray', route: 'PASAR SENEN - GARUT', arr: '20:39', dep: '20:50', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 397', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '20:42', dep: '20:44', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 663', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '20:46', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 662', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '20:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 356', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '21:02', dep: '21:04', track: 1, type: 'LOC' },
    { station: 'BD', no: 'PLB 7012B', name: 'Lodaya Tambahan', route: 'BANDUNG -> SOLO BALAPAN', arr: null, dep: '21:15', track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 665', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '21:15', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 134B', name: 'Parahyangan', route: 'GAMBIR -> BANDUNG', arr: '21:20', dep: null, track: 5, type: 'LD' },
    { station: 'BD', no: 'KA 378', name: 'Commuter Line Garut', route: 'PADALARANG - CIBATU', arr: '21:24', dep: '21:27', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 664', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '21:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 97', name: 'Harina', route: 'BANDUNG - CIKAMPEK', arr: null, dep: '21:35', track: 6, type: 'LD' },
    { station: 'BD', no: 'KA 1278', name: 'Pangandaran', route: 'BANJAR - GAMBIR', arr: '21:39', dep: '21:54', track: 4, type: 'LD' },
    { station: 'BD', no: 'KA 667', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '21:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 367', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PURWAKARTA', arr: '21:47', dep: '22:18', track: 3, type: 'LOC' },
    { station: 'BD', no: 'KA 388', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '21:54', dep: '21:56', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 666', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '21:58', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 669', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '22:16', track: 7, type: 'FDR' },
    { station: 'BD', no: '398A', name: 'Commuter Line Bandung Raya', route: 'PADALARANG - CICALENGKA', arr: '22:18', dep: '22:23', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 668', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '22:29', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 671', name: 'Feeder Whoosh', route: 'BANDUNG - PADALARANG', arr: null, dep: '22:45', track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 670', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '22:59', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 288', name: 'Serayu', route: 'PASAR SENEN - KROYA', arr: '23:06', dep: '23:15', track: 4, type: 'LD' },
    { station: 'BD', no: '357A', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - PADALARANG', arr: '23:22', dep: '23:31', track: 1, type: 'LOC' },
    { station: 'BD', no: 'KA 672', name: 'Feeder Whoosh', route: 'PADALARANG - BANDUNG', arr: '23:28', dep: null, track: 7, type: 'FDR' },
    { station: 'BD', no: 'KA 389', name: 'Commuter Line Bandung Raya', route: 'CICALENGKA - BANDUNG', arr: '23:59', dep: null, track: 1, type: 'LOC' }
];

// ==========================================
// 3. LOGIC FUNCTIONS
// ==========================================

/**
 * Mendapatkan selisih menit dari waktu sekarang ke target waktu
 * @param {string} targetTimeStr - Waktu target format "HH:mm"
 * @param {Date} currentTimeObj - Objek Date waktu sekarang
 * @returns {number|null} Selisih menit (positif = akan datang, negatif = lewat). Null jika invalid.
 */
function getMinutesDifference(targetTimeStr, currentTimeObj) {
    if (!targetTimeStr) return null;
    const [targetH, targetM] = targetTimeStr.split(':').map(Number);
    const targetDate = new Date(currentTimeObj);
    targetDate.setHours(targetH, targetM, 0, 0);

    // Handle pergantian hari (misal jam 00:05 tapi sekarang 23:50)
    if (targetDate < currentTimeObj && (currentTimeObj.getHours() - targetH) > 12) {
        targetDate.setDate(targetDate.getDate() + 1);
    } else if (targetDate > currentTimeObj && (targetH - currentTimeObj.getHours()) > 12) {
        targetDate.setDate(targetDate.getDate() - 1);
    }

    const diffMs = targetDate - currentTimeObj;
    return Math.floor(diffMs / 60000);
}

/**
 * Parsing Rute menjadi Asal dan Tujuan
 * @param {string} routeStr - String rute (e.g., "BANDUNG - CICALENGKA")
 * @returns {object} { origin, destination }
 */
function parseRoute(routeStr) {
    const cleanRoute = routeStr.replace('->', '-'); // Normalize arrows
    const parts = cleanRoute.split('-').map(s => s.trim());
    if (parts.length >= 2) {
        return { origin: parts[0], destination: parts[1] };
    }
    return { origin: routeStr, destination: routeStr };
}

/**
 * Mendapatkan data jadwal yang diproses untuk stasiun tertentu pada waktu tertentu
 * @param {string} stationCode - 'KAC' atau 'BD'
 * @param {Date} currentTime - Objek Date waktu sekarang
 * @returns {object} Objek berisi trackData (array per jalur)
 */
function getProcessedSchedule(stationCode, currentTime) {
    const stationName = stationConfig[stationCode].name;

    // Filter kereta untuk stasiun ini
    const stationTrains = trainSchedule.filter(t => t.station === stationCode);

    // Mapping hasil proses
    const result = stationTrains.map(train => {
        const { origin, destination } = parseRoute(train.route);
        const minToArr = getMinutesDifference(train.arr, currentTime);
        const minToDep = getMinutesDifference(train.dep, currentTime);

        let displayStatus = "";
        let displayInfo = "";
        let isBlinking = false;
        let mainTime = ""; // Waktu utama yang ditampilkan (besar)

        // --- LOGIC DISPLAY UTAMA ---

        // 1. TERMINATING (Kereta berakhir di sini)
        if (destination.toUpperCase().includes(stationName) || !train.dep) {
            if (minToArr !== null && minToArr > 0 && minToArr <= 180) {
                displayStatus = `Kedatangan ${minToArr} mnt lagi`;
                displayInfo = `Dari ${origin}`; // Tulis asal stasiun
                mainTime = train.arr;
                if (minToArr < 5) isBlinking = true;
            } else if (minToArr !== null && minToArr <= 0 && minToArr > -20) {
                displayStatus = "Telah Tiba";
                displayInfo = `Dari ${origin}`;
                mainTime = train.arr;
            }
        }
        // 2. ORIGINATING (Kereta berawal dari sini)
        else if (origin.toUpperCase().includes(stationName) || !train.arr) {
            if (minToDep !== null && minToDep > 0 && minToDep <= 180) {
                displayStatus = `Berangkat ${minToDep} mnt lagi`; // Atau jam keberangkatan
                displayInfo = `Tujuan ${destination}`; // Tulis tujuan
                mainTime = train.dep;
                // Notifikasi Tutup Pintu Boarding
                if (minToDep <= stationConfig[stationCode].rules.boardingClose) {
                    displayStatus = "Boarding Ditutup";
                    isBlinking = true;
                }
            }
        }
        // 3. STOPOVER (Kereta Singgah)
        else {
            // Logika prioritas: Jika belum datang -> info kedatangan. Jika sudah datang/standby -> info keberangkatan.
            if (minToArr !== null && minToArr > 0 && minToArr <= stationConfig[stationCode].rules.stopCheck) {
                displayStatus = `Tiba ${minToArr} mnt`;
                mainTime = train.arr;
                if (minToArr < 5) isBlinking = true;
            } else {
                // Default tampilkan jam berangkat
                displayStatus = `Berangkat ${train.dep}`;
                mainTime = train.dep;
                if (minToDep !== null && minToDep > 0 && minToDep < 5) isBlinking = true;
            }
            displayInfo = `${destination} (via ${origin})`; // Tujuan & Asal
        }

        // --- FORMAT OUTPUT SPESIFIK (KCI Left / KAI Right) ---
        // Style KCI (Kiri - Commuter Line / Feeder)
        const kciStyle = {
            line1: destination, // Besar: Tujuan
            line2: `Via ${origin} - KA ${train.no.replace(/\D/g, '')}`, // Kecil: Via & No KA
            status: displayStatus, // Running text atau kolom status
            eta: mainTime
        };

        // Style KAI (Kanan - Jarak Jauh)
        const kaiStyle = {
            trainName: `${train.name} (${train.no})`,
            destination: destination,
            time: mainTime,
            platform: train.track,
            info: displayInfo // Info tambahan seperti "Dari X"
        };

        return {
            raw: train,
            track: train.track,
            status: displayStatus,
            info: displayInfo,
            time: mainTime,
            isBlinking: isBlinking,
            // Helper untuk UI membedakan jenis tampilan
            displayMode: (train.type === 'LOC' || train.type === 'FDR') ? 'KCI' : 'KAI',
            styles: {
                kci: kciStyle,
                kai: kaiStyle
            }
        };
    });

    // Filter hanya yang relevan (misal: 3 jam kedepan atau baru saja lewat)
    return result.filter(item => {
        // Tampilkan jika status ada isinya (valid timeframe)
        return item.status !== "";
    });
}

// Export agar bisa digunakan oleh file lain (jika Node.js)
if (typeof module !== 'undefined') {
    module.exports = { stationConfig, trainSchedule, getProcessedSchedule };
}