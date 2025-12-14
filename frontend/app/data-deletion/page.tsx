'use client';

import { useState } from 'react';
import { Trash2, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DataDeletionPage() {
  const [email, setEmail] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (confirmText !== 'SİL') {
      setError('Lütfen "SİL" yazarak onaylayın');
      return;
    }

    if (!email) {
      setError('E-posta adresi gerekli');
      return;
    }

    setIsDeleting(true);

    try {
      // API çağrısı yapılacak
      // const response = await api.delete('/api/user/delete-data', { data: { email } });
      
      // Simüle edilmiş bekleme
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsDeleted(true);
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Silme İsteği Alındı</h2>
          <p className="text-gray-600 mb-6">
            Verileriniz 24 saat içinde sistemimizden tamamen silinecektir. 
            Onay e-postası gönderildi.
          </p>
          <Link href="/">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
              Ana Sayfaya Dön
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Ana Sayfa</span>
          </Link>
          <div className="flex items-center gap-3">
            <Trash2 className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Veri Silme</h1>
              <p className="text-sm text-gray-600">Verilerinizi kalıcı olarak silin</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Dikkat: Bu İşlem Geri Alınamaz</h3>
                <p className="text-sm text-red-800">
                  Tüm analiz verileriniz, hesap bilgileriniz ve geçmiş kayıtlarınız 
                  kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                </p>
              </div>
            </div>
          </div>

          {/* What will be deleted */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Silinecek Veriler:</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Tüm analiz sonuçları ve raporlar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Anket yanıtları ve konuşma metinleri</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Hesap bilgileri ve profil verileri</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Kullanım geçmişi ve tercihler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Yedeklemelerdeki tüm kayıtlar</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresiniz
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Silme talebini onaylamak için e-posta gönderilecektir
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onay için "SİL" yazın
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="SİL"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isDeleting}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Siliniyor...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Verilerimi Sil</span>
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-sm text-gray-600 space-y-2">
            <p>
              <strong>Not:</strong> Yasal yükümlülükler nedeniyle bazı veriler 
              (ör. faturalandırma kayıtları) yasal saklama süreleri boyunca tutulabilir.
            </p>
            <p>
              Sorularınız için: <a href="mailto:privacy@iliskianaliz.ai" className="text-blue-600 hover:underline">privacy@iliskianaliz.ai</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
