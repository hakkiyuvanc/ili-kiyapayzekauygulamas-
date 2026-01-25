'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Shield, FileText, Calendar, ArrowRight, LogOut, User as UserIcon, AlertTriangle, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { InsightData, User } from '@/types';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { TrendChart } from './charts/TrendChart';
import { MetricRadarChart } from './charts/MetricRadarChart';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ToneEditor } from '@/components/ToneEditor';
import { WeeklyScoreCard } from './WeeklyScoreCard';
import { CoachingWidget } from '@/components/CoachingWidget';
import { DateIdeasWidget } from '@/components/DateIdeasWidget';
import { GoalsWidget } from '@/components/GoalsWidget';
import { ConversationStartersWidget } from '@/components/ConversationStartersWidget';
import { CheckupWidget } from '@/components/CheckupWidget';
import { LoveLanguageWidget } from '@/components/LoveLanguageWidget';
import { ConflictResolutionWidget } from '@/components/ConflictResolutionWidget';


interface DashboardScreenProps {
  isPro: boolean;
  user: User | null;
  aiAvailable?: boolean;
  onStartAnalysis: () => void;
  onViewInsight: (insight: InsightData) => void;
  onUpgrade: () => void;
  onLogout: () => void;
  onStartChat: () => void;
  analysisHistory: InsightData[];
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string; color: string }) {
  return (
    <div className="ios-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-[#331A1A] mb-1">{value}</p>
      <p className="text-xs text-[#6B3F3F] font-medium">{label}</p>
    </div>
  );
}

export function DashboardScreen({ isPro, user, aiAvailable = true, onStartAnalysis, onViewInsight, onUpgrade, onLogout, onStartChat, analysisHistory }: DashboardScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const avgScore = analysisHistory.length > 0
    ? Math.round(analysisHistory.reduce((sum, a) => sum + a.score, 0) / analysisHistory.length)
    : 0;

  return (
    <div className="space-y-6 safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50"
      >

        {user && user.onboarding_completed === false && (
          <OnboardingWizard />
        )}

        {!aiAvailable && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Demo Modu Aktif</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                AI API anahtarı girilmediği için analizler <strong>mock verilerle</strong> yapılıyor. Gerçek analiz için backend .env dosyasını düzenleyin.
              </p>
            </div>
          </div>
        )}

        {/* Header with AMOR AI Branding */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="amor-logo text-2xl mb-1">
              AMOR AI
            </h1>
            <p className="text-sm text-[#6B3F3F]">
              {user ? `Merhaba, ${user.full_name.split(' ')[0]} 💕` : 'İlişki merkezi'}
            </p>
            {isPro && (
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles className="w-4 h-4 text-[#FFB6C1] fill-[#FFB6C1]" />
                <span className="text-xs text-[#B76E79] font-medium">Pro Üye</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            {user ? (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-[#FFF0F5] rounded-xl transition-colors active:scale-95"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5 text-[#B76E79]" />
              </button>
            ) : (
              !isPro && (
                <button
                  onClick={onUpgrade}
                  className="ios-button-primary px-4 py-2 text-sm"
                >
                  Giriş Yap 💗
                </button>
              )
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Heart} label="Ort. Skor 💗" value={`${avgScore}/10`} color="text-[#B76E79]" />
          <StatCard icon={FileText} label="Analiz 📊" value={analysisHistory.length.toString()} color="text-[#FF7F7F]" />
          <StatCard icon={Shield} label="Gizlilik 🔒" value="Korumalı" color="text-[#22C55E]" />

          {/* Membership Card - Special Design */}
          <div className="ios-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-5 h-5 ${isPro ? "text-[#FFB6C1]" : "text-[#B76E79]"}`} />
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-1 ${isPro
              ? "bg-gradient-to-r from-[#FFB6C1] to-[#FF7F7F] text-white"
              : "bg-gradient-to-r from-[#FFB6C1]/20 to-[#FF7F7F]/20 text-[#B76E79] border-2 border-[#FFB6C1]"
              }`}>
              {isPro ? "Pro ✨" : "Ücretsiz"}
            </div>
            <p className="text-xs text-[#6B3F3F] font-medium">Üyelik Durumu</p>
          </div>
        </div>

        {/* Main Action Button - Full Width */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartAnalysis}
          className="w-full bg-gradient-to-br from-[#B76E79] to-[#FF7F7F] text-white rounded-2xl p-6 shadow-xl group mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform">Yeni Analiz Başlat 💕</h3>
              <p className="text-white/90 text-sm">Mesaj veya dosya yükle</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl group-hover:rotate-12 transition-transform backdrop-blur-sm">
              <Plus className="w-8 h-8" />
            </div>
          </div>
        </motion.button>

        {/* Widgets Grid - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <CheckupWidget lastAnalysis={analysisHistory[0] || null} onStart={onStartAnalysis} />
          <WeeklyScoreCard />
        </div>

        {/* 3-column grid for smaller widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CoachingWidget latestAnalysis={analysisHistory[0] || null} />
          <ConversationStartersWidget />
          <DateIdeasWidget />
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <GoalsWidget initialGoals={user?.goals || []} />
          <LoveLanguageWidget currentLanguage={user?.love_language} />
        </div>

        {/* Full width widgets */}
        <div className="space-y-4 mb-6">
          <ConflictResolutionWidget />
          <ToneEditor />
        </div>

        {/* AI Coach Card */}
        {isPro ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartChat}
            className="w-full bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] text-white rounded-2xl p-6 shadow-xl group mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform">AMOR AI Koç 💬</h3>
                <p className="text-white/90 text-sm">Dertleş, soru sor, öğren</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl group-hover:-rotate-12 transition-transform backdrop-blur-sm">
                <Heart className="w-8 h-8 fill-white" />
              </div>
            </div>
          </motion.button>
        ) : (
          <div className="ios-card p-4 flex items-center justify-between opacity-75 border-2 border-[#FFB6C1]/30 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF0F5] p-2.5 rounded-xl">
                <Heart className="w-6 h-6 text-[#B76E79]" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[#331A1A]">AMOR AI Koç</h3>
                <p className="text-xs text-[#6B3F3F]">Sadece Pro üyeler için 💗</p>
              </div>
            </div>
            <button onClick={onUpgrade} className="text-xs bg-[#B76E79] text-white px-3 py-1.5 rounded-lg font-medium active:scale-95 transition-transform">
              Kilidi Aç
            </button>
          </div>
        )}

        {/* Pro Upsell Banner (if not pro) */}
        {!isPro && (
          <div onClick={onUpgrade} className="cursor-pointer bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-200">Pro'ya Yükselt</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">Detaylı öneriler ve AI koç için</p>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-500" />
          </div>
        )}

        {/* Grafikler Section */}
        {analysisHistory.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Trend Grafiği (Line) */}
            <div className="ios-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Zamanla Değişim</h3>
              </div>
              <TrendChart data={analysisHistory} />
            </div>

            {/* Son Analiz Detayı (Radar) */}
            <div className="ios-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Son Analiz Profili</h3>
              </div>
              {analysisHistory[0] && analysisHistory[0].metrics ? (
                <MetricRadarChart metrics={analysisHistory[0].metrics} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Veri yok</div>
              )}
            </div>
          </div>
        )}

        {/* Recent Analyses Title */}
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {analysisHistory.length > 0 ? 'Son Analizler' : 'Henüz Analiz Yok'}
        </h3>

        {analysisHistory.length === 0 ? (
          <div className="text-center py-8 ios-card">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">İlk analizinizi başlatın</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysisHistory.slice(0, 5).map((analysis, index) => (
              <button
                key={index}
                onClick={() => onViewInsight(analysis)}
                className="w-full ios-card hover:shadow-md p-4 flex items-center gap-4 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${analysis.score >= 75 ? 'bg-green-100 dark:bg-green-900' :
                  analysis.score >= 50 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                  <span className={`font-bold ${analysis.score >= 75 ? 'text-green-600 dark:text-green-400' :
                    analysis.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>{analysis.score}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {analysis.type === 'file' ? 'Dosya Analizi' :
                      analysis.type === 'message' ? 'Mesaj Analizi' : 'İlişki Değerlendirmesi'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{analysis.timestamp.toLocaleDateString('tr-TR')}</span>
                    {analysis.messageCount && (
                      <>
                        <span>•</span>
                        <span>{analysis.messageCount} mesaj</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pro Banner for guests */}
      {
        !user && (
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-purple-800 dark:text-purple-300">Hesap Oluştur</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Analizlerinizi kaydedin</p>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-500" />
          </button>
        )
      }


      {/* Pro Banner for logged in users */}
      {
        user && !isPro && (
          <button
            onClick={onUpgrade}
            className="w-full ios-card p-4 flex items-center gap-3 border-2 border-[#FFB6C1]/30 active:scale-98 transition-transform shadow-md"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-[#B76E79]">Pro'ya Yükselt ✨</p>
              <p className="text-xs text-[#6B3F3F]">Sınırsız analiz, AMOR AI koç</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#B76E79]" />
          </button>
        )
      }
    </div>

  );
}
