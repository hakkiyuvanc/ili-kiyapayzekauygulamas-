'use client';

import { useState } from 'react';

export default function TestPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!text.trim()) {
      setError('Lütfen metin girin');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          format_type: 'auto',
          privacy_mode: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      console.error('Test hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            🧪 API Test Sayfası
          </h1>

          <div className="space-y-4">
            {/* Örnek Butonlar */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setText('Ali: Seni seviyorum! ❤️\nAyşe: Ben de seni çok seviyorum aşkım! 💕')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
              >
                ✅ Pozitif Örnek
              </button>
              <button
                onClick={() => setText('Ahmet: Neden aramadın?\nZeynep: Çok yoğundum\nAhmet: Her zaman bahane\nZeynep: Haksızlık ediyorsun')}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                ⚠️ Çatışma Örneği
              </button>
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konuşma Metni:
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ali: Merhaba&#10;Ayşe: Selam"
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleTest}
              disabled={loading || !text.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '⏳ Analiz Ediliyor...' : '🚀 Analiz Et'}
            </button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">❌ Hata:</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="space-y-4 mt-6">
                <h2 className="text-2xl font-bold text-gray-900">📊 Sonuçlar:</h2>
                
                {/* Score Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                      {result.overall_score.toFixed(1)}
                    </div>
                    <div className="text-gray-600">/ 10 Puan</div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Duygu"
                    score={result.metrics.sentiment.score}
                    label={result.metrics.sentiment.label}
                    icon="💚"
                  />
                  <MetricCard
                    title="Empati"
                    score={result.metrics.empathy.score}
                    label={result.metrics.empathy.label}
                    icon="🫂"
                  />
                  <MetricCard
                    title="Denge"
                    score={result.metrics.communication_balance.score}
                    label={result.metrics.communication_balance.label}
                    icon="⚖️"
                  />
                  <MetricCard
                    title="Çatışma"
                    score={result.metrics.conflict.score}
                    label={result.metrics.conflict.label}
                    icon="⚠️"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Özet:</h3>
                  <p className="text-gray-700">{result.summary}</p>
                </div>

                {/* Insights */}
                {result.insights && result.insights.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">💡 İçgörüler:</h3>
                    {result.insights.map((insight: any, idx: number) => (
                      <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">{insight.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{insight.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw JSON (for debugging) */}
                <details className="bg-gray-100 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-700">
                    🔍 Ham Veri (Geliştiriciler için)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Test Bilgileri:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Backend: http://localhost:8000</li>
            <li>✅ Endpoint: /api/analysis/analyze</li>
            <li>✅ Format: "İsim: Mesaj" şeklinde yazın</li>
            <li>✅ WhatsApp formatı da destekleniyor</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, score, label, icon }: { 
  title: string; 
  score: number; 
  label: string; 
  icon: string;
}) {
  const getColor = (score: number) => {
    if (score >= 70) return 'from-green-50 to-green-100 border-green-200 text-green-700';
    if (score >= 40) return 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700';
    return 'from-red-50 to-red-100 border-red-200 text-red-700';
  };

  return (
    <div className={`bg-gradient-to-br border rounded-lg p-4 ${getColor(score)}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-2xl font-bold">{score.toFixed(0)}%</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
}
