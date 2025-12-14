import { Plus, TrendingUp, Shield, Zap, FileText, Calendar, ArrowRight } from 'lucide-react';
import { InsightData } from '@/app/page';

interface DashboardScreenProps {
  isPro: boolean;
  onStartAnalysis: () => void;
  onViewInsight: (insight: InsightData) => void;
  onUpgrade: () => void;
}

// Mock recent analyses
const recentAnalyses: InsightData[] = [
  {
    type: 'file',
    score: 72,
    metrics: { communication: 68, emotional: 75, compatibility: 70, conflict: 45 },
    findings: [],
    recommendations: [],
    riskAreas: [],
    strengths: [],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    messageCount: 1247,
    timeRange: '3 ay'
  },
  {
    type: 'relationship',
    score: 78,
    metrics: { communication: 82, emotional: 71, compatibility: 80, conflict: 38 },
    findings: [],
    recommendations: [],
    riskAreas: [],
    strengths: [],
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  }
];

export function DashboardScreen({ isPro, onStartAnalysis, onViewInsight, onUpgrade }: DashboardScreenProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">İlişki Analiz AI</h1>
          {isPro && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm text-amber-600">Pro Üye</span>
            </div>
          )}
        </div>
        {!isPro && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm hover:shadow-lg transition-all"
          >
            Pro'ya Geç
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={<FileText className="w-4 h-4 text-blue-600" />}
          label="Toplam"
          value={isPro ? "24" : "2"}
          sublabel="analiz"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          label="Ort. Skor"
          value={isPro ? "75" : "72"}
          sublabel="/100"
        />
        <StatCard
          icon={<Shield className="w-4 h-4 text-purple-600" />}
          label="Risk"
          value={isPro ? "Düşük" : "Orta"}
          sublabel=""
        />
      </div>

      {/* CTA Card */}
      <button
        onClick={onStartAnalysis}
        className="w-full mb-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white hover:shadow-xl transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5" />
              <h3 className="text-white">Yeni Analiz Başlat</h3>
            </div>
            <p className="text-sm text-blue-100">
              Mesaj, dosya veya genel değerlendirme
            </p>
          </div>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Recent Analyses */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900">Son Analizler</h3>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
        
        {recentAnalyses.length > 0 ? (
          <div className="space-y-2">
            {recentAnalyses.slice(0, isPro ? 5 : 2).map((analysis, index) => (
              <AnalysisCard
                key={index}
                analysis={analysis}
                onClick={() => onViewInsight(analysis)}
              />
            ))}
            
            {!isPro && recentAnalyses.length > 2 && (
              <button
                onClick={onUpgrade}
                className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-sm text-amber-700 hover:bg-amber-100 transition-colors"
              >
                +{recentAnalyses.length - 2} analiz daha · Pro'ya geçerek tümünü gör
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-xl text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Henüz analiz yok</p>
            <p className="text-xs text-gray-400 mt-1">İlk analizini oluştur</p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <h4 className="text-sm text-gray-700 mb-2">💡 Günün İpucu</h4>
        <p className="text-xs text-gray-600">
          Sağlıklı ilişkilerde çiftler, sorunların %70'ini çözemez - bunları yönetmeyi öğrenir.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  sublabel: string;
}) {
  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className="text-gray-900">{value}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
    </div>
  );
}

function AnalysisCard({ analysis, onClick }: { analysis: InsightData; onClick: () => void }) {
  const getTypeIcon = () => {
    if (analysis.type === 'message') return '💬';
    if (analysis.type === 'file') return '📁';
    return '❤️';
  };

  const getTypeLabel = () => {
    if (analysis.type === 'message') return 'Mesaj Analizi';
    if (analysis.type === 'file') return 'Dosya Analizi';
    return 'İlişki Değerlendirmesi';
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTypeIcon()}</span>
          <div>
            <h4 className="text-sm text-gray-900">{getTypeLabel()}</h4>
            <p className="text-xs text-gray-500">{formatDate(analysis.timestamp)}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs ${getScoreColor(analysis.score)}`}>
          {analysis.score}/100
        </div>
      </div>
      
      {analysis.messageCount && (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>📊 {analysis.messageCount} mesaj</span>
          <span>•</span>
          <span>📅 {analysis.timeRange}</span>
        </div>
      )}
      
      <div className="mt-2 flex items-center text-xs text-blue-600 group-hover:translate-x-1 transition-transform">
        <span>Detayları gör</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </button>
  );
}
