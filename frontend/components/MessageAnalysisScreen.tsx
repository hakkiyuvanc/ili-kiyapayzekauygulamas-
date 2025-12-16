'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Clipboard } from 'lucide-react';

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
    if (message.length < 10) return { color: 'text-red-500', text: `${10 - message.length} karakter daha gerekli` };
    if (message.length > 5000) return { color: 'text-red-500', text: 'Mesaj çok uzun' };
    return { color: 'text-green-500', text: '✓ Analiz için hazır' };
  };

  const status = getCharacterStatus();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 min-h-[600px] flex flex-col transition-colors">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mesaj Analizi</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Mesajı yapıştırın veya yazın</p>
        </div>
      </div>

      {/* Direction Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Mesaj Yönü</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
          <button
            onClick={() => setDirection('received')}
            className={`py-2.5 rounded-lg text-sm transition-all ${
              direction === 'received'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📥 Aldığım Mesaj
          </button>
          <button
            onClick={() => setDirection('sending')}
            className={`py-2.5 rounded-lg text-sm transition-all ${
              direction === 'sending'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📤 Göndereceğim
          </button>
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Mesaj İçeriği</label>
          {message.length === 0 && (
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 transition-colors"
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
          className="w-full h-48 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none resize-none transition-colors text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 placeholder-gray-400"
        />
        
        {message.length > 0 && (
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{message.length} / 5000 karakter</span>
            {status && <span className={status.color}>{status.text}</span>}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <InfoCard emoji="🎯" label="Duygu Analizi" />
        <InfoCard emoji="💭" label="Niyet Tespiti" />
        <InfoCard emoji="💬" label="Cevap Önerisi" />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${
          canSubmit && !isSubmitting
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
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
            <Send className="w-5 h-5" />
            Analiz Et
          </>
        )}
      </button>
    </div>
  );
}

function InfoCard({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-600">
      <div className="text-xl mb-1">{emoji}</div>
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}
