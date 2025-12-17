'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Login to get token
            const loginRes = await authApi.login({ username: email, password });
            const token = loginRes.data.access_token;

            // 2. Set token temporarily to fetch profile
            localStorage.setItem('token', token);

            // 3. Get User Profile
            const profileRes = await authApi.getProfile();
            const user = profileRes.data;

            // 4. Update Auth Context
            // IMPORTANT: providers.tsx login expects (token, user)
            login(token, user as any); // Type cast if needed to match providers User type
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
                    <CardDescription className="text-center">
                        İlişki analizlerinize erişmek için giriş yapın
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Şifre</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Giriş Yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Hesabınız yok mu?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Kayıt Ol
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
