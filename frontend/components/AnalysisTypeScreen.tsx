import { ArrowLeft, MessageSquare, FolderOpen, Heart, Lock } from 'lucide-react';
import { AnalysisType } from '@/app/page';

interface AnalysisTypeScreenProps {
  onSelectType: (type: AnalysisType) => void;
  onBack: () => void;
  isPro: boolean;
}

export function AnalysisTypeScreen({ onSelectType, onBack, isPro }: AnalysisTypeScreenProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 min-h-[600px]">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-gray-900">Analiz Tipi Seç</h2>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        AI destekli analizimiz, ilişkiniz hakkında derinlemesine içgörüler sunar
      </p>

      {/* Analysis Type Cards */}
      <div className="space-y-4">
        <TypeCard
          icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
          title="Tek Mesaj Analizi"
          description="Aldığın veya göndereceğin bir mesajı analiz et"
          features={['Duygu analizi', 'Niyet tespiti', 'Cevap önerisi']}
          onClick={() => onSelectType('message')}
          gradient="from-blue-500 to-cyan-500"
          free={true}
        />

        <TypeCard
          icon={<FolderOpen className="w-6 h-6 text-purple-600" />}
          title="Mesaj Dosyası Analizi"
          description="WhatsApp/SMS geçmişini yükle, kapsamlı analiz al"
          features={['İletişim kalıpları', 'Zaman içi trend', 'Detaylı raporlama']}
          onClick={() => onSelectType('file')}
          gradient="from-purple-500 to-pink-500"
          free={isPro}
          badge="Pro"
        />

        <TypeCard
          icon={<Heart className="w-6 h-6 text-rose-600" />}
          title="Genel İlişki Değerlendirmesi"
          description="İlişkinin tüm yönlerini değerlendir"
          features={['Uyumluluk analizi', 'Güçlü/zayıf yönler', 'Gelişim önerileri']}
          onClick={() => onSelectType('relationship')}
          gradient="from-rose-500 to-red-500"
          free={true}
        />
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
        <p className="text-xs text-gray-600">
          🔒 Tüm analizleriniz şifrelenir ve gizli kalır. Verileriniz üçüncü şahıslarla paylaşılmaz.
        </p>
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
      className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
        free 
          ? 'border-slate-200 hover:border-slate-300 hover:shadow-lg bg-white' 
          : 'border-slate-200 bg-slate-50 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
          {icon}
        </div>
        {badge && !free && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs">
            <Lock className="w-3 h-3" />
            <span>{badge}</span>
          </div>
        )}
      </div>

      <h3 className="text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>

      <div className="space-y-1.5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-1 h-1 rounded-full bg-gray-400" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {!free && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-amber-600">Pro üyelik gerektirir</p>
        </div>
      )}
    </button>
  );
}
