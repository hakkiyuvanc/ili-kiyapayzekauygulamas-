'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

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
          <h2 className="text-gray-900">Dosya Yükle</h2>
          <p className="text-xs text-gray-500">WhatsApp veya SMS geçmişi</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm text-blue-900 mb-2">📱 Nasıl Export Alınır?</h4>
        <div className="space-y-1 text-xs text-blue-700">
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
            className={`h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            }`}
          >
            <Upload className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-sm text-gray-700 mb-1">Dosyayı buraya sürükle</p>
            <p className="text-xs text-gray-500 mb-4">veya</p>
            
            <label className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
              Dosya Seç
              <input
                type="file"
                onChange={handleChange}
                accept=".txt,.zip"
                className="hidden"
              />
            </label>
            
            <p className="text-xs text-gray-400 mt-4">Maks. 10 MB</p>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-sm text-gray-900 mb-1">Dosya Yüklendi</h4>
                <p className="text-xs text-gray-600">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setUploadedFile(null)}
              className="text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              Farklı dosya seç
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
        className={`w-full py-4 rounded-2xl transition-all flex items-center justify-center gap-2 ${
          uploadedFile && !isSubmitting
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-[1.02]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
            <FileText className="w-5 h-5" />
            Dosyayı Analiz Et
          </>
        )}
      </button>

      {/* Privacy Note */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl">
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <span className="text-lg">🔒</span>
          <span>Dosyanız şifrelenir ve analiz sonrası otomatik olarak silinir. Hiçbir veri saklanmaz.</span>
        </p>
      </div>
    </div>
  );
}

function AnalysisMetric({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl text-center border border-slate-200">
      <div className="text-xl mb-1">{icon}</div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
