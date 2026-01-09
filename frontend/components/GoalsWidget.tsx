'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit2, Flag, Plus, X } from 'lucide-react';
import { userApi } from '@/lib/api';

const PRESET_GOALS = [
    "Daha az tartışma",
    "Daha iyi dinleme",
    "Daha fazla romantizm",
    "Kaliteli zaman geçirme",
    "Güven tazelemek",
    "Geleceği planlamak"
];

interface GoalsWidgetProps {
    initialGoals: string[];
}

export function GoalsWidget({ initialGoals }: GoalsWidgetProps) {
    const [goals, setGoals] = useState<string[]>(initialGoals || []);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const toggleGoal = (goal: string) => {
        if (goals.includes(goal)) {
            setGoals(goals.filter(g => g !== goal));
        } else {
            if (goals.length < 3) {
                setGoals([...goals, goal]);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await userApi.updateGoals(goals);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save goals", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="h-full bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-100 dark:border-violet-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-lg text-violet-900 dark:text-violet-100">
                    <Flag className="w-5 h-5 text-violet-600" />
                    İlişki Hedefleri
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50"
                    disabled={saving}
                >
                    {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </Button>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-2">
                        <p className="text-xs text-violet-600 dark:text-violet-300 mb-2">3 taneye kadar seçin:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {PRESET_GOALS.map(goal => (
                                <button
                                    key={goal}
                                    onClick={() => toggleGoal(goal)}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${goals.includes(goal)
                                        ? 'bg-violet-200 dark:bg-violet-800 text-violet-900 dark:text-violet-100 font-medium'
                                        : 'bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    {goal}
                                    {goals.includes(goal) && <Check className="w-3 h-3" />}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {goals && goals.length > 0 ? (
                            goals.map((goal, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-white/60 dark:bg-black/20 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">{goal}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                <Flag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Henüz hedef belirlenmedi. <br /> "Düzenle"ye basarak ekleyin.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
