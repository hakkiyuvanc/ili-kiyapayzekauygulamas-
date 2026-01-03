import { useState } from 'react';
import { ChevronLeft, Heart } from 'lucide-react';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Answer } from '@/types';

interface QuestionScreenProps {
  onComplete: (answers: Answer[]) => void;
}

const questions = [
  {
    id: 1,
    question: 'Partnerinizle iletişiminizi nasıl değerlendirirsiniz?',
    options: [
      'Çok açık ve samimi',
      'Genelde iyi',
      'Bazen zorluk yaşıyoruz',
      'Çok az iletişim kuruyoruz'
    ]
  },
  {
    id: 2,
    question: 'Partnerinizle ne sıklıkla kaliteli zaman geçiriyorsunuz?',
    options: [
      'Her gün',
      'Haftada birkaç kez',
      'Haftada bir',
      'Ayda birkaç kez'
    ]
  },
  {
    id: 3,
    question: 'İlişkinizde güven düzeyiniz nedir?',
    options: [
      'Tamamen güveniyorum',
      'Genelde güveniyorum',
      'Bazen şüphelerim oluyor',
      'Güven sorunu yaşıyoruz'
    ]
  },
  {
    id: 4,
    question: 'Anlaşmazlıkları nasıl çözüyorsunuz?',
    options: [
      'Sakinçe konuşarak',
      'Genelde uzlaşıya varıyoruz',
      'Bazen tartışmalar büyüyor',
      'Çözüm bulmakta zorlanıyoruz'
    ]
  },
  {
    id: 5,
    question: 'Gelecek planlarınız ne kadar uyumlu?',
    options: [
      'Tamamen aynı yöndeyiz',
      'Çoğu konuda hemfikiriz',
      'Bazı farklılıklar var',
      'Çok farklı düşünüyoruz'
    ]
  },
  {
    id: 6,
    question: 'Partneriniz duygusal ihtiyaçlarınızı karşılıyor mu?',
    options: [
      'Tamamen karşılıyor',
      'Çoğunlukla karşılıyor',
      'Kısmen karşılıyor',
      'Karşılamıyor'
    ]
  },
  {
    id: 7,
    question: 'İlişkinizde ne kadar mutlusunuz?',
    options: [
      'Çok mutluyum',
      'Mutluyum',
      'Orta düzeyde',
      'Mutsuzum'
    ]
  },
  {
    id: 8,
    question: 'Partnerinizi ne kadar desteklediğinizi düşünüyorsunuz?',
    options: [
      'Her zaman destekliyorum',
      'Genelde destekliyorum',
      'Bazen destekliyorum',
      'Yeterince destekleyemiyorum'
    ]
  }
];

export function QuestionScreen({ onComplete }: QuestionScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [
      ...answers.filter(a => a.questionId !== questions[currentQuestion].id),
      { questionId: questions[currentQuestion].id, answer }
    ];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onComplete(newAnswers);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion].id)?.answer;

  return (
    <div className="min-h-screen bg-romantic-gradient-soft flex flex-col safe-top safe-bottom px-4 py-6">
      {/* AMOR AI Header */}
      <div className="text-center mb-4 animate-fadeIn">
        <h1 className="amor-logo text-2xl mb-1">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm">İlişki değerlendirmesi 💕</p>
      </div>

      <div className="ios-card-elevated p-6 flex-1 flex flex-col max-w-2xl w-full mx-auto">
        {/* Enhanced Progress Bar */}
        <ProgressTracker
          currentStep={currentQuestion + 1}
          totalSteps={questions.length}
          steps={questions.map((_, i) => `S${i + 1}`)}
          compact
        />

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center my-8">
          <h2 className="mb-8 text-[#331A1A] text-xl font-semibold leading-relaxed animate-fadeIn">
            {questions[currentQuestion].question}
          </h2>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 active:scale-98 animate-slideInRight ${currentAnswer === option
                    ? 'border-[#B76E79] bg-[#FFF0F5]'
                    : 'border-[#FFB6C1]/30 hover:border-[#FFB6C1] hover:bg-[#FFF0F5]'
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-[#331A1A] font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${currentQuestion === 0
                ? 'text-[#6B3F3F]/30 cursor-not-allowed'
                : 'text-[#B76E79] hover:bg-[#FFF0F5] active:scale-95'
              }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Geri
          </button>

          <div className="flex gap-1.5">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 rounded-full ${index <= currentQuestion
                    ? 'w-3 h-3 bg-gradient-to-r from-[#B76E79] to-[#FFB6C1]'
                    : 'w-2 h-2 bg-[#FFB6C1]/30'
                  }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-[#B76E79] text-sm font-medium">
            <Heart className="w-4 h-4 fill-[#FFB6C1]" />
            {currentQuestion + 1}/{questions.length}
          </div>
        </div>
      </div>
    </div>
  );
}
