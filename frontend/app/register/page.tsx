'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, User, Mail, Lock, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.register({ email, password, full_name: fullName });
            // Redirect to verify page with email
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Kayıt başarısız oldu.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        İlişki Analiz AI
                    </h1>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Hesap Oluştur</CardTitle>
                        <CardDescription className="text-center">
                            Aşk hayatınızı yapay zeka ile keşfedin
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="fullname" className="text-sm font-medium ml-1">Ad Soyad</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="fullname"
                                        type="text"
                                        placeholder="Adınız Soyadınız"
                                        className="pl-10 h-10 bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 focus:ring-indigo-500"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        className="pl-10 h-10 bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 focus:ring-indigo-500"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium ml-1">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="En az 6 karakter"
                                        className="pl-10 h-10 bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700 focus:ring-indigo-500"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
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
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Kayıt Ol <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Zaten hesabınız var mı?{' '}
                            <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                Giriş Yap
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
