'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Shield, Zap, FileText, Calendar, ArrowRight, LogOut, User as UserIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { InsightData, User } from '@/types';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { TrendChart } from './charts/TrendChart';
import { MetricRadarChart } from './charts/MetricRadarChart';

interface DashboardScreenProps {
  isPro: boolean;
  user: User | null;
  aiAvailable?: boolean;
  onStartAnalysis: () => void;
  onViewInsight: (insight: InsightData) => void;
  onUpgrade: () => void;
  onLogout: () => void;
  analysisHistory: InsightData[];
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string; color: string }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-slate-600">
      <Icon className={`w-5 h-5 ${color} mb-1`} />
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function DashboardScreen({ isPro, user, aiAvailable = true, onStartAnalysis, onViewInsight, onUpgrade, onLogout, analysisHistory }: DashboardScreenProps) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300"
    >

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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {user ? `Merhaba, ${user.full_name.split(' ')[0]}!` : 'İlişki Analiz AI'}
          </h1>
          {isPro && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm text-amber-600">Pro Üye</span>
            </div>
          )}
          {!user && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Misafir Mod</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {user ? (
            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          ) : (
            !isPro && (
              <button
                onClick={onUpgrade}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm hover:shadow-lg transition-all"
              >
                Giriş Yap
              </button>
            )
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Ortalama Skor"
          value={avgScore > 0 ? String(avgScore) : '-'}
          color="text-green-500"
        />
        <StatCard
          icon={FileText}
          label="Toplam Analiz"
          value={String(analysisHistory.length)}
          color="text-blue-500"
        />
        <StatCard
          icon={Shield}
          label="İlişki Sağlığı"
          value={avgScore >= 70 ? 'İyi' : avgScore >= 50 ? 'Orta' : avgScore > 0 ? 'Düşük' : '-'}
          color="text-purple-500"
        />
      </div>

      {/* Grafikler Section */}
      {analysisHistory.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Trend Grafiği (Line) */}
          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Zamanla Değişim</h3>
            </div>
            <TrendChart data={analysisHistory} />
          </div>

          {/* Son Analiz Detayı (Radar) */}
          <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
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

      {/* New Analysis CTA */}
      <button
        onClick={onStartAnalysis}
        className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-5 mb-6 flex items-center justify-between group hover:shadow-xl transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-lg">Yeni Analiz Başlat</h3>
            <p className="text-sm text-white/80">Mesaj veya dosya analizi yap</p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Recent Analyses */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {analysisHistory.length > 0 ? 'Son Analizler' : 'Henüz Analiz Yok'}
        </h3>

        {analysisHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-700 rounded-xl">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">İlk analizinizi başlatın</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysisHistory.slice(0, 5).map((analysis, index) => (
              <button
                key={index}
                onClick={() => onViewInsight(analysis)}
                className="w-full bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-xl p-4 flex items-center gap-4 transition-colors text-left"
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
      </div>

      {/* Pro Banner for guests */}
      {!user && (
        <button
          onClick={onUpgrade}
          className="w-full mt-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700 rounded-2xl p-4 flex items-center gap-3"
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
      )}

      {/* Pro Banner for logged in users */}
      {user && !isPro && (
        <button
          onClick={onUpgrade}
          className="w-full mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-amber-800 dark:text-amber-300">Pro'ya Yükselt</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Sınırsız analiz, detaylı raporlar</p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-500" />
        </button>
      )}
    </motion.div>
  );
}
