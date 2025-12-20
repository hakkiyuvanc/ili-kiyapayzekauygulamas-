import { TrendingUp, AlertCircle, CheckCircle, RefreshCw, Share2 } from 'lucide-react';
import { Answer } from '@/types';

interface ResultScreenProps {
  answers: Answer[];
  onRestart: () => void;
}

export function ResultScreen({ answers, onRestart }: ResultScreenProps) {
  // Basit bir skor hesaplama (gerçek uygulamada daha karmaşık olabilir)
  const calculateScore = () => {
    let score = 0;
    answers.forEach(answer => {
      if (answer.answer.includes('Çok') || answer.answer.includes('Tamamen') || answer.answer.includes('Her')) {
        score += 4;
      } else if (answer.answer.includes('Genelde') || answer.answer.includes('iyi') || answer.answer.includes('Mutluyum')) {
        score += 3;
      } else if (answer.answer.includes('Bazen') || answer.answer.includes('Orta') || answer.answer.includes('Kısmen')) {
        score += 2;
      } else {
        score += 1;
      }
    });
    return Math.round((score / (answers.length * 4)) * 100);
  };

  const score = calculateScore();



  const getScoreText = () => {
    if (score >= 75) return 'Mükemmel';
    if (score >= 50) return 'İyi';
    return 'Geliştirilmeli';
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
      {/* Score Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-pink-500" stopColor="currentColor" />
                <stop offset="100%" className="text-purple-600" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {score}
            </div>
            <span className="text-sm text-gray-500 font-medium">{getScoreText()}</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-800">İlişki Sağlığı Skorunuz</h2>
      </div>

      {/* Analysis Sections */}
      <div className="space-y-4 mb-6">
        <AnalysisSection
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          title="Güçlü Yönler"
          items={[
            'İletişim becerileriniz gelişmiş',
            'Birbirinize zaman ayırıyorsunuz',
            'Duygusal bağınız güçlü'
          ]}
          color="green"
        />

        <AnalysisSection
          icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
          title="Geliştirilmesi Gerekenler"
          items={[
            'Anlaşmazlık çözüm becerilerinizi geliştirin',
            'Gelecek planlarınızı daha sık konuşun',
            'Karşılıklı destek mekanizmalarını güçlendirin'
          ]}
          color="orange"
        />

        <AnalysisSection
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          title="AI Önerileri"
          items={[
            'Duygusal ihtiyaçlarınızı açıkça ifade edin'
          ]}
          color="purple"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Yeni Analiz Yap
        </button>

        <button className="w-full border-2 border-purple-200 text-purple-600 py-4 rounded-2xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" />
          Sonuçları Paylaş
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Bu analiz genel bir değerlendirmedir. Profesyonel destek için uzman yardımı alabilirsiniz.
      </p>
    </div>
  );
}

interface AnalysisSectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: string;
}

function AnalysisSection({ icon, title, items, color }: AnalysisSectionProps) {
  const bgColor = color === 'green' ? 'bg-green-50' : color === 'orange' ? 'bg-orange-50' : 'bg-purple-50';

  return (
    <div className={`${bgColor} p-4 rounded-2xl`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-gray-800">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-gray-400 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
