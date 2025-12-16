'use client';

import { useRouter } from 'next/navigation';
import { MessageAnalysisScreen } from '@/components/MessageAnalysisScreen';
import { analysisApi } from '@/lib/api';
import { useToastContext } from '../../providers';

export default function MessageAnalysisPage() {
    const router = useRouter();
    const { info, success, error } = useToastContext();

    const handleSubmit = async (message: string) => {
        info('Analiz başlatılıyor...');

        try {
            const response = await analysisApi.analyze({
                text: message,
                format_type: 'plain',
                privacy_mode: true,
            });

            const result = response.data;

            // Store result temporally if needed, or just navigate to result page with ID.
            // The API returns analysis_id if saved to DB.
            if (result.analysis_id) {
                success('Analiz tamamlandı!');
                router.push(`/analysis/result/${result.analysis_id}`);
            } else {
                // If no ID (e.g. guest mode without DB save?), we might need to pass state via query params or context.
                // For now assume ID is returned.
                error('Analiz ID alınamadı');
            }

        } catch (err) {
            console.error('Analysis failed:', err);
            error('Analiz sırasında bir hata oluştu');
        }
    };

    const handleBack = () => {
        router.push('/analysis/new');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <MessageAnalysisScreen
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
