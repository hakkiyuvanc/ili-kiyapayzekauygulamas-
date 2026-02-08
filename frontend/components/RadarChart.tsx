/**
 * Radar Chart Component - İlişki Metrikleri Görselleştirme
 * 
 * 5 metriği radar chart ile gösterir:
 * - Empati
 * - İletişim
 * - Çatışma Yönetimi
 * - Biz Dili
 * - Denge
 */

'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

interface RadarChartData {
    metric: string;
    value: number;
    fullMark: number;
}

interface RelationshipRadarChartProps {
    scores: {
        empati: number;
        iletisim: number;
        catisma: number;
        biz_dili: number;
        denge: number;
    };
}

export default function RelationshipRadarChart({ scores }: RelationshipRadarChartProps) {
    const data: RadarChartData[] = [
        { metric: 'Empati', value: scores.empati, fullMark: 100 },
        { metric: 'İletişim', value: scores.iletisim, fullMark: 100 },
        { metric: 'Çatışma Yön.', value: 100 - scores.catisma, fullMark: 100 }, // Inverse
        { metric: 'Biz Dili', value: scores.biz_dili, fullMark: 100 },
        { metric: 'Denge', value: scores.denge, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
                İlişki Metrikleri
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                    <Radar
                        name="Skorlar"
                        dataKey="value"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.6}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
