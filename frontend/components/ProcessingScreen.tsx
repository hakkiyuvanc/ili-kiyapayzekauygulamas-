import { Heart, Sparkles, Lock } from 'lucide-react';
import { AnalysisType } from '@/types';

interface ProcessingScreenProps {
  analysisType: AnalysisType;
}

// Animation timing constant (in milliseconds)
const ANIMATION_DELAY_MS = 700;
const ANIMATION_DELAY_STEP_MS = 700; // Delay between each step

const processingSteps = {
  message: [
    { icon: '💕', text: 'Duygu analizi yapılıyor', delay: 0 },
    { icon: '💭', text: 'Niyet tespit ediliyor', delay: ANIMATION_DELAY_STEP_MS },
    { icon: '🌸', text: 'Sevgi dili değerlendiriliyor', delay: ANIMATION_DELAY_STEP_MS * 2 },
    { icon: '💬', text: 'Öneriler hazırlanıyor', delay: ANIMATION_DELAY_STEP_MS * 3 }
  ],
  file: [
    { icon: '📊', text: 'Mesajlar işleniyor', delay: 0 },
    { icon: '💞', text: 'İletişim kalıpları analiz ediliyor', delay: ANIMATION_DELAY_MS },
    { icon: '🔍', text: 'Sevgi paternleri belirleniyor', delay: ANIMATION_DELAY_MS * 2 },
    { icon: '📋', text: 'Detaylı rapor hazırlanıyor', delay: ANIMATION_DELAY_MS * 3 },
    { icon: '💡', text: 'İçgörüler oluşturuluyor', delay: ANIMATION_DELAY_MS * 4 }
  ],
  relationship: [
    { icon: '❤️', text: 'Yanıtlar değerlendiriliyor', delay: 0 },
    { icon: '🔍', text: 'İlişki dinamikleri analiz ediliyor', delay: ANIMATION_DELAY_MS },
    { icon: '💗', text: 'Uyumluluk skoru hesaplanıyor', delay: ANIMATION_DELAY_MS * 2 },
    { icon: '🌹', text: 'Romantik öneriler hazırlanıyor', delay: ANIMATION_DELAY_MS * 3 }
  ]
};

export function ProcessingScreen({ analysisType }: ProcessingScreenProps) {
  const steps = processingSteps[analysisType];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center safe-top safe-bottom px-6 bg-romantic-gradient-soft">
      {/* Animated Heart Logo */}
      <div className="relative mb-8 animate-fadeIn">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-3xl opacity-40 animate-heartbeat" />
        <div className="relative bg-white p-8 rounded-full shadow-2xl">
          <Heart className="w-20 h-20 text-[#B76E79] fill-[#FFB6C1] animate-heartbeat" />
        </div>
        {/* Floating sparkles */}
        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-[#FF7F7F] animate-float" />
        <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-[#FFB6C1] animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* AMOR AI Branding */}
      <h1 className="amor-logo text-3xl mb-2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        AMOR AI
      </h1>

      <h2 className="text-xl font-semibold text-[#331A1A] text-center mb-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        Analiz Ediliyor 💗
      </h2>

      <p className="text-[#6B3F3F] text-center mb-8 text-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        Yapay zeka ilişkinizi değerlendiriyor...
      </p>

      {/* Processing Steps */}
      <div className="space-y-3 w-full max-w-sm mb-8">
        {steps.map((step, index) => (
          <ProcessingStep
            key={index}
            icon={step.icon}
            text={step.text}
            delay={step.delay}
          />
        ))}
      </div>

      {/* Loading Dots - Romantic Colors */}
      <div className="flex gap-2 mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="w-3 h-3 bg-[#B76E79] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-[#FFB6C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-[#FF7F7F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Security Badge */}
      <div className="ios-card px-6 py-3 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-2 text-xs text-[#6B3F3F]">
          <Lock className="w-4 h-4 text-[#B76E79]" />
          <span>🔒 Güvenli ve gizli işleme</span>
        </div>
      </div>

      {/* Progress Message */}
      <p className="mt-6 text-xs text-[#6B3F3F]/60 text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        Lütfen bekleyin, bu birkaç saniye sürebilir...
      </p>
    </div>
  );
}

function ProcessingStep({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  return (
    <div
      className="ios-card flex items-center gap-3 p-4 opacity-0 animate-fadeIn"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <span className="text-sm text-[#331A1A] flex-1 font-medium">{text}</span>
      <div className="relative w-5 h-5 flex-shrink-0">
        <div className="absolute inset-0 border-2 border-[#FFB6C1]/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

