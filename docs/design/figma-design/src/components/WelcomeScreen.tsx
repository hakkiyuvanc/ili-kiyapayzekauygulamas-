import { Heart, Sparkles, TrendingUp } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
      <div className="mb-6 flex justify-center">
        <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-full">
          <Heart className="w-16 h-16 text-white fill-white" />
        </div>
      </div>

      <h1 className="mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        İlişki Analiz AI
      </h1>

      <p className="text-gray-600 mb-8">
        Yapay zeka destekli ilişki analizimiz ile ilişkinizin güçlü ve
        geliştirilmesi gereken yönlerini keşfedin
      </p>

      <div className="space-y-4 mb-8">
        <FeatureCard
          icon={<Sparkles className="w-5 h-5 text-purple-600" />}
          text="AI Destekli Analiz"
        />
        <FeatureCard
          icon={<TrendingUp className="w-5 h-5 text-pink-600" />}
          text="Kişiselleştirilmiş Öneriler"
        />
        <FeatureCard
          icon={<Heart className="w-5 h-5 text-red-500" />}
          text="İlişki Sağlığı Skoru"
        />
      </div>

      <button
        onClick={onStart}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
      >
        Analize Başla
      </button>

      <p className="text-xs text-gray-400 mt-6">
        Yanıtlarınız gizli kalır ve analiz için kullanılır
      </p>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
