/**
 * Gottman Metrics Radar Chart Component
 * Displays relationship health across 7 Gottman principles
 */

"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { GottmanMetrics, gottmanToChartData } from '@/types/ai_response';

interface GottmanRadarChartProps {
    metrics: GottmanMetrics;
    className?: string;
}

export default function GottmanRadarChart({ metrics, className = '' }: GottmanRadarChartProps) {
    const data = gottmanToChartData(metrics);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-rose-200 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-slate-800 text-sm">{data.subject}</p>
                    <p className="text-rose-600 font-bold text-lg">{data.score}/100</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Gottman 7 Prensibi Analizi
                </h3>

                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={data}>
                        <PolarGrid stroke="#fecdd3" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickLine={false}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            tickCount={6}
                        />
                        <Radar
                            name="Skor"
                            dataKey="score"
                            stroke="#f43f5e"
                            fill="#f43f5e"
                            fillOpacity={0.6}
                            strokeWidth={2}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(metrics).map(([key, value]) => {
                        const labels: Record<string, string> = {
                            sevgi_haritalari: "Sevgi Haritaları",
                            hayranlik_paylasimi: "Hayranlık",
                            yakinlasma_cabalari: "Yakınlaşma",
                            olumlu_perspektif: "Olumlu Bakış",
                            catisma_yonetimi: "Çatışma Yönetimi",
                            hayat_hayalleri: "Hayaller",
                            ortak_anlam: "Ortak Anlam"
                        };

                        const statusColors: Record<string, string> = {
                            "Mükemmel": "bg-green-100 text-green-700 border-green-200",
                            "İyi": "bg-lime-100 text-lime-700 border-lime-200",
                            "Orta": "bg-amber-100 text-amber-700 border-amber-200",
                            "Geliştirilmeli": "bg-orange-100 text-orange-700 border-orange-200",
                            "Kritik": "bg-red-100 text-red-700 border-red-200"
                        };

                        return (
                            <div key={key} className="text-xs">
                                <div className="font-medium text-slate-700 mb-1">{labels[key]}</div>
                                <div className={`px-2 py-1 rounded-md border ${statusColors[value.durum] || 'bg-gray-100 text-gray-700'}`}>
                                    {value.durum}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
