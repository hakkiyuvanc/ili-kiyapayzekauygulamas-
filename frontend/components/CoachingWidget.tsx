'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { InsightData } from '@/types';

interface CoachingWidgetProps {
    latestAnalysis: InsightData | null;
}

export function CoachingWidget({ latestAnalysis }: CoachingWidgetProps) {
    const [tasks, setTasks] = useState<{ id: number; text: string; completed: boolean }[]>([]);

    useEffect(() => {
        // Generate tasks based on lowest metric or generic if no analysis
        let newTasks = [
            { id: 1, text: 'Partnerinize "Günün nasıl geçti?" diye sorun.', completed: false },
            { id: 2, text: 'Birlikte 15 dakika telefonsuz zaman geçirin.', completed: false },
            { id: 3, text: 'Ona sevdiğiniz bir özelliğini söyleyin.', completed: false },
        ];

        if (latestAnalysis && latestAnalysis.metrics) {
            // Find lowest metric
            const metrics = latestAnalysis.metrics;
            // Convert metrics object to array and sort
            // Assuming metrics structure: { sentiment: { score: 80 }, ... }
            // But InsightData interface might vary. Let's assume standard structure or generic fallback.

            // Mock logic for demo if structure fits
            const metricEntries = Object.entries(metrics).map(([key, val]: any) => ({ key, score: val.score }));
            metricEntries.sort((a, b) => a.score - b.score);
            const lowest = metricEntries[0];

            if (lowest) {
                if (lowest.key === 'empathy') {
                    newTasks = [
                        { id: 1, text: 'Partneriniz konuşurken sözünü kesmeyin.', completed: false },
                        { id: 2, text: '"Seni anlıyorum" cümlesini kullanın.', completed: false },
                        { id: 3, text: 'Duygularını sormak için zaman ayırın.', completed: false },
                    ];
                } else if (lowest.key === 'conflict') {
                    newTasks = [
                        { id: 1, text: 'Tartışmada "Sen" yerine "Ben" dili kullanın.', completed: false },
                        { id: 2, text: 'Gergin anlarda 5 dakika mola verin.', completed: false },
                        { id: 3, text: 'Ortak noktalarınızı hatırlayın.', completed: false },
                    ];
                }
                // Add more cases as needed
            }
        }

        setTasks(newTasks);
    }, [latestAnalysis]);

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <Card className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-900 dark:text-blue-100">
                    <Target className="w-5 h-5 text-blue-600" />
                    Haftalık Koçluk
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tasks.map(task => (
                        <button
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className="w-full flex items-start gap-3 p-2 hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors text-left group"
                        >
                            {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                                <Circle className="w-5 h-5 text-blue-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                {task.text}
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
