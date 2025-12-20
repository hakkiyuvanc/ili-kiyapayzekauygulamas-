import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepGoalsProps {
    onNext: (goals: string[]) => void;
    onBack: () => void;
}

const GOAL_OPTIONS = [
    { id: 'communication', label: 'İletişimi Geliştirmek', icon: MessageCircle, color: 'text-blue-500' },
    { id: 'conflict', label: 'Çatışmaları Çözmek', icon: ShieldAlert, color: 'text-red-500' },
    { id: 'harmony', label: 'Uyum Analizi', icon: Heart, color: 'text-pink-500' },
    { id: 'insight', label: 'Derin İçgörü', icon: BrainCircuit, color: 'text-purple-500' },
    { id: 'fun', label: 'Merak & Eğlence', icon: Sparkles, color: 'text-amber-500' },
];

export function StepGoals({ onNext, onBack }: StepGoalsProps) {
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const toggleGoal = (id: string) => {
        setSelectedGoals(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        onNext(selectedGoals);
    };

    return (
        <div className="flex flex-col space-y-6 h-full">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hedefleriniz Neler?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Size en uygun analizleri sunabilmek için seçin (Birden fazla seçebilirsiniz)
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[400px] px-1">
                {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    const Icon = goal.icon;
                    return (
                        <motion.button
                            key={goal.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleGoal(goal.id)}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all ${isSelected
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hovered:bg-slate-50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-slate-100 dark:bg-slate-700'} mr-4`}>
                                <Icon className={`w-6 h-6 ${goal.color}`} />
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                {goal.label}
                            </span>
                            {isSelected && (
                                <span className="ml-auto w-3 h-3 bg-indigo-600 rounded-full" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex gap-3 pt-4 mt-auto">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    Geri
                </Button>
                <Button onClick={handleSubmit} disabled={selectedGoals.length === 0} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Tamamla
                </Button>
            </div>
        </div>
    );
}
