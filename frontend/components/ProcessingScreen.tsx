import { Brain, Zap } from 'lucide-react';
import { AnalysisType } from '@/types';

interface ProcessingScreenProps {
  analysisType: AnalysisType;
}

// Animation timing constant (in milliseconds)
const ANIMATION_DELAY_MS = 700;
const ANIMATION_DELAY_STEP_MS = 700; // Delay between each step

const processingSteps = {
  message: [
    { icon: '🎯', text: 'Duygu analizi yapılıyor', delay: 0 },
    { icon: '💭', text: 'Niyet tespit ediliyor', delay: ANIMATION_DELAY_STEP_MS },
    { icon: '⚠️', text: 'Risk faktörleri değerlendiriliyor', delay: ANIMATION_DELAY_STEP_MS * 2 },
    { icon: '💬', text: 'Cevap önerisi oluşturuluyor', delay: ANIMATION_DELAY_STEP_MS * 3 }
  ],
  file: [
    { icon: '📊', text: 'Mesajlar işleniyor', delay: 0 },
    { icon: '📈', text: 'İletişim kalıpları analiz ediliyor', delay: ANIMATION_DELAY_MS },
    { icon: '🔍', text: 'Trend ve paternler belirleniyor', delay: ANIMATION_DELAY_MS * 2 },
    { icon: '📋', text: 'Detaylı rapor hazırlanıyor', delay: ANIMATION_DELAY_MS * 3 },
    { icon: '💡', text: 'İçgörüler oluşturuluyor', delay: ANIMATION_DELAY_MS * 4 }
  ],
  relationship: [
    { icon: '❤️', text: 'Yanıtlar değerlendiriliyor', delay: 0 },
    { icon: '🔍', text: 'İlişki dinamikleri analiz ediliyor', delay: ANIMATION_DELAY_MS },
    { icon: '📊', text: 'Uyumluluk skoru hesaplanıyor', delay: ANIMATION_DELAY_MS * 2 },
    { icon: '💡', text: 'Öneriler hazırlanıyor', delay: ANIMATION_DELAY_MS * 3 }
  ]
};

export function ProcessingScreen({ analysisType }: ProcessingScreenProps) {
  const steps = processingSteps[analysisType];

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[600px] flex flex-col items-center justify-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-full">
          <Brain className="w-16 h-16 text-white animate-pulse" />
        </div>
      </div>

      <h2 className="mb-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        AI Analiz Ediyor
      </h2>

      <p className="text-gray-600 text-center mb-8 text-sm">
        Gelişmiş algoritmalarımız verilerinizi işliyor
      </p>

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

      <div className="flex gap-2">
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      <div className="mt-8 px-6 py-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>Güvenli ve şifreli işleme</span>
        </div>
      </div>
    </div>
  );
}

function ProcessingStep({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl opacity-0 animate-fadeIn"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <span className="text-sm text-gray-700 flex-1">{text}</span>
      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
    </div>
  );
}
