import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);


export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);

    // 1. Listen for Supabase Auth changes
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) fetchProfile(session.user.id);
            else {
                setUser(null);
                setLoading(false);
            }
        });

        // Listen for changes (login, logout, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) fetchProfile(session.user.id);
            else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Fetch extended profile from 'volunteers' table
    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('volunteers')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If profile doesn't exist yet (e.g. new signup), user might be null or partial
                // You might want to redirect to a "Finish Profile" page here
            }

            if (data) {
                setUser({ ...data, email: data.email }); // Combine auth email with profile data
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const switchRole = (role) => {
        if (user) setUser({ ...user, role });
    };

    return (
        <AppContext.Provider value={{ user, loading, logout, addToast, toasts, switchRole }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
