'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Copy, Check } from 'lucide-react';
import { analysisApi } from '@/lib/api';
import { useToastContext } from '@/app/providers';

const TONES = [
    { value: 'polite', label: '🙏 Kibar' },
    { value: 'professional', label: '💼 Profesyonel' },
    { value: 'romantic', label: '❤️ Romantik' },
    { value: 'assertive', label: '💪 Kararlı' },
];

export function ToneEditor() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [tone, setTone] = useState('polite');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { success, error } = useToastContext();

    const handleRewrite = async () => {
        if (!input.trim()) return;

        setLoading(true);
        try {
            const res = await analysisApi.rewriteMessage(input, tone);
            setOutput(res.data.rewritten_text);
        } catch (err) {
            console.error(err);
            error('Dönüştürme başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        success('Kopyalandı!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border-indigo-100 dark:border-slate-700">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-indigo-900 dark:text-indigo-100">
                    <Wand2 className="w-5 h-5 text-indigo-600" />
                    Mesaj Asistanı
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Orijinal Mesaj</label>
                    <Textarea
                        placeholder="Ne söylemek istersin?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-h-[80px] bg-white dark:bg-slate-900 resize-none border-gray-200 dark:border-slate-700 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TONES.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleRewrite}
                        disabled={!input.trim() || loading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? 'Dönüştürülüyor...' : 'Dönüştür'}
                    </Button>
                </div>

                {output && (
                    <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Öneri</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-6 w-6 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-indigo-600" />}
                            </Button>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm">
                            {output}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
