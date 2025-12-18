
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { toast } from 'sonner';

export default function SubscriptionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // Call backend to create checkout session
            const response = await subscriptionApi.createCheckoutSession();

            // Redirect to Stripe Checkout
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("Ödeme linki alınamadı");
            }
        } catch (error) {
            console.error(error);
            toast.error("Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
                    Pro Üyeliğe Yükseltin
                </h1>
                <p className="text-gray-400 text-lg">
                    İlişkilerinizde daha derin içgörüler ve sınırsız analizler için Pro avantajlarını keşfedin.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-2xl">Ücretsiz</CardTitle>
                        <CardDescription>Temel analizler için başlangıç paketi</CardDescription>
                        <div className="mt-4">
                            <span className="text-4xl font-bold">₺0</span>
                            <span className="text-gray-400">/ay</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-green-500 mr-2" />
                                <span>Günlük 1 sohbet analizi</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-green-500 mr-2" />
                                <span>Temel duygu analizi</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-green-500 mr-2" />
                                <span>AI Koç ile sınırlı sohbet</span>
                            </li>
                            <li className="flex items-center text-gray-500">
                                <X className="w-5 h-5 mr-2" />
                                <span>WhatsApp geçmişi yükleme</span>
                            </li>
                            <li className="flex items-center text-gray-500">
                                <X className="w-5 h-5 mr-2" />
                                <span>Detaylı ilişki raporu</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled>
                            Mevcut Plan
                        </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className="bg-gradient-to-b from-purple-900/40 to-black border-purple-500/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                        POPÜLER
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl text-purple-400">Pro Üyelik</CardTitle>
                        <CardDescription>İlişki uzmanı seviyesinde analizler</CardDescription>
                        <div className="mt-4">
                            <span className="text-4xl font-bold">₺199</span>
                            <span className="text-gray-400">/ay</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-purple-400 mr-2" />
                                <span>Sınırsız sohbet analizi</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-purple-400 mr-2" />
                                <span>WhatsApp geçmişi yükleme</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-purple-400 mr-2" />
                                <span>AI Koç ile sınırsız sohbet</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-purple-400 mr-2" />
                                <span>Detaylı ilişki raporu (PDF)</span>
                            </li>
                            <li className="flex items-center">
                                <Check className="w-5 h-5 text-purple-400 mr-2" />
                                <span>Öncelikli destek</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                            onClick={handleUpgrade}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Yönlendiriliyor...' : 'Pro\'ya Yükselt'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
