'use client';

import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { GlassCard } from '@/components/LottieAnimation';

interface RelationshipHealthProps {
    metrics: {
        sevgi_haritalari: number;
        hayranlik_paylasimi: number;
        yakinlasma_cabalari: number;
        olumlu_perspektif: number;
        catisma_yonetimi: number;
        hayat_hayalleri: number;
        ortak_anlam: number;
    };
}

export default function RelationshipHealthPanel({ metrics }: RelationshipHealthProps) {
    const data = [
        { subject: 'Sevgi Haritaları', A: metrics.sevgi_haritalari, fullMark: 100 },
        { subject: 'Hayranlık', A: metrics.hayranlik_paylasimi, fullMark: 100 },
        { subject: 'Yakınlaşma', A: metrics.yakinlasma_cabalari, fullMark: 100 },
        { subject: 'Perspektif', A: metrics.olumlu_perspektif, fullMark: 100 },
        { subject: 'Çatışma Y.', A: metrics.catisma_yonetimi, fullMark: 100 },
        { subject: 'Hayaller', A: metrics.hayat_hayalleri, fullMark: 100 },
        { subject: 'Ortak Anlam', A: metrics.ortak_anlam, fullMark: 100 },
    ];

    return (
        <GlassCard className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
                İlişki Sağlık Haritası (Gottman)
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#4b5563', fontSize: 12 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="İlişki Puanı"
                            dataKey="A"
                            stroke="#ec4899"
                            strokeWidth={3}
                            fill="#ec4899"
                            fillOpacity={0.6}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">
                Gottman'ın 7 Prensibine göre ilişki dengeniz
            </p>
        </GlassCard>
    );
}
