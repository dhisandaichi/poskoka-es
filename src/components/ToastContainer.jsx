import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
    success: <CheckCircle size={16} />, error: <AlertCircle size={16} />,
    info: <Info size={16} />, warning: <AlertTriangle size={16} />
};

export default function ToastContainer() {
    const context = useApp();
    const toasts = context?.toasts || [];

    if (!toasts.length) return null;
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    {icons[t.type]} {t.message}
                </div>
            ))}
        </div>
    );
}
