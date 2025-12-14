import { useState } from 'react';
import { ArrowLeft, Send, Clipboard } from 'lucide-react';

interface MessageAnalysisScreenProps {
  onSubmit: () => void;
  onBack: () => void;
}

export function MessageAnalysisScreen({ onSubmit, onBack }: MessageAnalysisScreenProps) {
  const [message, setMessage] = useState('');
  const [direction, setDirection] = useState<'received' | 'sending'>('received');

  const canSubmit = message.trim().length > 5;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMessage(text);
    } catch (err) {
      console.error('Paste failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-gray-900">Mesaj Analizi</h2>
          <p className="text-xs text-gray-500">Tek mesaj değerlendirmesi</p>
        </div>
      </div>

      {/* Direction Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 mb-2 block">Mesaj Yönü</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setDirection('received')}
            className={`py-2.5 rounded-lg text-sm transition-all ${
              direction === 'received'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📥 Aldığım Mesaj
          </button>
          <button
            onClick={() => setDirection('sending')}
            className={`py-2.5 rounded-lg text-sm transition-all ${
              direction === 'sending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 Göndereceğim
          </button>
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-1 mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-700">Mesaj İçeriği</label>
          {message.length === 0 && (
            <button
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs text-gray-600 transition-colors"
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
          className="w-full h-64 p-4 border-2 border-slate-200 rounded-2xl focus:border-blue-400 focus:outline-none resize-none transition-colors text-gray-700"
        />
        
        {message.length > 0 && (
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{message.length} karakter</span>
            <span className={canSubmit ? 'text-green-600' : 'text-gray-400'}>
              {canSubmit ? '✓ Analiz için hazır' : 'Daha fazla karakter gerekli'}
            </span>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <InfoCard emoji="🎯" label="Duygu" />
        <InfoCard emoji="💭" label="Niyet" />
        <InfoCard emoji="💬" label="Cevap" />
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${
          canSubmit
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
        Analiz Et
      </button>
    </div>
  );
}

function InfoCard({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl text-center border border-slate-200">
      <div className="text-xl mb-1">{emoji}</div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
