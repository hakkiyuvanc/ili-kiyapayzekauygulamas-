/**
 * Emotion Timeline Component - Duygu Zaman Çizelgesi
 * 
 * Mesajların zaman içindeki duygusal tonunu görselleştirir
 */

'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

interface EmotionTimelineProps {
    timeline: Array<{
        timestamp: string;
        sender: string;
        emotion: string;
        score: number;
        content_preview: string;
    }>;
}

export default function EmotionTimeline({ timeline }: EmotionTimelineProps) {
    // Zaman damgalarını basitleştir (sadece saat:dakika)
    const chartData = timeline.map((item, index) => ({
        index: index + 1,
        score: item.score,
        emotion: item.emotion,
        sender: item.sender,
        preview: item.content_preview,
    }));

    const getEmotionColor = (score: number) => {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#3b82f6'; // Blue
        if (score >= 40) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Duygu Zaman Çizelgesi
            </h3>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="index"
                            label={{ value: 'Mesaj Sırası', position: 'insideBottom', offset: -5 }}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            label={{ value: 'Duygu Skoru', angle: -90, position: 'insideLeft' }}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '12px',
                            }}
                            formatter={(value: number, name: string, props: any) => [
                                `Skor: ${value}`,
                                `Duygu: ${props.payload.emotion}`,
                            ]}
                            labelFormatter={(label) => `Mesaj #${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#ec4899"
                            strokeWidth={2}
                            fill="url(#emotionGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Pozitif (80-100)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Olumlu (60-80)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Nötr (40-60)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Negatif (0-40)</span>
                </div>
            </div>
        </div>
    );
}
