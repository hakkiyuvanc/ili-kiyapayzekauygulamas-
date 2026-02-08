'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AnalysisResult from '@/components/AnalysisResult';
import { analysisApi, type AnalysisResponse, type V2AnalysisResult } from '@/lib/api';
import { useAuth, useToastContext } from '../../providers';

function AnalysisResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const source = searchParams.get('source'); // 'local' or 'remote'

    const { user } = useAuth();
    const { error } = useToastContext();

    const [result, setResult] = useState<AnalysisResponse | V2AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadAnalysis(Number(id));
        }
    }, [id, source]);

    const loadAnalysis = async (analysisId: number) => {
        try {
            let data: AnalysisResponse | V2AnalysisResult | null = null;

            if (source === 'local' && window.electronAPI) {
                // Load from local DB
                const localData = await window.electronAPI.getAnalysisDetail(analysisId);
                // localData structure: { id, data: {...analysis_report}, created_at, type }
                if (localData && localData.data) {
                    const report = localData.data;
                    // Ensure analysis_id is set
                    if (!report.analysis_id) {
                        report.analysis_id = localData.id;
                    }
                    data = report;
                }
            } else {
                // Load from Backend API
                const response = await analysisApi.getAnalysis(analysisId);
                data = response.data;
            }

            if (data) {
                setResult(data);
            } else {
                error('Analiz bulunamadı');
            }
        } catch (err) {
            console.error('Failed to load analysis:', err);
            error('Analiz yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/dashboard');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Sonuçlar Yükleniyor...</div>;
    }

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-xl mb-4 text-gray-600">Sonuç bulunamadı.</div>
                <button onClick={handleBack} className="text-blue-500 hover:underline">
                    Kontrol Paneline Dön
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 transition-colors">
            <div className="w-full max-w-7xl mx-auto">
                <div className="mb-4">
                    <button
                        onClick={handleBack}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                        ← Geri Dön
                    </button>
                </div>
                <AnalysisResult result={result} />
            </div>
        </div>
    );
}

export default function AnalysisResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
            <AnalysisResultContent />
        </Suspense>
    );
}
