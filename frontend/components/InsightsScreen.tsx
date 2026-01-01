import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Share2, Download, Lock, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Check, Bot } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { InsightData } from '@/types';
import { InsightsSkeleton } from '@/components/SkeletonLoader';

interface InsightsScreenProps {
  insight: InsightData;
  isPro: boolean;
  onBack: () => void;
  onUpgrade: () => void;
  onChat: () => void;
}

export function InsightsScreen({ insight, isPro, onBack, onUpgrade, onChat }: InsightsScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Component mounted
    isMountedRef.current = true;

    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }, 600);

    return () => {
      // Component unmounting
      isMountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  const radarData = [
    { metric: 'İletişim', value: insight.metrics.communication },
    { metric: 'Duygusal', value: insight.metrics.emotional },
    { metric: 'Uyumluluk', value: insight.metrics.compatibility },
    { metric: 'Çatışma', value: 100 - insight.metrics.conflict }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'Mükemmel';
    if (score >= 50) return 'İyi';
    return 'Geliştirilmeli';
  };

  const handleShare = async () => {
    const shareText = `İlişki Analiz Skorum: ${insight.score}/100\nİletişim: ${insight.metrics.communication}\nDuygusal Bağ: ${insight.metrics.emotional}\n\n#İlişkiAnalizi`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        console.log('Paylaşım iptal edildi');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = `
İlişki Analiz Raporu
─────────────────────

Genel Skor: ${insight.score}/100
${getScoreLabel(insight.score)}

Metrikler:
• İletişim: ${insight.metrics.communication}/100
• Duygusal Bağ: ${insight.metrics.emotional}/100
• Uyumluluk: ${insight.metrics.compatibility}/100
• Çatışma Yönetimi: ${100 - insight.metrics.conflict}/100

${insight.type === 'file' ? `
Analiz Detayları:
• Mesaj Sayısı: ${insight.messageCount}
• Zaman Aralığı: ${insight.timeRange}
` : ''}

Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iliski-analizi-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <h2 className="text-gray-900 dark:text-white font-semibold">Analiz Sonucu</h2>

        <div className="flex gap-2">
          {isPro && (
            <button
              onClick={onChat}
              className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium mr-1"
              title="Koç ile Konuş"
            >
              <Bot className="w-5 h-5" />
              <span className="hidden sm:inline">Konuş</span>
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Paylaş"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
          </button>
          {isPro && (
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="İndir"
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Score Circle */}
      <div className="text-center mb-6">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-slate-600"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={352}
              strokeDashoffset={352 - (352 * insight.score) / 100}
              className={`${getScoreColor(insight.score)} transition-all duration-1000`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute">
            <p className={`text-3xl font-bold ${getScoreColor(insight.score)}`}>{insight.score}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">/ 100</p>
          </div>
        </div>
        <p className={`mt-2 font-medium ${getScoreColor(insight.score)}`}>
          {getScoreLabel(insight.score)}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview'
            ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400'
            }`}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'details'
            ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400'
            }`}
        >
          Detaylar
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Radar Chart */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-4 mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Metrikler"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights */}
          <div className="space-y-3">
            {/* Strengths */}
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Güçlü Yönler</h4>
              </div>
              <ul className="space-y-1">
                {insight.strengths.slice(0, 2).map((strength, i) => (
                  <li key={i} className="text-sm text-green-700 dark:text-green-400">• {strength}</li>
                ))}
              </ul>
            </div>

            {/* Risk Areas */}
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-medium text-amber-800 dark:text-amber-300">Dikkat Edilmesi Gerekenler</h4>
              </div>
              <ul className="space-y-1">
                {insight.riskAreas.slice(0, 2).map((risk, i) => (
                  <li key={i} className="text-sm text-amber-700 dark:text-amber-400">• {risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Metric Details */}
          <div className="space-y-4 mb-6">
            {(['communication', 'emotional', 'compatibility', 'conflict'] as const).map((key) => {
              const labels: Record<string, string> = {
                communication: 'İletişim Kalitesi',
                emotional: 'Duygusal Bağ',
                compatibility: 'Uyumluluk',
                conflict: 'Çatışma Riski'
              };

              const value = insight.metrics[key];
              const displayValue = key === 'conflict' ? 100 - value : value;

              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{labels[key]}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{displayValue}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${displayValue >= 70 ? 'bg-green-500' : displayValue >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${displayValue}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              <h4 className="font-medium text-indigo-800 dark:text-indigo-300">Öneriler</h4>
            </div>
            {isPro ? (
              <ul className="space-y-2">
                {insight.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-indigo-700 dark:text-indigo-400 flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
                  Detaylı öneriler için Pro'ya yükseltin
                </p>
                <button
                  onClick={onUpgrade}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                >
                  Pro'ya Geç
                </button>
              </div>
            )}
          </div>

          {/* Reply Suggestions */}
          {insight.replySuggestions && insight.replySuggestions.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-800 dark:text-purple-300">Örnek Cevaplar</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Bu duruma verebileceğin bazı yapıcı cevaplar:
              </p>
              <div className="space-y-3">
                {insight.replySuggestions.map((suggestion, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50 shadow-sm relative group">
                    <p className="text-sm text-gray-800 dark:text-gray-200 pr-8">"{suggestion}"</p>
                    <button
                      onClick={async (e) => {
                        try {
                          await navigator.clipboard.writeText(suggestion);
                          // Show success feedback
                          const button = e.currentTarget as HTMLButtonElement;
                          const originalContent = button.innerHTML;
                          button.innerHTML = '<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                          setTimeout(() => {
                            button.innerHTML = originalContent;
                          }, 2000);
                        } catch (err) {
                          console.error('Failed to copy to clipboard:', err);
                          // Could show error toast here
                        }
                      }}
                      className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Kopyala"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* File Analysis Info */}
      {insight.type === 'file' && (
        <div className="mt-6 bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>{insight.messageCount} mesaj • {insight.timeRange} analiz edildi</span>
          </div>
        </div>
      )}
    </div>
  );
}
