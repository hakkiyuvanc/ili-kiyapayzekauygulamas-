import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export interface Answer {
  questionId: number;
  question: string;
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
      { 
        questionId: questions[currentQuestion].id, 
        question: questions[currentQuestion].question,
        answer 
      }
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
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 font-medium">
            Soru {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-sm text-purple-600 font-bold">
            %{Math.round(progress)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Back Button */}
      {currentQuestion > 0 && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Önceki Soru</span>
        </button>
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          {questions[currentQuestion].question}
        </h2>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                currentAnswer === option
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
