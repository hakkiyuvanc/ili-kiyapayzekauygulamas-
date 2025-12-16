'use client';

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts';
import { InsightData } from '@/types';

interface MetricRadarChartProps {
    metrics: InsightData['metrics'];
}

export function MetricRadarChart({ metrics }: MetricRadarChartProps) {
    const data = [
        { subject: 'İletişim', A: metrics.communication, fullMark: 100 },
        { subject: 'Duygusal', A: metrics.emotional, fullMark: 100 },
        { subject: 'Uyum', A: metrics.compatibility, fullMark: 100 },
        { subject: 'Çatışma Y.', A: 100 - metrics.conflict, fullMark: 100 }, // Conflict ters orantılı (düşük iyidir, grafikte yüksek görünmesi için ters çevrildi)
    ];

    if (metrics.we_language) {
        data.push({ subject: 'Biz Dili', A: metrics.we_language.score, fullMark: 100 });
    }
    if (metrics.empathy) {
        data.push({ subject: 'Empati', A: metrics.empathy.score, fullMark: 100 });
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skor"
                        dataKey="A"
                        stroke="#ec4899"
                        strokeWidth={2}
                        fill="#ec4899"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
