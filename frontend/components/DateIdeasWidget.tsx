'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, CalendarHeart, RefreshCw } from 'lucide-react';

const IDEAS = [
    "🍕 Evde Pizza Yapma Gecesi",
    "🎬 Film Maratonu: 3leme İzleyin",
    "🌳 Doğada Yürüyüş & Piknik",
    "🎨 Birlikte Resim Yapmayı Deneyin",
    "🧩 1000 Parçalı Puzzle Bitirin",
    "🍳 Yeni Bir Tarif Deneyin",
    "☕ En Sevdiğiniz Kafede Randevu",
    "🎳 Bowling Turnuvası",
    "🌇 Gün Batımını İzleyin",
    "📸 Fotoğraf Yürüyüşüne Çıkın"
];

export function DateIdeasWidget() {
    const [idea, setIdea] = useState(IDEAS[0]);
    const [animate, setAnimate] = useState(false);

    const shuffle = () => {
        setAnimate(true);
        setTimeout(() => {
            const random = IDEAS[Math.floor(Math.random() * IDEAS.length)];
            setIdea(random);
            setAnimate(false);
        }, 300);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-100 dark:border-pink-800">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-pink-900 dark:text-pink-100">
                    <CalendarHeart className="w-5 h-5 text-pink-600" />
                    Date Fikirleri
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-between h-[140px]">
                <div className={`text-center transition-all duration-300 ${animate ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                    <p className="text-xl font-bold text-pink-700 dark:text-pink-300 leading-tight">
                        {idea}
                    </p>
                </div>

                <Button
                    onClick={shuffle}
                    variant="outline"
                    className="w-full bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Bana Fikir Ver
                </Button>
            </CardContent>
        </Card>
    );
}
