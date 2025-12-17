'use client';

import { useRouter } from 'next/navigation';
import { FileUploadScreen } from '@/components/FileUploadScreen';
import { analysisApi } from '@/lib/api';
import { useToastContext } from '../../providers';

export default function FileAnalysisPage() {
    const router = useRouter();
    const { info, success, error } = useToastContext();

    const handleSubmit = async (file: File) => {
        info('Dosya analiz ediliyor...');

        try {
            const response = await analysisApi.uploadAndAnalyze(file, true);
            const result = response.data;

            if (result.analysis_id) {
                success('Dosya analizi tamamlandı!');
                router.push(`/analysis/result?id=${result.analysis_id}`);
            } else {
                error('Analiz ID alınamadı');
            }

        } catch (err) {
            console.error('File analysis failed:', err);
            error('Dosya analizi sırasında bir hata oluştu');
        }
    };

    const handleBack = () => {
        router.push('/analysis/new');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <FileUploadScreen
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
