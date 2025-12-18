'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionScreen } from '@/components/SubscriptionScreen';
import { api } from '@/lib/api';
import { useAuth, useToastContext } from '../providers';

function SubscriptionPageContent() {
    const router = useRouter();
    const { updateUser } = useAuth();
    const { success, error: showError } = useToastContext();
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // Call mock upgrade API
            const response = await api.post('/subscription/upgrade', {
                plan_type: 'monthly',
                payment_method_id: 'mock_pm_123'
            });

            if (response.data.is_pro) {
                // Update local user state
                updateUser({
                    ...JSON.parse(localStorage.getItem('user') || '{}'),
                    is_pro: true
                });

                success('Pro üyelik başarıyla aktifleştirildi! 🎉');

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            }
        } catch (err) {
            console.error('Subscription error:', err);
            showError('Ödeme işlemi sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Pass loading state down if SubscriptionScreen supports it
    // For now we just block interactions or show global loader if needed
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Ödeme işleniyor...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 flex items-center justify-center">
            <div className="w-full max-w-md">
                <SubscriptionScreen
                    onBack={handleBack}
                    onSubscribe={handleSubscribe}
                />
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SubscriptionPageContent />
        </Suspense>
    );
}
