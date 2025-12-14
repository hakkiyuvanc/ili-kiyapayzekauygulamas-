import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Download, Lock, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Copy, Check } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { InsightData } from '@/app/page';
import { InsightsSkeleton } from '@/components/SkeletonLoader';

interface InsightsScreenProps {
  insight: InsightData;
  isPro: boolean;
  onBack: () => void;
  onUpgrade: () => void;
}

export function InsightsScreen({ insight, isPro, onBack, onUpgrade }: InsightsScr
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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
    // PDF generation would go here
    const content = `
İlişki Analiz Raporu
─────────────────────

Genel Skor: ${insight.score}/100
${getScoreLabel(insight.score)}

Metrikler:
• İletişim: ${insight.metrics.communication}/100
• Duygusal Bağ: ${
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
            title="Paylaş"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5 text-gray-600" />}
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
  }eenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

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

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <h2 className="text-gray-900">Analiz Sonucu</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            title="Paylaş"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5 text-gray-600" />}
          </button>
          {isPro && (
            <button 
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="İndir"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Score Card */}
      <div className="mb-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{insight.score}</div>
          <div className="text-sm opacity-90">{getScoreLabel(insight.score)}</div>
        </div>
        
        {insight.messageCount && (
          <div className="flex items-center justify-center gap-4 text-sm opacity-90 border-t border-white/20 pt-4">
            <span>📊 {insight.messageCount} mesaj</span>
            <span>•</span>
            <span>📅 {insight.timeRange}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
            activeTab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Genel Bakış
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
            activeTab === 'details'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Detaylar
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Radar Chart */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="text-gray-900 mb-4 text-center">Metrik Dağılımı</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Skor"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard
              label="İletişim"
              value={insight.metrics.communication}
              icon="💬"
            />
            <MetricCard
              label="Duygusal Bağ"
              value={insight.metrics.emotional}
              icon="❤️"
            />
            <MetricCard
              label="Uyumluluk"
              value={insight.metrics.compatibility}
              icon="🤝"
            />
            <MetricCard
              label="Çatışma Riski"
              value={insight.metrics.conflict}
              icon="⚠️"
              inverse
            />
          </div>

          {/* Strengths */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-gray-900">Güçlü Yönler</h3>
            </div>
            <div className="space-y-2">
              {insight.strengths.slice(0, isPro ? undefined : 2).map((strength, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-green-600 text-sm">✓</span>
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
              {!isPro && insight.strengths.length > 2 && (
                <LockedContent onUpgrade={onUpgrade} count={insight.strengths.length - 2} />
              )}
            </div>
          </div>

          {/* Risk Areas */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-gray-900">Dikkat Edilmesi Gerekenler</h3>
            </div>
            <div className="space-y-2">
              {insight.riskAreas.slice(0, isPro ? undefined : 2).map((risk, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <span className="text-orange-600 text-sm">!</span>
                  <span className="text-sm text-gray-700">{risk}</span>
                </div>
              ))}
              {!isPro && insight.riskAreas.length > 2 && (
                <LockedContent onUpgrade={onUpgrade} count={insight.riskAreas.length - 2} />
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Findings */}
          <div className="mb-6">
            <h3 className="text-gray-900 mb-3">Bulgular</h3>
            <div className="space-y-2">
              {insight.findings.slice(0, isPro ? undefined : 3).map((finding, index) => (
                <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm text-gray-700">{finding}</p>
                </div>
              ))}
              {!isPro && insight.findings.length > 3 && (
                <LockedContent onUpgrade={onUpgrade} count={insight.findings.length - 3} />
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">AI Önerileri</h3>
            </div>
            <div className="space-y-3">
              {insight.recommendations.slice(0, isPro ? undefined : 2).map((rec, index) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                </div>
              ))}
              {!isPro && insight.recommendations.length > 2 && (
                <LockedContent onUpgrade={onUpgrade} count={insight.recommendations.length - 2} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Pro CTA */}
      {!isPro && (
        <button
          onClick={onUpgrade}
          className="w-full p-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-5 h-5" />
          <span>Pro'ya Geç - Tüm İçgörüleri Gör</span>
        </button>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, inverse = false }: { 
  label: string; 
  value: number; 
  icon: string;
  inverse?: boolean;
}) {
  const displayValue = inverse ? 100 - value : value;
  const colorClass = displayValue >= 70 ? 'text-green-600' : displayValue >= 40 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className={`text-2xl ${colorClass}`}>{displayValue}</div>
      <div className="text-xs text-gray-500">/100</div>
    </div>
  );
}

function LockedContent({ onUpgrade, count }: { onUpgrade: () => void; count: number }) {
  return (
    <button
      onClick={onUpgrade}
      className="w-full p-3 bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all"
    >
      <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
        <Lock className="w-4 h-4" />
        <span>+{count} içgörü daha - Pro ile kilidi aç</span>
      </div>
    </button>
  );
}
