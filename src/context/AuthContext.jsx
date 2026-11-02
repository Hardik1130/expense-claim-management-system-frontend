
import { createContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
    login as loginApi,
    register as registerApi,
    logout as logoutApi
} from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('currentUser'));
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    const persist = (data) => {
        const loggedInUser = {
            id: data.userId,
            name: data.name,
            email: data.email,
            role: data.role
        };

        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        setUser(loggedInUser);
    };

    const signIn = async (email, password) => {
        setLoading(true);

        try {
            const response = await loginApi({ email, password });
            const data = response.data.data;

            persist(data);
            toast.success('Login successful');
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (payload) => {
        const response = await registerApi(payload);
        return response.data;
    };

    const signOut = async () => {
        const refreshToken = localStorage.getItem('refreshToken');

        try {
            if (refreshToken) {
                await logoutApi({ refreshToken });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    useEffect(() => {
        const handleLogout = () => signOut();

        window.addEventListener('auth:logout', handleLogout);

        return () => {
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        signIn,
        signUp,
        signOut,
        demo: false
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

