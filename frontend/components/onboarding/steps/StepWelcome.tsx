import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HeartHandshake } from 'lucide-react';

interface StepWelcomeProps {
    onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
    return (
        <div className="flex flex-col items-center text-center space-y-6">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
            >
                <HeartHandshake className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hoş Geldiniz!</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    İlişki Analiz AI'ya katıldığınız için teşekkürler. Size en iyi deneyimi sunabilmemiz için birkaç kısa sorumuz var.
                </p>
            </div>

            <Button onClick={onNext} size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Başlayalım
            </Button>
        </div>
    );
}
