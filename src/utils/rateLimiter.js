/**
 * Simple Client-Side Rate Limiter
 * Menggunakan localStorage untuk menyimpan hitungan request.
 * 
 * @param {string} key - Identifier unik untuk aksi (misal: 'login_attempt')
 * @param {number} maxRequests - Jumlah maksimal request yang diizinkan
 * @param {number} windowMs - Jendela waktu dalam milidetik (misal: 60000 untuk 1 menit)
 * @returns {boolean} - true jika diizinkan, false jika diblokir
 */
export const checkRateLimit = (key, maxRequests, windowMs) => {
    try {
        const now = Date.now();
        const record = JSON.parse(localStorage.getItem(key) || 'null');

        // Jika belum ada record atau window waktu sudah lewat -> Reset
        if (!record || now - record.startTime > windowMs) {
            localStorage.setItem(key, JSON.stringify({ count: 1, startTime: now }));
            return true; // Allowed
        }

        // Jika masih dalam window waktu
        if (record.count >= maxRequests) {
            return false; // Blocked (Rate Limit Hit)
        }

        // Increment count
        record.count++;
        localStorage.setItem(key, JSON.stringify(record));
        return true;

    } catch (e) {
        console.error("Rate limiter error", e);
        return true; // Fail safe: allow request if localstorage fails
    }
};
