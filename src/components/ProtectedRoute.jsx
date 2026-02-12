import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading } = useApp();

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/401" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return children;
}
