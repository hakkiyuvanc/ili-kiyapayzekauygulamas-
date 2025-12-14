import { Brain, Heart, Sparkles } from 'lucide-react';

export function AnalysisScreen() {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[600px] flex flex-col items-center justify-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
        <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-8 rounded-full">
          <Brain className="w-16 h-16 text-white animate-pulse" />
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        Analiz Ediliyor
      </h2>

      <p className="text-gray-600 text-center mb-8 text-lg">
        Yapay zeka yanıtlarınızı analiz ediyor...
      </p>

      <div className="space-y-4 w-full max-w-sm">
        <AnalysisStep icon={<Heart className="w-5 h-5" />} text="İlişki dinamikleri değerlendiriliyor" delay={0} />
        <AnalysisStep icon={<Sparkles className="w-5 h-5" />} text="Güçlü yönler belirleniyor" delay={1000} />
        <AnalysisStep icon={<Brain className="w-5 h-5" />} text="Öneriler hazırlanıyor" delay={2000} />
      </div>

      <div className="mt-8 flex gap-2">
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function AnalysisStep({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) {
  return (
    <div 
      className="flex items-center gap-3 opacity-0"
      style={{ 
        animation: 'fadeIn 0.5s ease-in forwards',
        animationDelay: `${delay}ms`
      }}
    >
      <div className="flex-shrink-0 text-purple-600">{icon}</div>
      <span className="text-gray-700">{text}</span>
      <div className="ml-auto">
        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
