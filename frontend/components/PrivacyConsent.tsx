'use client';

import { useState } from 'react';
import { Shield, Check, X, Info } from 'lucide-react';

interface PrivacyConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyConsent({ onAccept, onDecline }: PrivacyConsentProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Gizlilik ve Veri Kullanımı</h2>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              İlişki Analiz AI, verilerinizi korumayı taahhüt eder. Analiz için sağladığınız bilgiler 
              şifrelenir ve güvenli bir şekilde işlenir.
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-3 mb-6">
            <ConsentItem 
              icon={<Check className="w-5 h-5 text-green-600" />}
              text="Verileriniz uçtan uca şifrelenir"
            />
            <ConsentItem 
              icon={<Check className="w-5 h-5 text-green-600" />}
              text="Kişisel bilgiler anonim hale getirilir"
            />
            <ConsentItem 
              icon={<Check className="w-5 h-5 text-green-600" />}
              text="İstediğiniz zaman verilerinizi silebilirsiniz"
            />
            <ConsentItem 
              icon={<Check className="w-5 h-5 text-green-600" />}
              text="Üçüncü taraflarla paylaşılmaz"
            />
          </div>

          {/* Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showDetails ? 'Detayları gizle' : 'Detaylı bilgi göster'}
            </span>
          </button>

          {/* Detailed Information */}
          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700 space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Toplanan Veriler:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Anket yanıtları veya konuşma metinleri</li>
                  <li>Analiz sonuçları ve öneriler</li>
                  <li>Kullanım istatistikleri (anonim)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Veri Kullanımı:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Yapay zeka analizi ve önerileri oluşturma</li>
                  <li>Hizmet kalitesini iyileştirme</li>
                  <li>İstatistiksel araştırmalar (anonim)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Haklarınız:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verilerinize erişim hakkı</li>
                  <li>Verilerin silinmesini isteme hakkı</li>
                  <li>Veri işlemeye itiraz etme hakkı</li>
                  <li>Veri taşınabilirliği hakkı</li>
                </ul>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Bu uygulama KVKK ve GDPR düzenlemelerine uygundur. Daha fazla bilgi için 
                <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
                  Gizlilik Politikası
                </a> sayfamızı ziyaret edebilirsiniz.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Kabul Ediyorum
            </button>
            <button
              onClick={onDecline}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Reddet
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz
          </p>
        </div>
      </div>
    </div>
  );
}

function ConsentItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  );
}
