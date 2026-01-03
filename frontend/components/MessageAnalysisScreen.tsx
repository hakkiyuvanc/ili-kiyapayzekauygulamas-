'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Clipboard, Heart } from 'lucide-react';

interface MessageAnalysisScreenProps {
  onSubmit: (message: string) => void;
  onBack: () => void;
}

export function MessageAnalysisScreen({ onSubmit, onBack }: MessageAnalysisScreenProps) {
  const [message, setMessage] = useState('');
  const [direction, setDirection] = useState<'received' | 'sending'>('received');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = message.trim().length >= 10 && message.length <= 5000;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMessage(text);
    } catch (err) {
      console.error('Paste failed:', err);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterStatus = () => {
    if (message.length === 0) return null;
    if (message.length < 10) return { color: 'text-[#FF7F7F]', text: `${10 - message.length} karakter daha gerekli` };
    if (message.length > 5000) return { color: 'text-[#FF7F7F]', text: 'Mesaj çok uzun' };
    return { color: 'text-[#22C55E]', text: '✓ Analiz için hazır 💕' };
  };

  const status = getCharacterStatus();

  return (
    <div className="min-h-screen bg-romantic-gradient-soft flex flex-col safe-top safe-bottom px-4 py-6">
      {/* AMOR AI Header */}
      <div className="text-center mb-4 animate-fadeIn">
        <h1 className="amor-logo text-2xl mb-1">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm">Mesaj analizi 💬</p>
      </div>

      <div className="ios-card-elevated p-6 flex-1 flex flex-col max-w-2xl w-full mx-auto">
        {/* Header with Back */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#FFF0F5] rounded-xl transition-colors mr-2 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-[#B76E79]" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#331A1A]">Mesaj Analizi</h2>
            <p className="text-xs text-[#6B3F3F]">Mesajı yapıştırın veya yazın</p>
          </div>
        </div>

        {/* Direction Selector */}
        <div className="mb-4">
          <label className="text-sm text-[#331A1A] mb-2 block font-medium">Mesaj Yönü</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FFF0F5] rounded-xl">
            <button
              onClick={() => setDirection('received')}
              className={`py-2.5 rounded-lg text-sm transition-all active:scale-95 ${direction === 'received'
                  ? 'bg-white text-[#B76E79] shadow-sm border border-[#FFB6C1]/30'
                  : 'text-[#6B3F3F] hover:text-[#B76E79]'
                }`}
            >
              📥 Aldığım Mesaj
            </button>
            <button
              onClick={() => setDirection('sending')}
              className={`py-2.5 rounded-lg text-sm transition-all active:scale-95 ${direction === 'sending'
                  ? 'bg-white text-[#B76E79] shadow-sm border border-[#FFB6C1]/30'
                  : 'text-[#6B3F3F] hover:text-[#B76E79]'
                }`}
            >
              📤 Göndereceğim
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div className="flex-1 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-[#331A1A] font-medium">Mesaj İçeriği</label>
            {message.length === 0 && (
              <button
                onClick={handlePaste}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F5] hover:bg-[#FFB6C1]/30 rounded-lg text-xs text-[#B76E79] transition-colors active:scale-95"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Yapıştır
              </button>
            )}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              direction === 'received'
                ? 'Aldığın mesajı buraya yapıştır...'
                : 'Göndermek istediğin mesajı yaz...'
            }
            className="ios-input w-full h-48 resize-none"
          />

          {message.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-[#6B3F3F]">{message.length} / 5000 karakter</span>
              {status && <span className={status.color}>{status.text}</span>}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <InfoCard emoji="💕" label="Duygu Analizi" />
          <InfoCard emoji="💭" label="Niyet Tespiti" />
          <InfoCard emoji="💬" label="Cevap Önerisi" />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${canSubmit && !isSubmitting
              ? 'bg-gradient-to-br from-[#B76E79] to-[#FF7F7F] text-white hover:shadow-xl active:scale-98'
              : 'bg-[#FFB6C1]/30 text-[#6B3F3F]/50 cursor-not-allowed'
            }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analiz Ediliyor...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 fill-white" />
              Analiz Et 💗
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function InfoCard({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="ios-card p-3 text-center border border-[#FFB6C1]/20">
      <div className="text-xl mb-1">{emoji}</div>
      <span className="text-xs text-[#6B3F3F]">{label}</span>
    </div>
  );
}
