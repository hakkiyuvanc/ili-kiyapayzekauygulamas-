'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InsightsScreen } from '@/components/InsightsScreen';
import { analysisApi } from '@/lib/api';
import { useAuth, useToastContext } from '../../providers';
// Use types from dashboard or a shared type file
import { InsightData, AnalysisType } from '@/types';

function AnalysisResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { user } = useAuth();
    const { error } = useToastContext();

    const [insight, setInsight] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadAnalysis(Number(id));
        }
    }, [id]);

    const loadAnalysis = async (analysisId: number) => {
        try {
            const response = await analysisApi.getAnalysis(analysisId);
            const result = response.data;

            // Handle nested full_report structure from history endpoint
            const sourceData = result.full_report || result;

            const mappedInsight: InsightData = {
                type: 'message', // Default or need to map from result
                score: result.overall_score,
                metrics: {
                    communication: result.metrics?.sentiment?.score || 70,
                    emotional: result.metrics?.empathy?.score || 75,
                    compatibility: result.metrics?.we_language?.score || 72,
                    conflict: result.metrics?.conflict?.score || 40,
                },
                findings: sourceData.insights?.map((i: { title: string }) => i.title) || [],
                recommendations: sourceData.recommendations?.map((r: { title: string }) => r.title) || [],
                riskAreas: [], // Derived or from insights?
                strengths: sourceData.insights?.filter((i: any) => i.category === 'Güçlü Yön').map((i: any) => i.title) || [],
                timestamp: new Date(result.created_at || new Date()),
                analysisId: result.id || result.analysis_id, // Handle both id formats
                replySuggestions: sourceData.reply_suggestions || [],
                messageCount: sourceData.conversation_stats?.total_messages || 0,
                timeRange: 'Son 30 gün' // Placeholder or calculate from stats
            };

            setInsight(mappedInsight);
        } catch (err) {
            console.error('Failed to load analysis:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/dashboard');
    };

    const handleUpgrade = () => {
        router.push('/subscription');
    };

    const handleChat = () => {
        if (insight?.analysisId) {
            router.push(`/chat?analysis_id=${insight.analysisId}`);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Sonuçlar Yükleniyor...</div>;
    }

    if (!insight) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div>Sonuç bulunamadı.</div>
                <button onClick={handleBack} className="mt-4 text-blue-500">Geri Dön</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <InsightsScreen
                    insight={insight}
                    isPro={user?.is_pro || false}
                    onBack={handleBack}
                    onUpgrade={handleUpgrade}
                    onChat={handleChat}
                />
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
