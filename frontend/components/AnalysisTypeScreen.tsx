import { ArrowLeft, FolderOpen, Heart, Lock, Sparkles } from 'lucide-react';
import { AnalysisType } from '@/types';

interface AnalysisTypeScreenProps {
  onSelectType: (type: AnalysisType) => void;
  onBack: () => void;
  isPro: boolean;
}

export function AnalysisTypeScreen({ onSelectType, onBack, isPro }: AnalysisTypeScreenProps) {
  return (
    <div className="flex flex-col safe-top safe-bottom">
      {/* AMOR AI Header */}
      <div className="text-center mb-4 animate-fadeIn">
        <h1 className="amor-logo text-2xl mb-1">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm">Analiz tipi seçimi 💕</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50 flex-1 flex flex-col max-w-2xl w-full mx-auto">
        {/* Header with Back */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#FFF0F5] rounded-xl transition-colors mr-2 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#B76E79]" />
          </button>
          <h2 className="text-lg font-semibold text-[#331A1A]">Analiz Tipi Seç</h2>
        </div>

        <p className="text-sm text-[#6B3F3F] mb-6">
          AI destekli analizimiz, ilişkiniz hakkında derinlemesine içgörüler sunar 💗
        </p>

        {/* Analysis Type Cards */}
        <div className="space-y-4">
          <TypeCard
            icon={<Heart className="w-6 h-6 text-[#FFB6C1]" />}
            title="Tek Mesaj Analizi 💬"
            description="Aldığın veya göndereceğin bir mesajı analiz et"
            features={['Duygu analizi', 'Niyet tespiti', 'Cevap önerisi']}
            onClick={() => onSelectType('message')}
            gradient="from-[#FFB6C1] to-[#FF7F7F]"
            free={true}
          />

          <TypeCard
            icon={<FolderOpen className="w-6 h-6 text-[#B76E79]" />}
            title="Mesaj Dosyası Analizi 📁"
            description="WhatsApp/SMS geçmişini yükle, kapsamlı analiz al"
            features={['İletişim kalıpları', 'Zaman içi trend', 'Detaylı raporlama']}
            onClick={() => onSelectType('file')}
            gradient="from-[#B76E79] to-[#FFB6C1]"
            free={isPro}
            badge="Pro"
          />

          <TypeCard
            icon={<Sparkles className="w-6 h-6 text-[#FF7F7F]" />}
            title="Genel İlişki Değerlendirmesi 💕"
            description="İlişkinin tüm yönlerini değerlendir"
            features={['Uyumluluk analizi', 'Güçlü/zayıf yönler', 'Gelişim önerileri']}
            onClick={() => onSelectType('relationship')}
            gradient="from-[#FF7F7F] to-[#FFB6C1]"
            free={true}
          />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-[#FFF0F5] rounded-xl border border-[#FFB6C1]/30">
          <p className="text-xs text-[#6B3F3F]">
            🔒 Tüm analizleriniz şifrelenir ve gizli kalır. Verileriniz üçüncü şahıslarla paylaşılmaz.
          </p>
        </div>
      </div>
    </div>
  );
}

interface TypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  onClick: () => void;
  gradient: string;
  free: boolean;
  badge?: string;
}

function TypeCard({ icon, title, description, features, onClick, gradient, free, badge }: TypeCardProps) {
  return (
    <button
      onClick={free ? onClick : undefined}
      className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${free
        ? 'border-[#FFB6C1]/30 hover:border-[#FFB6C1] hover:shadow-lg bg-white active:scale-98'
        : 'border-[#FFB6C1]/20 bg-[#FFF0F5] opacity-75'
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
          {icon}
        </div>
        {badge && !free && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-[#FFB6C1] text-white rounded-lg text-xs">
            <Lock className="w-3 h-3" />
            <span>{badge}</span>
          </div>
        )}
      </div>

      <h3 className="text-[#331A1A] font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[#6B3F3F] mb-3">{description}</p>

      <div className="space-y-1.5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-xs text-[#6B3F3F]">
            <div className="w-1 h-1 rounded-full bg-[#FFB6C1]" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {!free && (
        <div className="mt-3 pt-3 border-t border-[#FFB6C1]/30">
          <p className="text-xs text-[#B76E79]">Pro üyelik gerektirir ✨</p>
        </div>
      )}
    </button>
  );
}
