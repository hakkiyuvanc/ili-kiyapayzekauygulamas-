"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analysisApi } from "@/lib/api";
import { GlassCard } from "@/components/LottieAnimation";

interface HeatmapData {
  hourly_tension: { hour: number; tension: number; message_count: number }[];
  topic_tension: {
    topic: string;
    tension: number;
    risk_level: string;
    mention_count: number;
  }[];
  overall_tension_score: number;
}

export default function HeatmapChart({ messages }: { messages: any[] }) {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (messages && messages.length > 0) {
      loadHeatmap();
    }
  }, [messages]);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const response = await analysisApi.generateHeatmap(messages);
      setData(response.data.heatmap);
    } catch (err: any) {
      console.error("Heatmap error:", err);
      // Mock data for demo if API fails or no messages
      // Remove this in production
      setData(getMockHeatmapData());
    } finally {
      setLoading(false);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-gray-500">
        <p>Analiz için yeterli mesaj yok.</p>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </GlassCard>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Saatlik Tansiyon Haritası
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourly_tension}>
              <defs>
                <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="hour"
                tickFormatter={(hour) => `${hour}:00`}
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis domain={[0, 100]} stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="tension"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorTension)"
                name="Tansiyon"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Genel Tansiyon Skoru:{" "}
          <span className="font-bold text-red-500">
            {data.overall_tension_score}/100
          </span>
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Konu Bazlı Gerilim
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topic_tension} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                  horizontal={false}
                />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  dataKey="topic"
                  type="category"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="tension"
                  fill="#F87171"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  name="Gerilim"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Riskli Konular
          </h3>
          <div className="space-y-3">
            {data.topic_tension.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                  {topic.topic}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    topic.risk_level === "Yüksek"
                      ? "bg-red-100 text-red-600"
                      : topic.risk_level === "Orta"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                  }`}
                >
                  {topic.risk_level} Risk
                </span>
              </div>
            ))}
            {data.topic_tension.length === 0 && (
              <p className="text-gray-500 text-sm">
                Riskli konu tespit edilemedi.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function getMockHeatmapData(): HeatmapData {
  return {
    hourly_tension: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tension: Math.random() * 40 + (i > 18 ? 30 : 0), // Evening spike
      message_count: Math.floor(Math.random() * 50),
    })),
    topic_tension: [
      { topic: "Para", tension: 85, risk_level: "Yüksek", mention_count: 12 },
      {
        topic: "Kıskançlık",
        tension: 60,
        risk_level: "Orta",
        mention_count: 5,
      },
      { topic: "Aile", tension: 30, risk_level: "Düşük", mention_count: 8 },
    ],
    overall_tension_score: 45,
    peak_moments: [],
    tension_trend: "stabil",
  };
}
