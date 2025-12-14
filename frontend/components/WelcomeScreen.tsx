import { Heart, Sparkles, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';

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
      
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        İlişki Analiz AI
      </h1>
      
      <p className="text-gray-600 mb-8 text-lg">
        Yapay zeka destekli ilişki analizimiz ile ilişkinizin güçlü ve geliştirilmesi gereken yönlerini keşfedin
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

      <div className="space-y-3">
        <button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-lg"
        >
          Hızlı Anket ile Başla
        </button>

        <Link href="/advanced">
          <button className="w-full bg-white border-2 border-purple-200 text-purple-600 py-4 rounded-2xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Konuşma Metni ile Analiz
          </button>
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Yanıtlarınız gizli kalır ve analiz için kullanılır
      </p>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-gray-700 font-medium">{text}</span>
    </div>
  );
}
