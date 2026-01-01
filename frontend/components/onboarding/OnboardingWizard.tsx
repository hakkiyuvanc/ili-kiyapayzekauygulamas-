'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepWelcome } from './steps/StepWelcome';
import { StepProfile } from './steps/StepProfile';
import { StepGoals } from './steps/StepGoals';
import { useAuth, useToastContext } from '@/app/providers';

export function OnboardingWizard() {
    const { success, error } = useToastContext();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [data, setData] = useState({
        fullName: user?.full_name || '',
        goals: [] as string[]
    });

    const totalSteps = 3;

    const handleNext = (stepData: any = {}) => {
        setData(prev => ({ ...prev, ...stepData }));

        if (step === totalSteps - 1) {
            handleComplete({ ...data, ...stepData });
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleComplete = async (finalData: typeof data) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/onboarding`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: finalData.fullName,
                    goals: finalData.goals,
                    onboarding_completed: true
                })
            });

            if (res.ok) {
                success("Profiliniz başarıyla oluşturuldu!");
                // Update local user context if possible, or force reload
                // Assuming useAuth has a way to revalidate, for now just reload
                window.location.reload();
            } else {
                console.error("Onboarding failed");
                error("Kaydetme başarısız oldu. Lütfen tekrar deneyin.");
            }
        } catch (err) {
            console.error("Error saving onboarding:", err);
            error("Bir bağlantı hatası oluştu.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 dark:bg-slate-800 w-full">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <StepWelcome onNext={handleNext} />
                            </motion.div>
                        )}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <StepProfile onNext={handleNext} onBack={handleBack} initialData={{ fullName: data.fullName }} />
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <StepGoals onNext={(goals) => handleNext({ goals })} onBack={handleBack} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
