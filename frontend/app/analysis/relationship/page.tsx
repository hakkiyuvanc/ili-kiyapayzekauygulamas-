'use client';

import { useRouter } from 'next/navigation';
import { RelationshipAssessmentScreen } from '@/components/RelationshipAssessmentScreen';
import { analysisApi } from '@/lib/api';
import { useToastContext } from '../../providers';

export default function AssessmentPage() {
    const router = useRouter();
    const { info, success, error } = useToastContext();

    const handleSubmit = async (answers: Record<string, string>) => {
        info('Değerlendirme analiz ediliyor...');

        // Convert answers to text for analysis
        const text = Object.entries(answers)
            .map(([q, a]) => `${q}: ${a}`)
            .join('\n');

        try {
            const response = await analysisApi.analyze({
                text: text,
                format_type: 'plain',
                privacy_mode: true,
            });

            const result = response.data;

            if (result.analysis_id) {
                success('Değerlendirme tamamlandı!');
                router.push(`/analysis/result?id=${result.analysis_id}`);
            } else {
                error('Analiz ID alınamadı');
            }
        } catch (err) {
            console.error('Assessment failed:', err);
            // Removed mock fallback for proper error handling, or implementation plan should be followed.
            // Assuming consistent API behavior for now.
            error('Analiz başarısız oldu');
        }
    };

    const handleBack = () => {
        router.push('/analysis/new');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <RelationshipAssessmentScreen
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
