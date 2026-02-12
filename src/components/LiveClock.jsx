import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (d) => {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    return (
        <div className="flex items-center gap-sm">
            <div className="clock-display">
                <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(now)}</span>
        </div>
    );
}
