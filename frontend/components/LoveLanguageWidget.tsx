'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Info } from 'lucide-react';

const LOVE_LANGUAGES = [
    { id: 'words', label: 'Onay Sözleri', emoji: '🗣️', tip: 'Seni takdir ettiğini sık sık duymak istersin.' },
    { id: 'time', label: 'Kaliteli Zaman', emoji: '🕰️', tip: 'Birlikte odaklanmış zaman geçirmek senin için her şey.' },
    { id: 'gifts', label: 'Hediye Alma', emoji: '🎁', tip: 'Düşünülmüş küçük sürprizler seni mutlu eder.' },
    { id: 'service', label: 'Hizmet Eylemleri', emoji: '🛠️', tip: 'Sözler değil, yapılan işler senin için sevgidir.' },
    { id: 'touch', label: 'Fiziksel Temas', emoji: '🤗', tip: 'El ele tutuşmak ve sarılmak sana güven verir.' }
];

export function LoveLanguageWidget() {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <Card className="h-full bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-100 dark:border-pink-800">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-pink-900 dark:text-pink-100">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    Sevgi Dili
                </CardTitle>
            </CardHeader>
            <CardContent>
                {selected ? (
                    <div className="text-center py-4 space-y-4">
                        <div className="text-4xl animate-bounce">
                            {LOVE_LANGUAGES.find(l => l.id === selected)?.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-pink-800 dark:text-pink-200">
                                {LOVE_LANGUAGES.find(l => l.id === selected)?.label}
                            </h3>
                            <p className="text-sm text-pink-700 dark:text-pink-300 mt-2 px-2">
                                "{LOVE_LANGUAGES.find(l => l.id === selected)?.tip}"
                            </p>
                        </div>
                        <button
                            onClick={() => setSelected(null)}
                            className="text-xs text-pink-500 underline hover:text-pink-700 dark:hover:text-pink-300"
                        >
                            Değiştir
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xs text-pink-600 dark:text-pink-300 mb-2">Senin birincil sevgi dilin hangisi?</p>
                        <div className="grid grid-cols-1 gap-2">
                            {LOVE_LANGUAGES.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => setSelected(lang.id)}
                                    className="flex items-center gap-3 p-2 bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 rounded-lg transition-colors text-left"
                                >
                                    <span className="text-xl">{lang.emoji}</span>
                                    <span className="text-sm font-medium text-pink-900 dark:text-pink-100">{lang.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
