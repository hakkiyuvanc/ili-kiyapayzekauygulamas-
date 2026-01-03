import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Plus, Heart, Sparkles } from 'lucide-react';
import { api, chatApi } from '@/lib/api';
import { useAuth } from '../app/providers';
import { useRouter } from 'next/navigation';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatSession {
    id: number;
    title: string;
    updated_at: string;
}

export const ChatScreen: React.FC<{ initialSessionId?: number, initialContextId?: number }> = ({ initialSessionId, initialContextId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(initialSessionId || null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadSessions();
        if (initialSessionId) {
            loadMessages(initialSessionId);
        } else if (initialContextId) {
            startNewSession(initialContextId);
        }
    }, [initialSessionId, initialContextId]);

    const loadSessions = async () => {
        try {
            const res = await chatApi.getSessions();
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to load sessions', err);
        }
    };

    const loadMessages = async (sid: number) => {
        try {
            const res = await chatApi.getSession(sid);
            setMessages(res.data.messages || []);
            setSessionId(sid);
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    };

    const startNewSession = async (analysisId?: number) => {
        try {
            const res = await chatApi.createSession({
                title: 'Yeni Sohbet',
                analysis_id: analysisId
            });
            setSessionId(res.data.id);
            setMessages([]);
            loadSessions();
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Optimistic UI
        const tempMsg: Message = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, tempMsg]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            let currentSessionId = sessionId;
            if (!currentSessionId) {
                const res = await chatApi.createSession({ title: 'Yeni Sohbet' });
                currentSessionId = res.data.id;
                setSessionId(currentSessionId);
            }

            if (!currentSessionId) return;

            const res = await chatApi.sendMessage(currentSessionId, currentInput);
            const aiMsg = res.data;
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('Failed to send message', err);
            setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Üzgünüm, bir hata oluştu.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-romantic-gradient-soft rounded-2xl shadow-lg overflow-hidden safe-bottom">
            {/* Sidebar - Session List */}
            <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-[#FFB6C1]/30 hidden md:flex flex-col">
                <div className="p-4 border-b border-[#FFB6C1]/30">
                    <button
                        onClick={() => startNewSession()}
                        className="ios-button-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Sohbet
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 ios-scroll">
                    {sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => loadMessages(session.id)}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all ${sessionId === session.id
                                ? 'bg-white text-[#B76E79] shadow-sm border border-[#FFB6C1]/30'
                                : 'text-[#6B3F3F] hover:bg-white/50'
                                }`}
                        >
                            <div className="font-medium truncate">{session.title || 'Yeni Sohbet'}</div>
                            <div className="text-xs text-[#6B3F3F]/60 mt-1">
                                {new Date(session.updated_at).toLocaleDateString('tr-TR')}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white/60 backdrop-blur-sm">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm p-4 border-b border-[#FFB6C1]/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-lg opacity-30 animate-heartbeat"></div>
                            <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                                <Heart className="w-5 h-5 text-[#B76E79] fill-[#FFB6C1]" />
                            </div>
                        </div>
                        <div>
                            <h2 className="font-semibold text-[#331A1A] flex items-center gap-2">
                                <span className="amor-logo text-lg">AMOR AI</span>
                                <span className="text-sm font-normal text-[#6B3F3F]">Koç</span>
                            </h2>
                            <p className="text-xs text-[#6B3F3F]/60">İlişki danışmanınız 💕</p>
                        </div>
                    </div>
                    {/* Mobile: New Chat Button */}
                    <button
                        onClick={() => startNewSession()}
                        className="md:hidden p-2 bg-[#FFF0F5] text-[#B76E79] rounded-lg active:scale-95 transition-transform"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 ios-scroll">
                    {messages.length === 0 ? (
                        <div className="text-center mt-10 px-4 animate-fadeIn">
                            <div className="relative inline-block mb-4">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-2xl opacity-20 animate-heartbeat"></div>
                                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <Heart className="w-10 h-10 text-[#B76E79] fill-[#FFB6C1]" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-[#331A1A] mb-2">
                                Merhaba! 💗
                            </h3>
                            <p className="max-w-xs mx-auto text-sm text-[#6B3F3F] leading-relaxed">
                                Ben senin 7/24 yapay zeka ilişki koçunum. İlişkin, analizlerin veya duyguların hakkında konuşabiliriz.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <button
                                    onClick={() => setInput('İlişkimizi nasıl geliştirebilirim?')}
                                    className="px-3 py-1.5 bg-white text-[#B76E79] text-xs rounded-lg border border-[#FFB6C1]/30 hover:bg-[#FFF0F5] transition-colors"
                                >
                                    💬 İlişkimi geliştir
                                </button>
                                <button
                                    onClick={() => setInput('Analizim hakkında ne önerirsin?')}
                                    className="px-3 py-1.5 bg-white text-[#B76E79] text-xs rounded-lg border border-[#FFB6C1]/30 hover:bg-[#FFF0F5] transition-colors"
                                >
                                    📊 Analiz önerileri
                                </button>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-[#B76E79] to-[#FF7F7F] text-white rounded-br-sm'
                                        : 'bg-white text-[#331A1A] rounded-bl-sm border border-[#FFB6C1]/20'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="bg-white p-4 rounded-2xl rounded-bl-sm flex items-center space-x-2 border border-[#FFB6C1]/20">
                                <div className="w-2 h-2 bg-[#B76E79] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-[#FFB6C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-[#FF7F7F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-[#FFB6C1]/30">
                    <div className="flex gap-3 max-w-3xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Bir şeyler yaz... 💭"
                            className="ios-input flex-1"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="ios-button-primary p-3 disabled:opacity-50 flex items-center justify-center"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
