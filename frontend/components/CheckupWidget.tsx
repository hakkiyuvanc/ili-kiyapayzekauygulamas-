'use client';

import { Button } from '@/components/ui/button';
import { Stethoscope, Clock, ArrowRight } from 'lucide-react';
import { InsightData } from '@/types';
import { differenceInDays } from 'date-fns';

interface CheckupWidgetProps {
    lastAnalysis: InsightData | null;
    onStart: () => void;
}

export function CheckupWidget({ lastAnalysis, onStart }: CheckupWidgetProps) {
    const daysSince = lastAnalysis
        ? differenceInDays(new Date(), new Date(lastAnalysis.timestamp))
        : null;

    const isOverdue = daysSince !== null && daysSince > 7;

    return (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">
                    <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">İlişki Check-Up</h3>
                    <p className="text-indigo-100 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysSince === null
                            ? "Henüz analiz yapılmadı"
                            : daysSince === 0
                                ? "Bugün güncellediniz ✅"
                                : `${daysSince} gün önce güncellendi`}
                    </p>
                </div>
            </div>

            {(!lastAnalysis || isOverdue) && (
                <Button
                    onClick={onStart}
                    variant="secondary"
                    className="bg-white text-indigo-600 hover:bg-indigo-50 border-0"
                >
                    Şimdi Başla
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    );
}
