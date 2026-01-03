'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, Heart } from 'lucide-react';

interface FileUploadScreenProps {
  onSubmit: (file: File) => void;
  onBack: () => void;
}

export function FileUploadScreen({ onSubmit, onBack }: FileUploadScreenProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-romantic-gradient-soft flex flex-col safe-top safe-bottom px-4 py-6">
      {/* AMOR AI Header */}
      <div className="text-center mb-4 animate-fadeIn">
        <h1 className="amor-logo text-2xl mb-1">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm">Dosya yükleme 📁</p>
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
            <h2 className="text-lg font-semibold text-[#331A1A]">Dosya Yükle</h2>
            <p className="text-xs text-[#6B3F3F]">WhatsApp veya SMS geçmişi</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-[#FFF0F5] border border-[#FFB6C1]/30 rounded-xl">
          <h4 className="text-sm text-[#B76E79] mb-2 font-medium">📱 Nasıl Export Alınır?</h4>
          <div className="space-y-1 text-xs text-[#6B3F3F]">
            <p>• WhatsApp: Sohbet {">"} Ayarlar {">"} Sohbeti Dışa Aktar</p>
            <p>• SMS: Telefon ayarlarından yedek al</p>
            <p>• Desteklenen formatlar: .txt, .zip</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 mb-6">
          {!uploadedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${dragActive
                  ? 'border-[#B76E79] bg-[#FFF0F5]'
                  : 'border-[#FFB6C1]/50 bg-white hover:border-[#FFB6C1]'
                }`}
            >
              <Upload className="w-12 h-12 text-[#FFB6C1] mb-3" />
              <p className="text-sm text-[#331A1A] mb-1 font-medium">Dosyayı buraya sürükle</p>
              <p className="text-xs text-[#6B3F3F] mb-4">veya</p>

              <label className="ios-button-primary px-6 py-2.5 cursor-pointer">
                Dosya Seç 📂
                <input
                  type="file"
                  onChange={handleChange}
                  accept=".txt,.zip"
                  className="hidden"
                />
              </label>

              <p className="text-xs text-[#6B3F3F]/60 mt-4">Maks. 10 MB</p>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-br from-[#FFF0F5] to-white border-2 border-[#22C55E]/30 rounded-2xl">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-[#22C55E] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="text-sm text-[#331A1A] mb-1 font-medium">Dosya Yüklendi ✓</h4>
                  <p className="text-xs text-[#6B3F3F]">{uploadedFile.name}</p>
                  <p className="text-xs text-[#6B3F3F]/60 mt-1">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setUploadedFile(null)}
                className="text-xs text-[#FF7F7F] hover:text-[#B76E79] transition-colors"
              >
                Farklı dosya seç 🔄
              </button>
            </div>
          )}
        </div>

        {/* Analysis Info */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <AnalysisMetric icon="📊" label="Mesaj Sayısı" />
          <AnalysisMetric icon="📅" label="Zaman Aralığı" />
          <AnalysisMetric icon="💬" label="İletişim Paterni" />
        </div>

        {/* Submit Button */}
        <button
          onClick={async () => {
            if (!uploadedFile || isSubmitting) return;
            setIsSubmitting(true);
            try {
              await onSubmit(uploadedFile);
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={!uploadedFile || isSubmitting}
          className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${uploadedFile && !isSubmitting
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
              Dosyayı Analiz Et 💗
            </>
          )}
        </button>

        {/* Privacy Note */}
        <div className="mt-4 p-3 bg-[#FFF0F5] rounded-xl border border-[#FFB6C1]/20">
          <p className="text-xs text-[#6B3F3F] flex items-start gap-2">
            <span className="text-lg">🔒</span>
            <span>Dosyanız şifrelenir ve analiz sonrası otomatik olarak silinir. Hiçbir veri saklanmaz.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalysisMetric({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="ios-card p-3 text-center border border-[#FFB6C1]/20">
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs text-[#6B3F3F]">{label}</span>
    </div>
  );
}
