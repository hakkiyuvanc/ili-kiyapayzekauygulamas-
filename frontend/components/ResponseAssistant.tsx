"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Send,
  MessageCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { analysisApi } from "@/lib/api";

interface ResponseOption {
  tone: string;
  label: string;
  emoji: string;
  description: string;
  response: string;
  color: string;
}

interface AssistantResult {
  received_message: string;
  ai_generated: boolean;
  responses: ResponseOption[];
}

const EXAMPLE_MESSAGES = [
  "Neden beni hiç aramıyorsun?",
  "Seninle konuşmak istemiyorum şu an.",
  "Her şeyi yanlış anlıyorsun.",
  "Beni umursamıyorsun.",
  "Özür dilemeni bekliyorum.",
];

export const ResponseAssistant: React.FC = () => {
  const [receivedMessage, setReceivedMessage] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTone, setCopiedTone] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!receivedMessage.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analysisApi.responseAssistant(
        receivedMessage.trim(),
        context.trim(),
      );
      setResult(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Yanıt üretilirken bir hata oluştu. Lütfen tekrar deneyin.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (tone: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTone(tone);
      setTimeout(() => setCopiedTone(null), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedTone(tone);
      setTimeout(() => setCopiedTone(null), 2000);
    }
  };

  const handleExample = (msg: string) => {
    setReceivedMessage(msg);
    textareaRef.current?.focus();
  };

  const handleReset = () => {
    setReceivedMessage("");
    setContext("");
    setResult(null);
    setError(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#FFF0F5] to-[#FFE4E8] p-4 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-2 animate-fadeIn">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-2xl opacity-25 animate-heartbeat" />
            <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#FFB6C1]/30">
              <MessageCircle className="w-8 h-8 text-[#B76E79]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#331A1A] tracking-tight">
            Yanıt Asistanı
          </h1>
          <p className="text-sm text-[#6B3F3F] mt-1 max-w-xs mx-auto leading-relaxed">
            Zor bir mesaj mı aldın? AI sana 3 farklı tonda en yapıcı yanıtı
            bulsun 💕
          </p>
        </div>

        {/* Input Card */}
        <div className="ios-card-elevated p-5 mb-4 animate-slideUp">
          <label
            htmlFor="received-message"
            className="block text-sm font-semibold text-[#331A1A] mb-2"
          >
            📩 Aldığın Mesaj
          </label>
          <textarea
            id="received-message"
            ref={textareaRef}
            value={receivedMessage}
            onChange={(e) => setReceivedMessage(e.target.value)}
            placeholder="Partnerinden veya sevdiğin birinden gelen mesajı buraya yaz..."
            className="w-full ios-input resize-none text-sm leading-relaxed"
            rows={3}
            maxLength={1000}
            disabled={isLoading}
            aria-label="Aldığın mesaj"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-[#6B3F3F]/50">
              {receivedMessage.length}/1000
            </span>
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-xs text-[#B76E79] font-medium hover:underline"
              type="button"
            >
              {showContext ? "Bağlamı gizle ▲" : "+ Bağlam ekle (opsiyonel)"}
            </button>
          </div>

          {/* Optional Context */}
          {showContext && (
            <div className="mt-3 animate-fadeIn">
              <label
                htmlFor="context-input"
                className="block text-xs font-semibold text-[#6B3F3F] mb-1"
              >
                💬 İlişki Bağlamı (opsiyonel)
              </label>
              <input
                id="context-input"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Örn: 2 yıllık ilişki, son hafta gergin..."
                className="w-full ios-input text-sm"
                disabled={isLoading}
                maxLength={200}
              />
            </div>
          )}

          {/* Example Messages */}
          <div className="mt-4">
            <div className="flex items-center gap-1 mb-2">
              <Lightbulb className="w-3 h-3 text-[#B76E79]" />
              <span className="text-xs text-[#6B3F3F] font-medium">
                Örnek mesajlar:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => handleExample(msg)}
                  className="text-xs px-3 py-1.5 bg-[#FFF0F5] text-[#B76E79] rounded-lg border border-[#FFB6C1]/30 hover:bg-[#FFB6C1]/20 transition-colors active:scale-95"
                  type="button"
                >
                  {msg.length > 28 ? msg.slice(0, 28) + "…" : msg}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !receivedMessage.trim()}
            className="ios-button-primary w-full mt-4 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            id="generate-responses-btn"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Yanıtlar üretiliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>3 Yanıt Seçeneği Üret</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 animate-fadeIn">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3 animate-slideUp">
            {/* Context bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B3F3F]">
                  {result.ai_generated ? (
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#B76E79]" />
                      AI ile üretildi
                    </span>
                  ) : (
                    "Kural tabanlı yanıtlar"
                  )}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-[#B76E79] hover:underline"
                type="button"
              >
                <RefreshCw className="w-3 h-3" />
                Yeni mesaj
              </button>
            </div>

            {/* Original message */}
            <div className="bg-[#FFF0F5] rounded-xl p-3 border border-[#FFB6C1]/30">
              <p className="text-xs text-[#6B3F3F] font-medium mb-1">
                Aldığın mesaj:
              </p>
              <p className="text-sm text-[#331A1A] italic">
                "{result.received_message}"
              </p>
            </div>

            {/* Response cards */}
            {result.responses.map((option, idx) => (
              <div
                key={option.tone}
                className="ios-card-elevated p-4 animate-fadeIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Tone header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{option.emoji}</span>
                    <div>
                      <div className="font-semibold text-[#331A1A] text-sm">
                        {option.label}
                      </div>
                      <div className="text-xs text-[#6B3F3F]">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  {/* Tone color dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                </div>

                {/* Response text */}
                <div
                  className="bg-[#FFF5EE] rounded-xl p-3 mb-3 border border-[#FFB6C1]/20"
                  style={{ borderLeftColor: option.color, borderLeftWidth: 3 }}
                >
                  <p className="text-sm text-[#331A1A] leading-relaxed">
                    {option.response}
                  </p>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(option.tone, option.response)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    copiedTone === option.tone
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-[#FFF0F5] text-[#B76E79] border border-[#FFB6C1]/30 hover:bg-[#FFB6C1]/20"
                  }`}
                  type="button"
                  id={`copy-${option.tone}-btn`}
                >
                  {copiedTone === option.tone ? (
                    <>
                      <Check className="w-4 h-4" />
                      Kopyalandı!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Kopyala & Kullan
                    </>
                  )}
                </button>
              </div>
            ))}

            {/* Disclaimer */}
            <p className="text-center text-xs text-[#6B3F3F]/60 px-4 pb-2">
              💡 Bu yanıtlar öneri niteliğindedir. Kendi kelimelerinizle
              uyarlayabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
