'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Shield, Sparkles, TrendingUp, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from './providers';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // If user is already logged in, they might want to go straight to dashboard,
  // but a landing page is also nice. Let's redirect only if they click "Start".

  const handleStart = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-romantic-gradient-soft font-sans text-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-rose-500 p-1.5 rounded-lg">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="amor-logo text-xl tracking-tight">AMOR AI</span>
            </div>

            <button
              onClick={handleStart}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              {user ? 'Dashboard\'a Git' : 'Giriş Yap'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-3xl -z-10 animate-pulse" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/50 text-rose-600 text-sm font-medium mb-6 border border-rose-200">
            <Sparkles className="w-4 h-4" />
            <span>Yapay Zeka Destekli İlişki Koçu</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-rose-900">
            Aşkın Matematiğini<br />
            <span className="text-rose-500">Keşfedin</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            WhatsApp konuşmalarınızı analiz edin, ilişki dinamiklerinizi anlayın ve
            bilimsel **Gottman Metodu** ile ilişkinizi güçlendirin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-rose-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Ücretsiz Analiz Başlat
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white hover:bg-rose-50 text-slate-700 rounded-2xl font-semibold text-lg border border-slate-200 transition-all hover:scale-105"
            >
              Nasıl Çalışır?
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500 grayscale opacity-70">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>%100 Gizlilik</span>
            </div>
            <div className="flex items-center gap-1">
              <Upload className="w-4 h-4" />
              <span>WhatsApp Export</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>Gottman Analizi</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* App Preview / Floating UI */}
      <section className="py-12 px-4 relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-10 transform md:rotate-1 hover:rotate-0 transition-transform duration-500"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  İlişkinizin MR'ını Çekin 🔬
                </h3>
                <ul className="space-y-4">
                  {[
                    "İletişim tonu ve duygusal analiz",
                    "Tartışma kalıplarının tespiti",
                    "Sevgi dili ve bağlanma stili analizi",
                    "Kişiselleştirilmiş ilişki tavsiyeleri"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Abstract Chart Representation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-purple-100 rounded-2xl transform rotate-3 scale-105 -z-10"></div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">İlişki Sağlığı</div>
                      <div className="text-3xl font-bold text-slate-800">85<span className="text-base text-slate-400 font-normal">/100</span></div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div className="h-32 bg-slate-50 rounded-lg flex items-end justify-between p-4 gap-2">
                    {[40, 65, 55, 80, 75, 90, 85].map((h, i) => (
                      <div key={i} className="w-full bg-rose-200 rounded-t-sm relative group">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-t-sm transition-all duration-1000"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Neden AMOR AI?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Sadece bir sohbet analizi değil, ilişkiniz için kapsamlı bir sağlık kontrolü.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8 text-rose-500" />}
              title="WhatsApp Entegrasyonu"
              description="Sohbet geçmişinizi (txt/zip) yükleyin, yapay zeka saniyeler içinde analiz etsin."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-purple-500" />}
              title="Gottman Metodu"
              description="Dünyaca ünlü ilişki terapisi metodolojisi ile bilimsel analizler ve öneriler."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-green-500" />}
              title="Gizlilik Öncelikli"
              description="Verileriniz cihazınızda işlenir. Sunucularımızda konuşma kayıtlarınız saklanmaz."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">
            3 Adımda Analiz
          </h2>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-rose-200 to-transparent -z-10" />

            <StepCard
              number="1"
              title="Sohbeti Dışa Aktar"
              description="WhatsApp'tan konuşma geçmişini 'Medyasız' olarak dışa aktar."
            />
            <StepCard
              number="2"
              title="Sisteme Yükle"
              description="Oluşturulan txt veya zip dosyasını AMOR AI'a yükle."
            />
            <StepCard
              number="3"
              title="Sonuçları Gör"
              description="İletişim haritanızı ve ilişki karnenizi anında görüntüleyin."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-4 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            İlişkinizi Güçlendirmeye Hazır Mısınız?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Bugün binlerce çift gibi siz de ilişkinizin dinamiklerini keşfedin.
          </p>
          <button
            onClick={handleStart}
            className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-rose-50 transition-colors shadow-2xl"
          >
            Hemen Başlayın - Ücretsiz
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 AMOR AI. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Gizlilik Politikası</a>
            <a href="#" className="hover:text-slate-300">Kullanım Koşulları</a>
            <a href="#" className="hover:text-slate-300">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="mb-6 bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="bg-white md:bg-transparent p-6 rounded-2xl md:p-0 relative">
      <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 border-4 border-white shadow-sm custom-shadow">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">
        {description}
      </p>
    </div>
  );
}
