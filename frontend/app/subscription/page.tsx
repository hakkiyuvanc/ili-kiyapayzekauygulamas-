
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
        <div className="min-h-screen bg-romantic-gradient-soft safe-top safe-bottom">
            <div className="container mx-auto py-12 px-4 max-w-5xl">
                <div className="text-center mb-12 animate-fadeIn">
                    <h1 className="text-4xl font-bold amor-logo mb-4">
                        Pro Üyeliğe Yükseltin 💕
                    </h1>
                    <p className="text-[#6B3F3F] text-lg">
                        İlişkilerinizde daha derin içgörüler ve sınırsız analizler için Pro avantajlarını keşfedin.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <Card className="ios-card-elevated border-[#FFB6C1]/30 hover:border-[#FFB6C1] transition-all animate-slideUp">
                        <CardHeader>
                            <CardTitle className="text-2xl text-[#331A1A]">Ücretsiz</CardTitle>
                            <CardDescription className="text-[#6B3F3F]">Temel analizler için başlangıç paketi</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-[#B76E79]">₺0</span>
                                <span className="text-[#6B3F3F]/60">/ay</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-3">
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>Günlük 1 sohbet analizi</span>
                                </li>
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>Temel duygu analizi</span>
                                </li>
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>AI Koç ile sınırlı sohbet</span>
                                </li>
                                <li className="flex items-center text-[#6B3F3F]/50">
                                    <X className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span>WhatsApp geçmişi yükleme</span>
                                </li>
                                <li className="flex items-center text-[#6B3F3F]/50">
                                    <X className="w-5 h-5 mr-2 flex-shrink-0" />
                                    <span>Detaylı ilişki raporu</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-[#FFF0F5] text-[#6B3F3F] hover:bg-[#FFB6C1]/20 border border-[#FFB6C1]/30" variant="outline" disabled>
                                Mevcut Plan
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="ios-card-elevated bg-gradient-to-br from-[#FFB6C1]/10 to-[#FF7F7F]/10 border-[#B76E79]/50 relative overflow-hidden animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#B76E79] to-[#FF7F7F] text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                            POPÜLER ✨
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-[#B76E79]">Pro Üyelik</CardTitle>
                            <CardDescription className="text-[#6B3F3F]">İlişki uzmanı seviyesinde analizler</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-[#B76E79]">₺199</span>
                                <span className="text-[#6B3F3F]/60">/ay</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-3">
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>Sınırsız sohbet analizi</span>
                                </li>
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>WhatsApp geçmişi yükleme</span>
                                </li>
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>AI Koç ile sınırsız sohbet</span>
                                </li>
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>Detaylı ilişki raporu (PDF)</span>
                                </li>
                                <li className="flex items-center text-[#331A1A]">
                                    <Check className="w-5 h-5 text-[#B76E79] mr-2 flex-shrink-0" />
                                    <span>Öncelikli destek</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="ios-button-primary w-full py-3 text-white border-0"
                                onClick={handleUpgrade}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Yönlendiriliyor...' : 'Pro\'ya Yükselt 💗'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
