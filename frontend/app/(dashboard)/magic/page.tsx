"use client";

import { useState } from "react";
import HeatmapChart from "@/components/magic/HeatmapChart";
import ToneShifter from "@/components/magic/ToneShifter";
import FutureProjection from "@/components/magic/FutureProjection";
import { GlassCard } from "@/components/LottieAnimation";
import { Flame, Wand2, Calculator, ArrowRight } from "lucide-react";

export default function MagicFeaturesPage() {
  const [activeTab, setActiveTab] = useState<"heatmap" | "tone" | "projection">(
    "heatmap",
  );

  // Mock data for heatmap and projection
  // In a real app, this would come from the context or API
  const mockMessages = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    content:
      i % 3 === 0 ? "Para konusu beni geriyor" : "Neden hep böyle yapıyorsun?",
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    sender: i % 2 === 0 ? "user" : "partner",
  }));

  const mockMetrics = {
    overall_score: 65,
    sentiment: { score: 70 },
    empathy: { score: 55 },
    conflict: { score: 40 },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Sihirli Özellikler ✨
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          İlişkinizi derinlemesine analiz eden ve iyileştiren yapay zeka
          araçları.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`w-full flex items-center p-4 rounded-xl transition-all ${
              activeTab === "heatmap"
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div
              className={`p-2 rounded-lg mr-3 ${activeTab === "heatmap" ? "bg-white/20" : "bg-pink-100 dark:bg-pink-900/30 text-pink-500"}`}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Tansiyon Ölçer</span>
              <span className="text-xs opacity-80">
                Gerilim noktalarını keşfet
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("tone")}
            className={`w-full flex items-center p-4 rounded-xl transition-all ${
              activeTab === "tone"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div
              className={`p-2 rounded-lg mr-3 ${activeTab === "tone" ? "bg-white/20" : "bg-purple-100 dark:bg-purple-900/30 text-purple-500"}`}
            >
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Mesaj Sihirbazı</span>
              <span className="text-xs opacity-80">Doğru kelimeleri bul</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("projection")}
            className={`w-full flex items-center p-4 rounded-xl transition-all ${
              activeTab === "projection"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div
              className={`p-2 rounded-lg mr-3 ${activeTab === "projection" ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30 text-blue-500"}`}
            >
              <Calculator className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Gelecek Tahmini</span>
              <span className="text-xs opacity-80">İlişkinin rotasını gör</span>
            </div>
          </button>

          <GlassCard className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800/30">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 text-sm">
              Pro İpucu 💡
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">
              Daha doğru analizler için düzenli olarak konuşma verisi yükleyin.
              AI modelimiz zamanla ilişkinizi daha iyi tanıyacaktır.
            </p>
          </GlassCard>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "heatmap" && (
              <div className="animate-fade-in">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      İlişki Tansiyon Haritası
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Konuşmalarınızın duygusal sıcaklık dağılımı
                    </p>
                  </div>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Canlı Analiz
                  </span>
                </div>
                <HeatmapChart messages={mockMessages} />
              </div>
            )}

            {activeTab === "tone" && (
              <div className="animate-fade-in">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Sihirli Mesaj Düzenleyici
                  </h2>
                  <p className="text-gray-500 max-w-lg mx-auto">
                    Kırmak istemediğiniz anlarda mesajlarınızı yapıcı ve empatik
                    bir dile çevirin.
                  </p>
                </div>
                <ToneShifter />
              </div>
            )}

            {activeTab === "projection" && (
              <div className="animate-fade-in">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      6 Aylık Gelecek Projeksiyonu
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Mevcut trendlere dayalı yapay zeka tahmini
                    </p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center transition-colors">
                    Detaylı Rapor <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <FutureProjection metrics={mockMetrics} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
