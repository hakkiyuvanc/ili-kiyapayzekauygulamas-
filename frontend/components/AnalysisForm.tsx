'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MessageSquare } from 'lucide-react';
import { analysisApi, type AnalysisResponse, type V2AnalysisResult } from '@/lib/api';
import AnalysisStepper from '@/components/ui/AnalysisStepper';
import ErrorToast, { classifyError, type AppError } from '@/components/ErrorToast';

interface AnalysisFormProps {
  onAnalysisComplete: (result: AnalysisResponse | V2AnalysisResult) => void;
}

export default function AnalysisForm({ onAnalysisComplete }: AnalysisFormProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [retryFn, setRetryFn] = useState<(() => void) | null>(null);
  const [mode, setMode] = useState<'text' | 'file'>('text');

  const saveToLocalDb = async (data: any) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveAnalysis(data);
        console.log('Analysis saved locally');
      } catch (err) {
        console.error('Failed to save analysis locally:', err);
      }
    }
  };

  const handleTextAnalysis = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      setError({ type: 'generic', message: 'Lütfen analiz edilecek metni girin' });
      return;
    }
    if (trimmedText.length < 10) {
      setError({ type: 'generic', message: 'Metin çok kısa (minimum 10 karakter)' });
      return;
    }
    if (trimmedText.split(/\s+/).filter(w => w.length > 0).length < 3) {
      setError({ type: 'generic', message: 'Anlamlı bir analiz için en az 3 kelime gerekli' });
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      setRetryFn(null);
      try {
        const response = await analysisApi.analyzeV2(text);
        const result = response.data;
        await saveToLocalDb(result);
        onAnalysisComplete(result);
        setText('');
      } catch (err) {
        const appErr = classifyError(err);
        setError(appErr);
        setRetryFn(() => run);
      } finally {
        setLoading(false);
      }
    };
    run();
  };

  const handleFileAnalysis = async () => {
    if (!file) {
      setError({ type: 'generic', message: 'Lütfen bir dosya seçin' });
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      setRetryFn(null);
      try {
        const response = await analysisApi.uploadAndAnalyzeV2(file!);
        const result = response.data;
        await saveToLocalDb(result);
        onAnalysisComplete(result);
        setFile(null);
      } catch (err) {
        const appErr = classifyError(err);
        setError(appErr);
        setRetryFn(() => run);
      } finally {
        setLoading(false);
      }
    };
    run();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = ['.txt', '.json', '.log', '.zip'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExt)) {
        setError({
          type: 'generic',
          message: `Geçersiz dosya formatı. İzin verilenler: ${validExtensions.join(', ')}`,
        });
        e.target.value = '';
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError({ type: 'generic', message: "Dosya boyutu 10MB'dan küçük olmalıdır" });
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setError(null);
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
        {loading ? (
          <div className="flex justify-center p-8">
            <AnalysisStepper />
          </div>
        ) : (
          <>
            {/* Mode Selection */}
            <div className="flex gap-2 border-b pb-4">
              <Button
                variant={mode === 'text' ? 'default' : 'outline'}
                onClick={() => setMode('text')}
                className="flex-1"
              >
                <div className="flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Metin Gir
                </div>
              </Button>
              <Button
                variant={mode === 'file' ? 'default' : 'outline'}
                onClick={() => setMode('file')}
                className="flex-1"
              >
                <div className="flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Dosya Yükle
                </div>
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
                  Analiz Et
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
                  Dosyayı Analiz Et
                </Button>
              </div>
            )}

            {/* Error Message */}
            <ErrorToast
              error={error}
              onDismiss={() => setError(null)}
              onRetry={retryFn ?? undefined}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
