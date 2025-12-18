import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Smile, Heart, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface DailyStatus {
    completed: boolean;
    data: any;
}

export const DailyPulse = () => {
    const [status, setStatus] = useState<DailyStatus | null>(null);
    const [mood, setMood] = useState(3);
    const [connection, setConnection] = useState(3);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/api/daily/status');
            setStatus(res.data);
        } catch (err) {
            console.error('Failed to check daily status', err);
        }
    };

    const submitPulse = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/api/daily/checkin', {
                mood_score: mood,
                connection_score: connection,
                note: note
            });
            setStatus({ completed: true, data: null });
        } catch (err) {
            console.error('Failed to submit pulse', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!status) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-700 rounded-2xl"></div>;

    if (status.completed) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-900/30 dark:to-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-800 text-center"
            >
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-white dark:bg-emerald-800 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-300" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Bugünkü Nabız Alındı!</h3>
                <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1">Yarın görüşmek üzere.</p>
            </motion.div>
        );
    }

    const emojis = ['😭', '😕', '😐', '🙂', '😍'];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Günlük İlişki Nabzı</h3>
            </div>

            <div className="space-y-6">
                {/* Mood */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Bugün nasıl hissediyorsun?
                    </label>
                    <div className="flex justify-between px-2">
                        {emojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                onClick={() => setMood(idx + 1)}
                                className={`text-2xl transition-transform hover:scale-125 ${mood === idx + 1 ? 'scale-125 drop-shadow-md' : 'opacity-50 grayscale'
                                    }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Connection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Partnerinle bağlantın nasıl?
                    </label>
                    <div className="flex items-center gap-4">
                        <Heart className="w-5 h-5 text-gray-400" />
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={connection}
                            onChange={(e) => setConnection(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Kopuk</span>
                        <span>Çok Yakın</span>
                    </div>
                </div>

                {/* Note */}
                <textarea
                    placeholder="Güne dair kısa bir not... (Opsiyonel)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                />

                <button
                    onClick={submitPulse}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Kaydediliyor...' : 'Nabzı Kaydet'}
                </button>
            </div>
        </div>
    );
};
