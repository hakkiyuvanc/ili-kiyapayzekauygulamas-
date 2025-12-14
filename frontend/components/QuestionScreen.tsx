import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressTracker } from '@/components/ProgressTracker';

export interface Answer {
  questionId: number;
  answer: string;
}

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
    <div className="bg-white rounded-3xl shadow-2xl p-6 min-h-[600px] flex flex-col">
      {/* Enhanced Progress Bar */}
      <ProgressTracker
        currentStep={currentQuestion + 1}
        totalSteps={questions.length}
        steps={questions.map((_, i) => `S${i + 1}`)}
        compact
      />

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="mb-8 text-gray-800">
          {questions[currentQuestion].question}
        </h2>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                currentAnswer === option
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span className="text-gray-700">{option}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            currentQuestion === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Geri
        </button>

        <div className="flex gap-1">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentQuestion ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="w-20" />
      </div>
    </div>
  );
}
