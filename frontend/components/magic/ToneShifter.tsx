"use client";

import { useState } from "react";
import { GlassCard } from "@/components/LottieAnimation";
import { analysisApi } from "@/lib/api";
import { Wand2, Sparkles, MessageCircle, AlertTriangle } from "lucide-react";

interface ToneShiftResult {
  original_message: string;
  rewritten_message: string;
  tone_name: string;
  analysis: {
    current_tone: string;
    tone_score: number;
    issues: { [key: string]: boolean };
  };
  improvements: string[];
}

export default function ToneShifter() {
  const [message, setMessage] = useState("");
  const [targetTone, setTargetTone] = useState<
    "yaratici" | "empatik" | "sakin" | "net"
  >("yaratici");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToneShiftResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleShift = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await analysisApi.shiftTone(message, targetTone);
      setResult(response.data);
    } catch (err: any) {
      console.error("Tone shift error:", err);
      setError("Mesaj düzenlenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Wand2 className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Sihirli Mesaj Düzenleyici
          </h2>
        </div>

        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı buraya yazın (Örn: Sen beni hiç dinlemiyorsun!)..."
            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all resize-none h-32"
          />

          <div className="flex flex-wrap gap-3">
            {[
              { id: "yaratici", label: "Yapıcı", icon: "✨" },
              { id: "empatik", label: "Empatik", icon: "❤️" },
              { id: "sakin", label: "Sakin", icon: "🌿" },
              { id: "net", label: "Net", icon: "🎯" },
            ].map((tone) => (
              <button
                key={tone.id}
                onClick={() => setTargetTone(tone.id as any)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  targetTone === tone.id
                    ? "bg-pink-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">{tone.icon}</span>
                {tone.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleShift}
            disabled={loading || !message.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Sihirli Dokunuş Yap</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {result && (
        <GlassCard className="p-6 border-l-4 border-l-green-500 animate-fade-in-up">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                Önerilen Mesaj
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                {result.tone_name}
              </span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
              <p className="text-lg text-gray-800 dark:text-gray-100 font-medium">
                "{result.rewritten_message}"
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                İyileştirmeler
              </h4>
              <ul className="space-y-1">
                {result.improvements.map((imp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span className="mr-2 text-green-500">✓</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-gray-400 mt-2 text-center">
              AI Analizi: Mevcut Ton <b>{result.analysis.current_tone}</b> (
              {result.analysis.tone_score}/100)
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
