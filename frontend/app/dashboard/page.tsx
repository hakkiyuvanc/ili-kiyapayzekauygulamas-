'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardScreen } from '@/components/DashboardScreen';
import { analysisApi, systemApi } from '@/lib/api';
import { useAuth, useToastContext } from '../providers';

import { InsightData, AnalysisType } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, isLoading: authLoading } = useAuth();
    const { info } = useToastContext();
    const [analysisHistory, setAnalysisHistory] = useState<InsightData[]>([]);
    const [aiAvailable, setAiAvailable] = useState(true);

    useEffect(() => {
        const checkSystem = async () => {
            try {
                const res = await systemApi.getStatus();
                setAiAvailable(res.data.ai_available);
            } catch (e) {
                console.error("System check failed", e);
            }
        };
        checkSystem();
    }, []);

    useEffect(() => {
        const loadAnalysisHistory = async () => {
            try {
                const response = await analysisApi.getHistory(0, 10);
                const history = response.data.map((item: any) => ({
                    type: (item.format_type === 'whatsapp' ? 'file' : 'message') as AnalysisType,
                    score: item.overall_score,
                    metrics: { communication: 70, emotional: 75, compatibility: 72, conflict: 40 }, // API might not return full metrics in list view
                    findings: [],
                    recommendations: [],
                    riskAreas: [],
                    strengths: [],
                    timestamp: new Date(item.created_at),
                    messageCount: item.message_count,
                    analysisId: item.id,
                }));
                setAnalysisHistory(history);
            } catch (err) {
                console.error('Failed to load history:', err);
            }
        };

        if (!authLoading && !user) {
            // Guest logic
        }

        if (user) {
            loadAnalysisHistory();
        }
    }, [user, authLoading]);


    const handleStartAnalysis = () => {
        router.push('/analysis/new'); // New route for selecting analysis type
    };

    const handleViewInsight = (insight: InsightData) => {
        // Navigate to detailed view
        if (insight.analysisId) {
            router.push(`/analysis/result?id=${insight.analysisId}`);
        } else {
            // Handle guest insights or those without ID (mock)
            console.warn("No ID for insight, cannot navigate");
        }
    };

    const handleUpgrade = () => {
        router.push('/subscription');
    };

    const handleLogout = () => {
        logout();
        info('Çıkış yapıldı');
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md">
                <DashboardScreen
                    isPro={user?.is_pro || false}
                    user={user}
                    aiAvailable={aiAvailable}
                    onStartAnalysis={handleStartAnalysis}
                    onViewInsight={handleViewInsight}
                    onUpgrade={handleUpgrade}
                    onLogout={handleLogout}
                    analysisHistory={analysisHistory}
                />
            </div>
        </div>
    );
}
