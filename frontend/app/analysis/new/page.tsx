'use client';

import { useRouter } from 'next/navigation';
import { AnalysisTypeScreen } from '@/components/AnalysisTypeScreen';
import { useAuth } from '../../providers';

export default function NewAnalysisPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isPro = user?.is_pro || false;

    const handleSelectType = (type: 'message' | 'file' | 'relationship') => {
        router.push(`/analysis/${type}`);
    };

    const handleBack = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <AnalysisTypeScreen
                    onSelectType={handleSelectType}
                    onBack={handleBack}
                    isPro={isPro}
                />
            </div>
        </div>
    );
}
