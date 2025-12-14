import { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';

interface RelationshipAssessmentScreenProps {
  onSubmit: () => void;
  onBack: () => void;
}

const questions = [
  {
    category: 'İletişim',
    question: 'İlişkinizde iletişim kalitesini nasıl değerlendirirsiniz?',
    options: ['Mükemmel', 'İyi', 'Orta', 'Zayıf']
  },
  {
    category: 'Duygusal Bağ',
    question: 'Partnerinizle duygusal yakınlığınız ne düzeyde?',
    options: ['Çok güçlü', 'Güçlü', 'Orta', 'Zayıf']
  },
  {
    category: 'Çatışma Yönetimi',
    question: 'Anlaşmazlıkları ne kadar sağlıklı çözüyorsunuz?',
    options: ['Çok sağlıklı', 'Genellikle sağlıklı', 'Bazen zorlanıyoruz', 'Zorluk yaşıyoruz']
  },
  {
    category: 'Güven',
    question: 'Partnerinize güven düzeyiniz nedir?',
    options: ['Tam güven', 'Yüksek', 'Orta', 'Düşük']
  },
  {
    category: 'Kalite Zamanı',
    question: 'Birlikte kaliteli zaman geçirme sıklığınız?',
    options: ['Çok sık', 'Düzenli', 'Ara sıra', 'Nadiren']
  },
  {
    category: 'Hedef Uyumu',
    question: 'Gelecek planlarınız ne kadar uyumlu?',
    options: ['Tamamen uyumlu', 'Çoğunlukla uyumlu', 'Kısmen uyumlu', 'Uyumsuz']
  }
];

export function RelationshipAssessmentScreen({ onSubmit, onBack }: RelationshipAssessmentScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canProceed = answers[currentQuestion] !== undefined;

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-gray-900">İlişki Değerlendirmesi</h2>
          <p className="text-xs text-gray-500">Soru {currentQuestion + 1}/{questions.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">{questions[currentQuestion].category}</span>
          <span className="text-xs text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center mb-6">
        <h3 className="text-gray-900 mb-6 text-center px-4">
          {questions[currentQuestion].question}
        </h3>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                answers[currentQuestion] === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{option}</span>
                {answers[currentQuestion] === option && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
            currentQuestion === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>

        <div className="flex gap-1.5">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentQuestion 
                  ? 'w-8 bg-blue-600' 
                  : index < currentQuestion
                  ? 'w-1.5 bg-blue-600'
                  : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{currentQuestion === questions.length - 1 ? 'Tamamla' : 'İleri'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
