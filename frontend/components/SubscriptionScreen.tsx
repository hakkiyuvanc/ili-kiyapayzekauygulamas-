import { ArrowLeft, Check, Heart, Sparkles, TrendingUp, Shield, Download } from 'lucide-react';

interface SubscriptionScreenProps {
  onBack: () => void;
  onSubscribe: () => void;
}

export function SubscriptionScreen({ onBack, onSubscribe }: SubscriptionScreenProps) {
  return (
    <div className="min-h-screen bg-romantic-gradient-soft safe-top safe-bottom px-4 py-6">
      <div className="ios-card-elevated p-6 max-w-2xl mx-auto ios-scroll max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 hover:bg-[#FFF0F5] rounded-xl mr-2 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-[#B76E79]" />
          </button>
          <h2 className="text-lg font-semibold text-[#331A1A]">Pro Üyelik</h2>
        </div>

        <div className="mb-6 p-6 bg-gradient-to-br from-[#B76E79] to-[#FF7F7F] rounded-3xl text-white text-center">
          <Heart className="w-16 h-16 mx-auto mb-3 fill-white" />
          <h2 className="text-2xl font-bold mb-2">AMOR AI Pro 💗</h2>
          <p className="text-sm opacity-90">Profesyonel AI analizi ve sınırsız içgörü</p>
        </div>

        <h3 className="text-[#331A1A] font-semibold mb-4">Pro Özellikler ✨</h3>
        <div className="space-y-3 mb-6">
          <FeatureItem icon={<Sparkles className="w-5 h-5 text-[#FFB6C1]" />} title="Sınırsız Analiz" description="Her türlü analizde limit yok" />
          <FeatureItem icon={<TrendingUp className="w-5 h-5 text-[#22C55E]" />} title="Detaylı İstatistikler" description="Gelişmiş veri görselleştirme" />
          <FeatureItem icon={<Heart className="w-5 h-5 text-[#FF7F7F]" />} title="Tam AI İçgörüleri" description="Tüm bulgular ve öneriler" />
          <FeatureItem icon={<Download className="w-5 h-5 text-[#B76E79]" />} title="Rapor İndirme" description="PDF formatında raporlar" />
          <FeatureItem icon={<Shield className="w-5 h-5 text-[#22C55E]" />} title="Öncelikli Destek" description="7/24 hızlı destek" />
        </div>

        <div className="space-y-3 mb-6">
          <PricingCard period="Aylık" price="₺99,99" perMonth="₺99,99/ay" popular={false} />
          <PricingCard period="Yıllık" price="₺799,99" perMonth="₺66,66/ay" popular={true} savings="33% Tasarruf 🎉" />
        </div>

        <button onClick={onSubscribe} className="ios-button-primary w-full py-4 mb-4">Pro'ya Başla 💗</button>

        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-[#6B3F3F]">
            <Shield className="w-4 h-4 text-[#22C55E]" />
            <span>Güvenli ödeme 🔒</span>
          </div>
          <p className="text-xs text-[#6B3F3F]">İstediğin zaman iptal edebilirsin • Otomatik yenileme</p>
          <p className="text-xs text-[#6B3F3F]/60">7 gün para iade garantisi</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string; }) {
  return (
    <div className="flex items-start gap-3 p-3 ios-card border border-[#FFB6C1]/20">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <h4 className="text-sm text-[#331A1A] font-medium mb-0.5">{title}</h4>
        <p className="text-xs text-[#6B3F3F]">{description}</p>
      </div>
    </div>
  );
}

interface PricingCardProps { period: string; price: string; perMonth: string; popular: boolean; savings?: string; }

function PricingCard({ period, price, perMonth, popular, savings }: PricingCardProps) {
  return (
    <div className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-98 ${popular ? 'border-[#FFB6C1] bg-gradient-to-br from-[#FFF0F5] to-white' : 'border-[#FFB6C1]/30 bg-white hover:border-[#FFB6C1]'}`}>
      {popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#B76E79] to-[#FFB6C1] text-white text-xs rounded-full">En Popüler 💕</div>}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[#331A1A] font-semibold">{period}</h4>
          <p className="text-xs text-[#6B3F3F] mt-0.5">{perMonth}</p>
        </div>
        <div className="text-right">
          <div className="text-[#B76E79] font-bold text-xl">{price}</div>
          {savings && <div className="text-xs text-[#FF7F7F] mt-0.5">{savings}</div>}
        </div>
      </div>
    </div>
  );
}
