'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/LottieAnimation';

interface Step {
    id: number;
    label: string;
    description: string;
}

const steps: Step[] = [
    { id: 1, label: 'Veri İşleniyor', description: 'Konuşma geçmişi taranıyor ve temizleniyor...' },
    { id: 2, label: 'Kalıp Analizi', description: 'İletişim döngüleri ve duygusal ton analiz ediliyor...' },
    { id: 3, label: 'Gottman Metodu', description: '7 Prensip ve Mahşerin 4 Atlısı kontrol ediliyor...' },
    { id: 4, label: 'Rapor Oluşturuluyor', description: 'Kişiselleştirilmiş içgörüler ve grafikler hazırlanıyor...' },
];

interface AnalysisStepperProps {
    currentStep?: number; // Optional manual control
    className?: string;
    onComplete?: () => void;
}

export default function AnalysisStepper({ currentStep: manualStep, className, onComplete }: AnalysisStepperProps) {
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        // If manual control is not provided, auto-advance for demo/UX purposes
        if (manualStep === undefined) {
            const timers: NodeJS.Timeout[] = [];

            // Artificial delay to simulate progression if real progress isn't tracked
            // Step 1 -> 2 (1.5s)
            timers.push(setTimeout(() => setActiveStep(2), 1500));
            // Step 2 -> 3 (3.5s)
            timers.push(setTimeout(() => setActiveStep(3), 3500));
            // Step 3 -> 4 (6.5s)
            timers.push(setTimeout(() => setActiveStep(4), 6500));
            // Complete (8.5s)
            timers.push(setTimeout(() => onComplete?.(), 8500));

            return () => timers.forEach(clearTimeout);
        }

        if (manualStep !== undefined) {
            setActiveStep(manualStep);
        }
        return undefined;
    }, [manualStep, onComplete]);

    return (
        <div className={cn("w-full max-w-md mx-auto space-y-4", className)}>
            <GlassCard className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-center mb-6 text-gray-800 dark:text-gray-100">
                    Analiz Yapılıyor
                </h3>

                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const isCompleted = activeStep > step.id;
                        const isCurrent = activeStep === step.id;
                        const isPending = activeStep < step.id;

                        return (
                            <div key={step.id} className="relative flex gap-4">
                                {/* Connecting Line */}
                                {index !== steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "absolute left-[15px] top-8 w-0.5 h-full -mb-4 transition-colors duration-500",
                                            isCompleted ? "bg-rose-500" : "bg-gray-200 dark:bg-gray-700"
                                        )}
                                    />
                                )}

                                <div className="relative z-10 flex-shrink-0 mt-1">
                                    {isCompleted ? (
                                        <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                            <Circle className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                <div className={cn("flex-1 pt-1 duration-300", isPending && "opacity-50")}>
                                    <h4 className={cn(
                                        "font-medium text-sm",
                                        isCurrent ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-gray-100"
                                    )}>
                                        {step.label}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
}
