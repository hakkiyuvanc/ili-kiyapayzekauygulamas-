/**
 * Metric Cards Component
 * Displays key relationship metrics in beautiful cards
 */

"use client";

import { motion } from 'framer-motion';
import { Heart, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { GeneralReport, EmotionalAnalysis } from '@/types/ai_response';

interface MetricCardsProps {
    generalReport: GeneralReport;
    emotionalAnalysis: EmotionalAnalysis;
    className?: string;
}

export default function MetricCards({ generalReport, emotionalAnalysis, className = '' }: MetricCardsProps) {
    const metrics = [
        {
            title: "İlişki Sağlığı",
            value: generalReport.iliskki_sagligi,
            max: 100,
            icon: Heart,
            color: generalReport.iliskki_sagligi >= 70 ? "rose" : generalReport.iliskki_sagligi >= 50 ? "amber" : "red",
            description: generalReport.baskin_dinamik
        },
        {
            title: "Yakınlık Seviyesi",
            value: emotionalAnalysis.yakinlik,
            max: 100,
            icon: Sparkles,
            color: emotionalAnalysis.yakinlik >= 70 ? "rose" : emotionalAnalysis.yakinlik >= 50 ? "amber" : "orange",
            description: `İletişim tonu: ${emotionalAnalysis.iletisim_tonu}`
        },
        {
            title: "Toksisite",
            value: emotionalAnalysis.toksisite_seviyesi,
            max: 100,
            icon: AlertTriangle,
            color: emotionalAnalysis.toksisite_seviyesi <= 30 ? "green" : emotionalAnalysis.toksisite_seviyesi <= 60 ? "amber" : "red",
            description: `Duygu ifadesi: ${emotionalAnalysis.duygu_ifadesi}`,
            inverse: true // Lower is better
        },
        {
            title: "Risk Seviyesi",
            value: generalReport.risk_seviyesi,
            icon: TrendingUp,
            color: generalReport.risk_seviyesi === "Düşük" ? "green" : generalReport.risk_seviyesi === "Orta" ? "amber" : "red",
            description: "Genel durum değerlendirmesi",
            isText: true
        }
    ];

    const colorClasses: Record<string, { bg: string; text: string; border: string; progress: string }> = {
        rose: {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-200",
            progress: "bg-rose-500"
        },
        green: {
            bg: "bg-green-50",
            text: "text-green-700",
            border: "border-green-200",
            progress: "bg-green-500"
        },
        amber: {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
            progress: "bg-amber-500"
        },
        orange: {
            bg: "bg-orange-50",
            text: "text-orange-700",
            border: "border-orange-200",
            progress: "bg-orange-500"
        },
        red: {
            bg: "bg-red-50",
            text: "text-red-700",
            border: "border-red-200",
            progress: "bg-red-500"
        }
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            {metrics.map((metric, index) => {
                const colors = colorClasses[metric.color];
                const Icon = metric.icon;

                return (
                    <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${colors.bg} ${colors.border} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                                <Icon className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            {!metric.isText && (
                                <span className={`text-2xl font-bold ${colors.text}`}>
                                    {metric.value}
                                    {metric.max && `/${metric.max}`}
                                </span>
                            )}
                        </div>

                        <h3 className="font-semibold text-slate-800 mb-1">{metric.title}</h3>
                        <p className="text-xs text-slate-600 mb-3">{metric.description}</p>

                        {/* Progress bar for numeric values */}
                        {!metric.isText && metric.max && (
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                    className={`h-full ${colors.progress} rounded-full`}
                                />
                            </div>
                        )}

                        {/* Text value for risk level */}
                        {metric.isText && (
                            <div className={`text-center py-2 rounded-lg border ${colors.border} ${colors.bg}`}>
                                <span className={`font-bold ${colors.text}`}>{metric.value}</span>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
