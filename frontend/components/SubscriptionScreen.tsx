import { ArrowLeft, Check, Zap, Sparkles, TrendingUp, Shield, Download } from 'lucide-react';

interface SubscriptionScreenProps {
  onBack: () => void;
  onSubscribe: () => void;
}

export function SubscriptionScreen({ onBack, onSubscribe }: SubscriptionScreenProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-gray-900">Pro Üyelik</h2>
      </div>

      {/* Hero */}
      <div className="mb-6 p-6 bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-3xl text-white text-center">
        <Zap className="w-16 h-16 mx-auto mb-3 fill-white" />
        <h2 className="text-white mb-2">İlişki Analiz Pro</h2>
        <p className="text-sm opacity-90">
          Profesyonel AI analizi ve sınırsız içgörü
        </p>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className="text-gray-900 mb-4">Pro Özellikler</h3>
        <div className="space-y-3">
          <FeatureItem
            icon={<Sparkles className="w-5 h-5 text-blue-600" />}
            title="Sınırsız Analiz"
            description="Her türlü analizde limit yok"
          />
          <FeatureItem
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            title="Detaylı İstatistikler & Grafikler"
            description="Gelişmiş veri görselleştirme ve trend analizi"
          />
          <FeatureItem
            icon={<Lightbulb className="w-5 h-5 text-purple-600" />}
            title="Tam AI İçgörüleri"
            description="Tüm bulgular, öneriler ve risk analizleri"
          />
          <FeatureItem
            icon={<Download className="w-5 h-5 text-indigo-600" />}
            title="Rapor İndirme"
            description="PDF formatında detaylı raporlar"
          />
          <FeatureItem
            icon={<Shield className="w-5 h-5 text-emerald-600" />}
            title="Öncelikli Destek"
            description="7/24 hızlı müşteri desteği"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-6 space-y-3">
        <PricingCard
          period="Aylık"
          price="₺99,99"
          perMonth="₺99,99/ay"
          popular={false}
        />
        <PricingCard
          period="Yıllık"
          price="₺799,99"
          perMonth="₺66,66/ay"
          popular={true}
          savings="33% Tasarruf"
        />
      </div>

      {/* CTA */}
      <button
        onClick={onSubscribe}
        className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl hover:shadow-lg transition-all duration-300 mb-4"
      >
        Pro'ya Başla
      </button>

      {/* Trust Signals */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <Shield className="w-4 h-4 text-green-600" />
          <span>Güvenli ödeme</span>
        </div>
        <p className="text-xs text-gray-500">
          İstediğin zaman iptal edebilirsin • Otomatik yenileme
        </p>
        <p className="text-xs text-gray-400">
          7 gün para iade garantisi
        </p>
      </div>
    </div>
  );
}

function Lightbulb({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M15 2a7 7 0 0 1 0 14H9A7 7 0 0 1 9 2z" />
    </svg>
  );
}

function FeatureItem({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="text-sm text-gray-900 mb-0.5">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

interface PricingCardProps {
  period: string;
  price: string;
  perMonth: string;
  popular: boolean;
  savings?: string;
}

function PricingCard({ period, price, perMonth, popular, savings }: PricingCardProps) {
  return (
    <div className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
      popular 
        ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50' 
        : 'border-slate-200 bg-white hover:border-slate-300'
    }`}>
      {popular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs rounded-full">
          En Popüler
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-gray-900">{period}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{perMonth}</p>
        </div>
        <div className="text-right">
          <div className="text-gray-900">{price}</div>
          {savings && (
            <div className="text-xs text-orange-600 mt-0.5">{savings}</div>
          )}
        </div>
      </div>
    </div>
  );
}
