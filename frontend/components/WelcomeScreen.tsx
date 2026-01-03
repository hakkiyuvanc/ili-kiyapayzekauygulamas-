import { Heart, Sparkles, TrendingUp, MessageCircleHeart } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center safe-top safe-bottom px-6 bg-romantic-gradient-soft">
      {/* AMOR AI Logo */}
      <div className="mb-8 flex flex-col items-center animate-fadeIn">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-2xl opacity-30 animate-heartbeat"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl">
            <Heart className="w-16 h-16 text-[#B76E79] fill-[#FFB6C1]" />
          </div>
        </div>

        <h1 className="amor-logo text-5xl mb-2 tracking-tight">
          AMOR AI
        </h1>

        <p className="text-[#6B3F3F] text-sm font-medium">
          İlişki Analiz Asistanı
        </p>
      </div>

      {/* Main Card */}
      <div className="ios-card-elevated max-w-md w-full p-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        <p className="text-[#331A1A] text-center mb-6 text-lg leading-relaxed">
          Aşkın matematiğini keşfet ve ilişkini güçlendir 💕
        </p>

        <div className="space-y-3 mb-8">
          <FeatureCard
            icon={<Sparkles className="w-5 h-5 text-[#B76E79]" />}
            text="AI Destekli Analiz"
            delay="0.2s"
          />
          <FeatureCard
            icon={<TrendingUp className="w-5 h-5 text-[#FF7F7F]" />}
            text="Kişiselleştirilmiş Öneriler"
            delay="0.3s"
          />
          <FeatureCard
            icon={<MessageCircleHeart className="w-5 h-5 text-[#FFB6C1]" />}
            text="İlişki Sağlığı Skoru"
            delay="0.4s"
          />
        </div>

        <button
          onClick={onStart}
          className="ios-button-primary w-full py-4 text-white shadow-lg active:shadow-md"
        >
          Analize Başla 💗
        </button>

        <p className="text-xs text-[#6B3F3F]/60 text-center mt-6">
          🔒 Yanıtlarınız gizli kalır ve sadece analiz için kullanılır
        </p>
      </div>

      {/* Bottom Tagline */}
      <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <p className="text-[#6B3F3F] text-sm">
          Sevgi dolu ilişkiler için
          <span className="block mt-1 font-semibold amor-logo">AMOR AI</span>
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text, delay }: { icon: React.ReactNode; text: string; delay?: string }) {
  return (
    <div
      className="flex items-center gap-3 bg-[#FFF0F5] p-4 rounded-xl border border-[#FFB6C1]/20 animate-slideInRight"
      style={{ animationDelay: delay }}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white">
        {icon}
      </div>
      <span className="text-[#331A1A] font-medium">{text}</span>
    </div>
  );
}

