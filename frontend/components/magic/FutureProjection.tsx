"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analysisApi } from "@/lib/api";
import { GlassCard } from "@/components/LottieAnimation";

interface Scenario {
  tip: string;
  olasilik: number;
  beklenen_metrikler: { iliskki_sagligi: number };
}

interface ProjectionData {
  timeframe_months: number;
  senaryolar: Scenario[];
  aksiyon_plani: {
    ilk_30_gun: string[];
    "30_90_gun": string[];
    "90_180_gun": string[];
  };
}

export default function FutureProjection({ metrics }: { metrics: any }) {
  const [data, setData] = useState<ProjectionData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (metrics) {
      loadProjection();
    }
  }, [metrics]);

  const loadProjection = async () => {
    setLoading(true);
    try {
      const response = await analysisApi.projectFuture(metrics);
      setData(response.data.projection);
    } catch (err: any) {
      console.error("Projection error:", err);
      // Fallback/Mock
      setData(getMockProjection(metrics));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (!data) return null;

  // Chart data format
  const chartData = [
    {
      month: "Şimdi",
      iyimser: metrics.overall_score || 50,
      mevcut: metrics.overall_score || 50,
      kotumser: metrics.overall_score || 50,
    },
    {
      month: "1. Ay",
      iyimser: metrics.overall_score + 5,
      mevcut: metrics.overall_score,
      kotumser: metrics.overall_score - 5,
    },
    {
      month: "3. Ay",
      iyimser: metrics.overall_score + 15,
      mevcut: metrics.overall_score,
      kotumser: metrics.overall_score - 15,
    },
    {
      month: "6. Ay",
      iyimser: data.senaryolar.find((s) => s.tip === "İyimser")
        ?.beklenen_metrikler.iliskki_sagligi,
      mevcut: data.senaryolar.find((s) => s.tip === "Mevcut Durum")
        ?.beklenen_metrikler.iliskki_sagligi,
      kotumser: data.senaryolar.find((s) => s.tip === "Kötümser")
        ?.beklenen_metrikler.iliskki_sagligi,
    },
  ];

  return (
    <div className="space-y-8">
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4">Gelecek Tahmini (6 Ay)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis domain={[0, 100]} stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="iyimser"
                name="İyimser Senaryo"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="mevcut"
                name="Mevcut Gidişat"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="kotumser"
                name="Kötümser Senaryo"
                stroke="#EF4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.senaryolar.map((scenario, index) => (
          <GlassCard
            key={index}
            className={`p-4 border-t-4 ${
              scenario.tip === "İyimser"
                ? "border-t-green-500"
                : scenario.tip === "Mevcut Durum"
                  ? "border-t-yellow-500"
                  : "border-t-red-500"
            }`}
          >
            <h4 className="font-bold text-lg mb-2">{scenario.tip}</h4>
            <p className="text-sm text-gray-600 mb-2">
              Olasılık: %{scenario.olasilik}
            </p>
            <div className="text-2xl font-bold mb-2">
              {scenario.beklenen_metrikler.iliskki_sagligi}/100
            </div>
            <p className="text-xs text-gray-500">Beklenen İlişki Sağlığı</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="font-bold text-lg mb-4 text-blue-800 dark:text-blue-300">
          Aksiyon Planı
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">İlk 30 Gün</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.aksiyon_plani.ilk_30_gun?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">30-90 Gün</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.aksiyon_plani["30_90_gun"]?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">90-180 Gün</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.aksiyon_plani["90_180_gun"]?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function getMockProjection(metrics: any): ProjectionData {
  const base = metrics.overall_score || 50;
  return {
    timeframe_months: 6,
    senaryolar: [
      {
        tip: "İyimser",
        olasilik: 30,
        beklenen_metrikler: { iliskki_sagligi: Math.min(base + 20, 100) },
      },
      {
        tip: "Mevcut Durum",
        olasilik: 50,
        beklenen_metrikler: { iliskki_sagligi: base },
      },
      {
        tip: "Kötümser",
        olasilik: 20,
        beklenen_metrikler: { iliskki_sagligi: Math.max(base - 20, 0) },
      },
    ],
    aksiyon_plani: {
      ilk_30_gun: ["Düzenli iletişim", "Empati geliştirme"],
      "30_90_gun": ["Ortak hedefler belirleme", "Çatışma yönetimi"],
      "90_180_gun": ["Gelecek planlaması", "İlişki vizyonu"],
    },
  };
}
