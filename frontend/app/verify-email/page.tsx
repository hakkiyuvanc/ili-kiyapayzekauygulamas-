'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Mail, CheckCircle, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.verify({ email, code });
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login?verified=true');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Doğrulama başarısız oldu.');
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Doğrulandı!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Hesabınız başarıyla aktifleştirildi.</p>
                <div className="text-sm text-gray-400">Giriş sayfasına yönlendiriliyorsunuz...</div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium ml-1">Doğrulama Kodu</label>
                <div className="text-xs text-gray-500 mb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span> adresine gönderilen 6 haneli kodu girin.
                </div>
                <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    className="h-12 text-center text-lg tracking-[0.5em] font-mono bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 focus:ring-indigo-500 rounded-xl"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-2">
                    <div className="mt-0.5 min-w-[4px] h-[4px] rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading || code.length !== 6}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Doğrulanıyor...
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        Doğrula <ArrowRight className="w-4 h-4" />
                    </div>
                )}
            </Button>
        </form>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        İlişki Analiz AI
                    </h1>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Email Doğrulama</CardTitle>
                        <CardDescription className="text-center">
                            Hesabınızı güvende tutmak için
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div className="text-center p-4">Yükleniyor...</div>}>
                            <VerifyForm />
                        </Suspense>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Kod gelmedi mi?{' '}
                            <button className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                Tekrar Gönder
                            </button>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
