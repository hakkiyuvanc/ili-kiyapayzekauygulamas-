'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthScreen } from '@/components/AuthScreen';
import { authApi } from '@/lib/api';
import { useAuth, useToastContext } from '../providers';

export default function AuthPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { success, error: showError, info } = useToastContext();

    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        setAuthError('');

        try {
            const response = await authApi.login({ username: email, password });
            const { access_token } = response.data;

            const profileResponse = await authApi.getProfile();
            // Need to supply the token manually to getProfile if it relies on localStorage which might not be set yet?
            // Actually api.ts interceptor reads from localStorage.
            // So we should set token first. But `login` in context does that.
            // We can manually set it here temporarily or update api.ts to take token.
            // Easiest is to set localStorage here first before calling getProfile.

            localStorage.setItem('token', access_token);

            // Use a separate api call or assume interceptor picks it up
            // Ideally we pass token to getProfile or interceptor works.
            // Interceptor reads localStorage.setItem is sync. It should work.
            const userProfile = await authApi.getProfile();

            login(access_token, userProfile.data);
            success('Hoş geldiniz, ' + userProfile.data.full_name + '!');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Giriş başarısız';
            setAuthError(errorMessage);
            showError(errorMessage);
            // Clean up if failed
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (email: string, password: string, fullName: string) => {
        setIsLoading(true);
        setAuthError('');

        try {
            await authApi.register({ email, password, full_name: fullName });
            success('Kayıt başarılı! Giriş yapılıyor...');
            await handleLogin(email, password);
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Kayıt başarısız';
            setAuthError(errorMessage);
            showError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleContinueAsGuest = () => {
        info('Misafir olarak devam ediyorsunuz');
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <AuthScreen
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                    onContinueAsGuest={handleContinueAsGuest}
                    isLoading={isLoading}
                    error={authError}
                />
            </div>
        </div>
    );
}
