'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatScreen } from '@/components/ChatScreen';
import { MobileNav } from '@/components/MobileNav';

function ChatContent() {
    const searchParams = useSearchParams();
    const contextId = searchParams.get('analysis_id') ? parseInt(searchParams.get('analysis_id')!) : undefined;
    const sessionId = searchParams.get('session_id') ? parseInt(searchParams.get('session_id')!) : undefined;

    return (
        <div className="max-w-4xl mx-auto w-full">
            <ChatScreen initialContextId={contextId} initialSessionId={sessionId} />
        </div>
    );
}

export default function ChatPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <header className="bg-white dark:bg-slate-900 shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        AI İlişki Koçu
                    </h1>
                </div>
            </header>

            <main className="p-4">
                <Suspense fallback={<div>Yükleniyor...</div>}>
                    <ChatContent />
                </Suspense>
            </main>

            <MobileNav />
        </div>
    );
}
