'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MessageSquare, Loader2 } from 'lucide-react';
import { analysisApi, type AnalysisResponse } from '@/lib/api';

interface AnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

export default function AnalysisForm({ onAnalysisComplete }: AnalysisFormProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'text' | 'file'>('text');

  const handleTextAnalysis = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Lütfen analiz edilecek metni girin');
      return;
    }

    if (trimmedText.length < 10) {
      setError('Metin çok kısa (minimum 10 karakter)');
      return;
    }

    if (trimmedText.split(/\s+/).filter(w => w.length > 0).length < 3) {
      setError('Anlamlı bir analiz için en az 3 kelime gerekli');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analysisApi.analyze({
        text,
        format_type: 'auto',
        privacy_mode: true,
      });
      onAnalysisComplete(response.data);
      setText('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analiz sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileAnalysis = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analysisApi.uploadAndAnalyze(file, true);
      onAnalysisComplete(response.data);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Dosya analizi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = ['.txt', '.json', '.log', '.zip'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        setError(`Geçersiz dosya formatı. İzin verilenler: ${validExtensions.join(', ')}`);
        e.target.value = '';
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Dosya boyutu 10MB\'dan küçük olmalıdır');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>İlişki Analizi</CardTitle>
        <CardDescription>
          Konuşmanızı metin olarak girin veya WhatsApp export dosyası yükleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2 border-b pb-4">
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            onClick={() => setMode('text')}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Metin Gir
          </Button>
          <Button
            variant={mode === 'file' ? 'default' : 'outline'}
            onClick={() => setMode('file')}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Dosya Yükle
          </Button>
        </div>

        {/* Text Mode */}
        {mode === 'text' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium mb-2">
                Konuşma Metni
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ali: Merhaba nasılsın?&#10;Ayşe: İyiyim teşekkürler sen nasılsın?&#10;Ali: Ben de iyiyim..."
                className="w-full h-64 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: "İsim: Mesaj" veya WhatsApp export formatı
              </p>
            </div>
            <Button
              onClick={handleTextAnalysis}
              disabled={loading || !text.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                'Analiz Et'
              )}
            </Button>
          </div>
        )}

        {/* File Mode */}
        {mode === 'file' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="file" className="block text-sm font-medium mb-2">
                Dosya Seç
              </label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.json,.log,.zip"
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="file"
                  className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
                >
                  Dosya Seç
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  TXT, JSON, LOG veya ZIP (Max: 10MB)
                </p>
                {file && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleFileAnalysis}
              disabled={loading || !file}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                'Dosyayı Analiz Et'
              )}
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
