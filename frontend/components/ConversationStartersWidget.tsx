'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
    "Beni seninle ilgili en çok şaşırtan şey...",
    "Birlikte yaşlanmakla ilgili en büyük hayalin ne?",
    "Sence bizim 'şarkımız' hangisi ve neden?",
    "Benimle ilgili en sevdiğin ama hiç söylemediğin şey ne?",
    "İlişkimizde en çok gurur duyduğun an hangisi?",
    "Çocukluğundan bugünkü ilişkine taşıdığın en güzel ders ne?",
    "Eğer dünyanın herhangi bir yerine gidebilseydik, neresi olurdu?",
    "Beni üç kelimeyle tarif etsen, hangilerini seçerdin?",
    "Sence birbirimizi en iyi tamamladığımız özelliklerimiz neler?",
    "Bugüne kadar birlikte atlattığımız en zorlu engel neydi?"
];

export function ConversationStartersWidget() {
    const [index, setIndex] = useState(0);

    const nextQuestion = () => {
        setIndex((prev) => (prev + 1) % QUESTIONS.length);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-100 dark:border-teal-800">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-teal-900 dark:text-teal-100">
                    <MessageCircle className="w-5 h-5 text-teal-600" />
                    Derin Sohbetler
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-[180px]">
                <div className="relative flex-1 flex items-center justify-center">
                    <Quote className="absolute top-0 left-0 w-8 h-8 text-teal-200 dark:text-teal-800 opacity-50" />
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center font-medium text-teal-800 dark:text-teal-200 text-lg px-4"
                        >
                            "{QUESTIONS[index]}"
                        </motion.p>
                    </AnimatePresence>
                    <Quote className="absolute bottom-0 right-0 w-8 h-8 text-teal-200 dark:text-teal-800 opacity-50 transform rotate-180" />
                </div>

                <div className="mt-4 flex justify-center">
                    <Button
                        onClick={nextQuestion}
                        variant="ghost"
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Yeni Soru
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
