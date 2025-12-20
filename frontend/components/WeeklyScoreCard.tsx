import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Flame, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analysisApi } from '@/lib/api';

interface Stats {
    total_analyses: number;
    weekly_score: number;
    streak: number;
}

export function WeeklyScoreCard() {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        analysisApi.getUserStats()
            .then(res => setStats(res.data))
            .catch(err => console.error("Stats fetch error:", err));
    }, []);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* Weekly Score */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="p-2 bg-white dark:bg-green-900 rounded-full mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Haftalık Skor</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {stats.weekly_score > 0 ? stats.weekly_score : '-'}
                    </span>
                </CardContent>
            </Card>

            {/* Streak */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-100 dark:border-orange-800">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="p-2 bg-white dark:bg-orange-900 rounded-full mb-2">
                        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Seri (Gün)</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {stats.streak}
                        </span>
                        {stats.streak > 3 && <span className="text-xs animate-bounce">🔥</span>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
