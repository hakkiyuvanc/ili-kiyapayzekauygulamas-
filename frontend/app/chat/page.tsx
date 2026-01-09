'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatScreen } from '@/components/ChatScreen';
import { MobileNav } from '@/components/MobileNav';

function ChatContent() {
    const searchParams = useSearchParams();

    // Type-safe URL parameter parsing
    const analysisIdParam = searchParams.get('analysis_id');
    const sessionIdParam = searchParams.get('session_id');

    const contextId = analysisIdParam && !isNaN(parseInt(analysisIdParam))
        ? parseInt(analysisIdParam)
        : undefined;
    const sessionId = sessionIdParam && !isNaN(parseInt(sessionIdParam))
        ? parseInt(sessionIdParam)
        : undefined;

    return (
        <div className="max-w-4xl mx-auto w-full">
            <ChatScreen initialContextId={contextId} initialSessionId={sessionId} />
        </div>
    );
}

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-romantic-gradient-soft pb-20 safe-bottom">
            <header className="bg-white/80 dark:bg-[#331A1A]/80 backdrop-blur-sm shadow-sm border-b border-[#FFB6C1]/30 p-4 sticky top-0 z-10 safe-top">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold amor-logo">
                        AI İlişki Koçu 💕
                    </h1>
                </div>
            </header>

            <main className="p-4">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center animate-fadeIn">
                            <div className="w-12 h-12 border-4 border-[#FFB6C1] border-t-[#B76E79] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#6B3F3F] font-medium">Yükleniyor...</p>
                        </div>
                    </div>
                }>
                    <ChatContent />
                </Suspense>
            </main>

            <MobileNav />
        </div>
    );
}
