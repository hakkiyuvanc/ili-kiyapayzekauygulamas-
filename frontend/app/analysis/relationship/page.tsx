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
            // Use V2 Analysis
            const response = await analysisApi.analyzeV2(text);
            const result = response.data;

            let analysisId = result.analysis_id;
            let source = 'remote';

            // Save locally if in Electron
            if (window.electronAPI) {
                try {
                    const saved = await window.electronAPI.saveAnalysis(result);
                    if (saved && saved.success) {
                        analysisId = saved.id;
                        source = 'local';
                    }
                } catch (e) {
                    console.error('Failed to save to local DB', e);
                }
            }

            if (analysisId) {
                success('Değerlendirme tamamlandı!');
                router.push(`/analysis/result?id=${analysisId}&source=${source}`);
            } else {
                // If no ID (guest + no local DB), pass result via state? 
                // Router push doesn't support state easily. 
                // For now, require ID. Guest users on web might fail if backend doesn't return ID.
                // But backend returns ID for guests too (create_analysis uses user_id=None).
                // Wait, backend create_analysis allows user_id=None.
                error('Analiz ID alınamadı');
            }
        } catch (err) {
            console.error('Assessment failed:', err);
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
