'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/lib/api';

// --- Types ---
interface User {
    id: number;
    email: string;
    full_name: string;
    is_pro: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (userData: User) => void;
}

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    // Verify token validity or just load local state
                    // For now, load local state to be fast
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/auth');
    };

    const updateUser = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- Toast Context ---
// We can expose the toast methods globally if needed, or just wrap the container here.
// For simplicity, we'll keep useToast local to components or create a context if deeply nested components need it.
// Actually, creating a ToastContext is better so deep components don't need prop drilling.

interface ToastContextType {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const { toasts, success, error, info, warning, removeToast } = useToast();

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            <ToastContainer toasts={toasts} onClose={removeToast} />
            {children}
        </ToastContext.Provider>
    );
}

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};

// --- Main Providers Wrapper ---
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ToastProvider>
    );
}
