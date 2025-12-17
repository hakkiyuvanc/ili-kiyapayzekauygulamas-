'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface OutcomeChartsProps {
    stats?: {
        message_distribution?: Record<string, { count: number; percentage: number }>;
    };
    metrics?: {
        sentiment: { score: number };
        empathy: { score: number };
        conflict: { score: number };
        we_language: { score: number };
        communication_balance: { score: number };
    };
}

const FILL_COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

export default function OutcomeCharts({ stats, metrics }: OutcomeChartsProps) {
    if (!stats?.message_distribution && !metrics) return null;

    // 1. Message Distribution Data (Pie)
    const pieData = stats?.message_distribution
        ? Object.entries(stats.message_distribution).map(([name, data]) => ({
            name,
            value: data.count,
        }))
        : [];

    // 2. Metrics Radar Data
    const radarData = metrics
        ? [
            { subject: 'Duygu', A: metrics.sentiment.score, fullMark: 100 },
            { subject: 'Empati', A: metrics.empathy.score, fullMark: 100 },
            { subject: 'Çatışma', A: 100 - metrics.conflict.score, fullMark: 100 }, // Reverse conflict so higher is better
            { subject: 'Biz Dili', A: metrics.we_language.score, fullMark: 100 },
            { subject: 'Denge', A: metrics.communication_balance.score, fullMark: 100 },
        ]
        : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Pie Chart: Message Distribution */}
            {pieData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="h-[400px]">
                        <CardHeader>
                            <CardTitle className="text-center text-lg">Mesaj Dağılımı</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={FILL_COLORS[index % FILL_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Radar Chart: Relationship Health */}
            {radarData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="h-[400px]">
                        <CardHeader>
                            <CardTitle className="text-center text-lg">İlişki Dengesi</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="İlişki Sağlığı"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
