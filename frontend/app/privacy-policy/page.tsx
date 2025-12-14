'use client';

import { Shield, Lock, Eye, Trash2, Download, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
              <p className="text-sm text-gray-600">Son güncelleme: 11 Aralık 2025</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-gray-700">
                İlişki Analiz AI olarak gizliliğiniz bizim için önceliktir. Bu politika, 
                verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuzu açıklar.
              </p>
            </div>
          </section>

          {/* Data Collection */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Toplanan Veriler</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Hizmetimizi kullandığınızda aşağıdaki verileri topluyoruz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Analiz Verileri:</strong> Anket yanıtları, konuşma metinleri ve 
                  WhatsApp dışa aktarma dosyaları
                </li>
                <li>
                  <strong>Hesap Bilgileri:</strong> E-posta adresi (kayıt yaptırırsanız)
                </li>
                <li>
                  <strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri
                </li>
                <li>
                  <strong>Kullanım Verileri:</strong> Analiz sayıları ve özellik kullanım istatistikleri
                </li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Veri Kullanımı</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Topladığımız veriler şu amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Yapay zeka destekli ilişki analizi sağlamak</li>
                <li>Kişiselleştirilmiş öneriler ve içgörüler oluşturmak</li>
                <li>Hizmet kalitesini iyileştirmek ve yeni özellikler geliştirmek</li>
                <li>Güvenlik ve dolandırıcılık önleme amaçları</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Veri Güvenliği</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>Verilerinizi korumak için aşağıdaki önlemleri alıyoruz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS şifreleme ile veri iletimi</li>
                <li>Veritabanı şifreleme ve güvenli depolama</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Erişim kontrolü ve kimlik doğrulama</li>
                <li>Kişisel verilerin anonimleştirilmesi</li>
              </ul>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Haklarınız (KVKK/GDPR)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RightCard
                icon={<Eye className="w-5 h-5 text-blue-600" />}
                title="Erişim Hakkı"
                description="Hangi verilerinizi işlediğimizi öğrenme hakkı"
              />
              <RightCard
                icon={<Trash2 className="w-5 h-5 text-red-600" />}
                title="Silme Hakkı"
                description="Verilerinizin silinmesini talep etme hakkı"
              />
              <RightCard
                icon={<Download className="w-5 h-5 text-green-600" />}
                title="Taşınabilirlik"
                description="Verilerinizi indirme ve taşıma hakkı"
              />
              <RightCard
                icon={<Lock className="w-5 h-5 text-purple-600" />}
                title="İtiraz Hakkı"
                description="Veri işlemeye itiraz etme hakkı"
              />
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Veri Saklama</h2>
            <div className="space-y-3 text-gray-700">
              <p>Verilerinizi şu sürelerle saklıyoruz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Analiz Verileri:</strong> 12 ay (veya silme talebine kadar)</li>
                <li><strong>Hesap Bilgileri:</strong> Hesap aktif olduğu sürece</li>
                <li><strong>Teknik Loglar:</strong> 90 gün</li>
                <li><strong>Anonim İstatistikler:</strong> Süresiz</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Çerezler (Cookies)</h2>
            <div className="space-y-3 text-gray-700">
              <p>Hizmetimizi geliştirmek için çerezler kullanıyoruz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi ve güvenlik</li>
                <li><strong>İşlevsel Çerezler:</strong> Tercihlerinizi hatırlama</li>
                <li><strong>Analitik Çerezler:</strong> Kullanım istatistikleri (anonim)</li>
              </ul>
            </div>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Üçüncü Taraflar</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Verilerinizi üçüncü taraflarla paylaşmıyoruz. Ancak hizmet sağlayıcılar 
                (hosting, analitik) verilerinizi işleyebilir. Bu sağlayıcılar gizlilik 
                taahhütnamesi imzalamıştır.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Çocukların Gizliliği</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Hizmetimiz 18 yaş altı kullanıcılara yönelik değildir. Ebeveyn izni olmadan 
                18 yaş altı kullanıcılardan bilerek veri toplamıyoruz.
              </p>
            </div>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Politika Değişiklikleri</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler 
                hakkında sizi e-posta ile bilgilendireceğiz.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">İletişim</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Gizlilik haklarınızı kullanmak veya sorularınız için:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>E-posta:</strong> privacy@iliskianaliz.ai</p>
              <p><strong>Veri Sorumlusu:</strong> İlişki Analiz AI</p>
              <p><strong>Adres:</strong> [Şirket Adresi]</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function RightCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
