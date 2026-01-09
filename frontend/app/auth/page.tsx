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
            // 1. Login
            const response = await authApi.login({ username: email, password });
            const { access_token } = response.data;

            // Save token temporarily
            localStorage.setItem('token', access_token);

            // 2. Immediate verification (Get Profile)
            try {
                const profileResponse = await authApi.getProfile();
                const user = profileResponse.data;
                // Save user data
                localStorage.setItem('user', JSON.stringify({ ...user, is_pro: user.is_pro || false }));

                success('Giriş başarılı, yönlendiriliyorsunuz...');

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 500);

            } catch (profileErr: any) {
                console.error("Profile fetch failed immediately:", profileErr);
                console.error("Profile error details:", profileErr.response?.data);
                // Check specific error
                if (profileErr.response?.status === 401) {
                    setAuthError('Oturum açılamadı (Token reddedildi). Lütfen tekrar deneyin.');
                } else {
                    setAuthError('Giriş yapıldı fakat profil alınamadı. Bağlantınızı kontrol edin.');
                }
                // localStorage.removeItem('token'); // Keep token for debugging
            }

        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Giriş başarısız';

            if (err.response?.status === 403 && errorMessage.includes('doğrulamanız')) {
                info('Lütfen önce email adresinizi doğrulayın.');
                router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                return;
            }

            setAuthError(errorMessage);
            showError(errorMessage);
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
            success('Kayıt başarılı! Lütfen emailinizi doğrulayın.');
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
        <div className="min-h-screen bg-romantic-gradient-soft flex items-center justify-center p-4 safe-top safe-bottom">
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
