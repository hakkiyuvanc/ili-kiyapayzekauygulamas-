'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type V2AnalysisResult, type RelationshipAnalysis, chatApi } from '@/lib/api';
import { generatePDF } from '@/lib/pdf';
import { useAuth } from '@/app/providers';
import { Heart, AlertTriangle, Users, Scale, Download, Sparkles, MessageCircleHeart, Info, Lock } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import RelationshipHealthPanel from './dashboard/RelationshipHealthPanel';
import HeatmapChart from './magic/HeatmapChart';
import { GlassCard } from './LottieAnimation';
import { GottmanRadarChart, MetricCards, CircularProgress, MultiCircularProgress } from './charts';
import { StreamingInsightsList } from './StreamingUI';
import { ProGate } from './ProGate';
import { FEATURE_NAMES } from '@/lib/proMemberCheck';

interface AnalysisResultProps {
  result: V2AnalysisResult | RelationshipAnalysis;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleChatWithCoach = async () => {
    if (!user?.is_pro) {
      router.push('/subscription');
      return;
    }

    setIsCreatingChat(true);
    try {
      const analysisId = 'analysis_id' in result ? result.analysis_id : undefined;
      const response = await chatApi.createSession({
        title: `Analiz Sohbeti - ${new Date().toLocaleDateString('tr-TR')}`,
        analysis_id: analysisId
      });
      router.push(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create chat session:', error);
      setIsCreatingChat(false);
    }
  };

  // Type guard to check if it's V2 result
  const isV2 = (res: any): res is V2AnalysisResult => {
    return 'gottman_report' in res;
  };

  const overallScore = isV2(result)
    ? result.gottman_report.genel_karne.iliskki_sagligi
    : result.overall_score * 10; // Convert 0-10 to 0-100

  const summary = isV2(result)
    ? result.gottman_report.genel_karne.baskin_dinamik
    : result.summary || "İlişki analizi tamamlandı.";

  const riskLevel = isV2(result)
    ? result.gottman_report.genel_karne.risk_seviyesi
    : "";

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      await generatePDF('analysis-report', `amor-ai-report-${date}`);
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#22C55E]';
    if (score >= 50) return 'text-[#FF7F7F]';
    return 'text-[#B76E79]';
  };

  const chartData = [
    {
      name: 'Genel Skor',
      score: overallScore,
      fill: overallScore >= 70 ? '#22c55e' : overallScore >= 50 ? '#FF7F7F' : '#B76E79',
    },
  ];

  const chartFillColor = chartData[0]?.fill ?? '#B76E79';

  const chartMetrics = isV2(result) ? {
    sevgi_haritalari: result.gottman_report.gottman_bilesenleri.sevgi_haritalari.skor,
    hayranlik_paylasimi: result.gottman_report.gottman_bilesenleri.hayranlik_paylasimi.skor,
    yakinlasma_cabalari: result.gottman_report.gottman_bilesenleri.yakinlasma_cabalari.skor,
    olumlu_perspektif: result.gottman_report.gottman_bilesenleri.olumlu_perspektif.skor,
    catisma_yonetimi: result.gottman_report.gottman_bilesenleri.catisma_yonetimi.skor,
    hayat_hayalleri: result.gottman_report.gottman_bilesenleri.hayat_hayalleri.skor,
    ortak_anlam: result.gottman_report.gottman_bilesenleri.ortak_anlam.skor,
  } : null;

  return (
    <div id="analysis-report" className="space-y-6 safe-bottom px-4 bg-romantic-gradient-soft min-h-screen py-8">
      {/* Header */}
      <div className="text-center mb-6 animate-fadeIn">
        <h1 className="amor-logo text-2xl mb-1">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm">İlişki Analiz Raporu V2.0</p>
      </div>

      {/* Overall Score Card */}
      <div className="ios-card-elevated animate-slideUp">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#331A1A]">İlişki Sağlığı 💗</h2>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 bg-[#FFF0F5] hover:bg-[#FFB6C1]/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className={`w-5 h-5 text-[#B76E79] ${isDownloading ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col items-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {/* Replaced RadialBar with CircularProgress for a cleaner look if preferred, but keeping compatible styling for now. 
                     Actually, let's use the new CircularProgress here to demonstrate Stage 4 update */}
                <div className="flex items-center justify-center p-4">
                  <CircularProgress
                    value={overallScore}
                    size={180}
                    strokeWidth={15}
                    color={overallScore >= 70 ? '#22c55e' : overallScore >= 50 ? '#FF7F7F' : '#B76E79'}
                    showPercentage={false} // We show custom center
                  />
                </div>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore.toFixed(0)}
              </div>
              <div className="text-[#6B3F3F] text-xs mt-1">/ 100</div>
              <div className="text-[#6B3F3F] text-xs mt-1 font-semibold">{riskLevel}</div>
            </div>
          </div>

          <p className="text-center text-[#331A1A] mt-2 font-medium bg-white/50 py-2 px-4 rounded-xl border border-pink-200">
            {summary}
          </p>
        </div>
      </div>

      {/* V2 Specific Components */}
      {isV2(result) && chartMetrics && (
        <>
          {/* Heatmap (Stage 4) */}
          {result.heatmap && (
            <div className="animate-fadeIn delay-50 mb-6">
              <HeatmapChart initialData={result.heatmap} />
            </div>
          )}

          {/* New V3.0 Metric Cards */}
          <div className="animate-fadeIn delay-75 mb-6">
            <MetricCards
              generalReport={result.gottman_report.genel_karne as any}
              emotionalAnalysis={result.gottman_report.duygusal_analiz as any}
            />
          </div>

          {/* New V3.0 Gottman Radar Chart */}
          <div className="animate-fadeIn delay-100 mb-6">
            <GottmanRadarChart metrics={result.gottman_report.gottman_bilesenleri as any} />
          </div>

          {/* New Stage 4: Circular Progress for Key Metrics */}
          <div className="mb-6 animate-fadeIn delay-150">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Duygusal Zeka Göstergeleri
              </h3>
              <MultiCircularProgress
                size={90}
                metrics={[
                  { label: 'Yakınlık', value: result.gottman_report.duygusal_analiz.yakinlik || 0, color: '#F472B6' },
                  { label: 'Empati', value: result.gottman_report.duygusal_analiz.empati_puani || 0, color: '#A78BFA' },
                  { label: 'Pozitiflik', value: 100 - (result.gottman_report.duygusal_analiz.toksisite_seviyesi || 0), color: '#34D399' },
                  { label: 'İletişim', value: result.gottman_report.gottman_bilesenleri.sevgi_haritalari.skor || 0, color: '#60A5FA' },
                ]}
              />
            </GlassCard>
          </div>

          {/* Streaming Patterns (Stage 4) */}
          <div className="mb-6 animate-fadeIn delay-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 ml-1">Tespit Edilen Kalıplar</h3>
            <StreamingInsightsList
              insights={result.gottman_report.tespit_edilen_kaliplar.map(p => ({
                category: p.etki || 'Analiz',
                title: p.kalip,
                description: `Frekans: ${p.frekans} - ${p.ornekler.join(', ')}`,
                icon: p.etki === 'Negatif' ? '⚠️' : '💡'
              }))}
            />
          </div>

          {/* Advanced V2 Components - Gated (Stage 4) */}
          <ProGate feature={FEATURE_NAMES.HISTORY} user={user} showUpgradePrompt={false}>
            <div className="animate-fadeIn delay-300">
              <RelationshipHealthPanel metrics={chartMetrics} />
            </div>
          </ProGate>

          {/* Action Items */}
          <div className="mb-6 animate-fadeIn delay-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 ml-1">Aksiyon Önerileri</h3>
            <div className="space-y-3">
              {result.gottman_report.aksiyon_onerileri.map((action, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border-l-4 border-l-green-400 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex justify-between">
                    {action.baslik}
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-normal">{action.kategori}</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 italic">"{action.ornek_cumle}"</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* AI Coach CTA */}
      <GlassCard className="bg-gradient-to-r from-rose-400 to-pink-500 text-white border-none animate-fadeIn delay-500">
        <div className="p-4 flex flex-col items-center text-center">
          <MessageCircleHeart className="w-10 h-10 mb-2 text-white/90" />
          <h3 className="text-lg font-bold mb-1">AI İlişki Koçuna Danış</h3>
          <p className="text-white/80 text-sm mb-3">Bu rapor hakkında daha fazla detay öğrenmek ister misin?</p>
          <button
            onClick={handleChatWithCoach}
            disabled={isCreatingChat}
            className="w-full bg-white text-pink-500 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {isCreatingChat ? (
              <span className="animate-pulse">Oluşturuluyor...</span>
            ) : (
              <>
                {!user?.is_pro && <Lock className="w-4 h-4" />}
                {user?.is_pro ? "Sohbete Başla" : "Pro'ya Yükseltip Başla"}
              </>
            )}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
