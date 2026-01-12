"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";

interface RelationshipAssessmentScreenProps {
  onSubmit: (answers: Record<string, string>) => void;
  onBack: () => void;
}

const questions = [
  {
    category: "İletişim",
    question: "İlişkinizde iletişim kalitesini nasıl değerlendirirsiniz?",
    options: ["Mükemmel", "İyi", "Orta", "Zayıf"],
  },
  {
    category: "Duygusal Bağ",
    question: "Partnerinizle duygusal yakınlığınız ne düzeyde?",
    options: ["Çok güçlü", "Güçlü", "Orta", "Zayıf"],
  },
  {
    category: "Çatışma Yönetimi",
    question: "Anlaşmazlıkları ne kadar sağlıklı çözüyorsunuz?",
    options: [
      "Çok sağlıklı",
      "Genellikle sağlıklı",
      "Bazen zorlanıyoruz",
      "Zorluk yaşıyoruz",
    ],
  },
  {
    category: "Güven",
    question: "Partnerinize güven düzeyiniz nedir?",
    options: ["Tam güven", "Yüksek", "Orta", "Düşük"],
  },
  {
    category: "Kalite Zamanı",
    question: "Birlikte kaliteli zaman geçirme sıklığınız?",
    options: ["Çok sık", "Düzenli", "Ara sıra", "Nadiren"],
  },
  {
    category: "Hedef Uyumu",
    question: "Gelecek planlarınız ne kadar uyumlu?",
    options: [
      "Tamamen uyumlu",
      "Çoğunlukla uyumlu",
      "Klsmen uyumlu",
      "Uyumsuz",
    ],
  },
];

export function RelationshipAssessmentScreen({
  onSubmit,
  onBack,
}: RelationshipAssessmentScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (answer: string) =>
    setAnswers({ ...answers, [currentQuestion]: answer });
  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const namedAnswers: Record<string, string> = {};
      questions.forEach((q, index) => {
        if (answers[index]) namedAnswers[q.category] = answers[index];
      });
      setIsSubmitting(true);
      try {
        await onSubmit(namedAnswers);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const canProceed = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-romantic-gradient-soft safe-top safe-bottom px-4 py-6">
      <div className="ios-card-elevated p-6 max-w-2xl mx-auto min-h-[600px] flex flex-col">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#FFF0F5] rounded-xl mr-2 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#B76E79]" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#331A1A]">
              İlişki Değerlendirmesi 💕
            </h2>
            <p className="text-xs text-[#6B3F3F]">
              Soru {currentQuestion + 1}/{questions.length}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[#B76E79] font-medium">
              {currentQ?.category}
            </span>
            <span className="text-xs text-[#FF7F7F]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-[#FFF0F5] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#B76E79] to-[#FFB6C1] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center mb-6">
          <h3 className="text-[#331A1A] text-lg font-medium mb-6 text-center px-4">
            {currentQ?.question}
          </h3>
          <div className="space-y-3">
            {currentQ?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all active:scale-98 ${answers[currentQuestion] === option ? "border-[#B76E79] bg-[#FFF0F5]" : "border-[#FFB6C1]/30 hover:border-[#FFB6C1] hover:bg-[#FFF0F5]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#331A1A] font-medium">{option}</span>
                  {answers[currentQuestion] === option && (
                    <div className="w-5 h-5 bg-[#B76E79] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${currentQuestion === 0 ? "text-[#6B3F3F]/30 cursor-not-allowed" : "text-[#B76E79] hover:bg-[#FFF0F5] active:scale-95"}`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Geri</span>
          </button>

          <div className="flex gap-1.5">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === currentQuestion ? "w-8 bg-gradient-to-r from-[#B76E79] to-[#FFB6C1]" : index < currentQuestion ? "w-1.5 bg-[#FFB6C1]" : "w-1.5 bg-[#FFB6C1]/30"}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${canProceed && !isSubmitting ? "ios-button-primary" : "bg-[#FFB6C1]/30 text-[#6B3F3F]/50 cursor-not-allowed"}`}
          >
            {isSubmitting ? (
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <>
                <span>
                  {currentQuestion === questions.length - 1
                    ? "Tamamla 💗"
                    : "İleri"}
                </span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
