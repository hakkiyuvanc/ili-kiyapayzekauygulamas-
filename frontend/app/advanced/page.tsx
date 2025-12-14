'use client';

import { useState } from 'react';
import AnalysisForm from '@/components/AnalysisForm';
import AnalysisResult from '@/components/AnalysisResult';
import { type AnalysisResponse } from '@/lib/api';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdvancedAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Ana Sayfa</span>
            </Link>
            <div className="flex items-center gap-3 ml-auto">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">İlişki Analiz AI</h1>
                <p className="text-sm text-gray-600">Gelişmiş konuşma analizi</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!analysisResult ? (
          /* Initial State - Show Form Only */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-16 h-16 text-purple-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Konuşma Analizi
              </h2>
              <p className="text-gray-600">
                WhatsApp konuşmalarınızı veya metin girişi ile detaylı ilişki analizi yapın
              </p>
            </div>
            <AnalysisForm onAnalysisComplete={setAnalysisResult} />
          </div>
        ) : (
          /* Results State - Show Form and Results Side by Side */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <AnalysisForm onAnalysisComplete={setAnalysisResult} />
              <button
                onClick={() => setAnalysisResult(null)}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Yeni Analiz
              </button>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-4">
              <AnalysisResult result={analysisResult} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2025 İlişki Analiz AI. Tüm hakları saklıdır.</p>
          <p className="mt-1 text-xs">
            Bu uygulama sadece bilgilendirme amaçlıdır ve profesyonel danışmanlık yerine geçmez.
          </p>
        </div>
      </footer>
    </div>
  );
}
