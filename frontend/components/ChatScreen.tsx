import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Plus, MessageSquare } from 'lucide-react';
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
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Sidebar - Session List */}
            <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => startNewSession()}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Sohbet
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => loadMessages(session.id)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${sessionId === session.id
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="font-medium truncate">{session.title || 'Yeni Sohbet'}</div>
                            <div className="text-xs text-slate-400 mt-1">
                                {new Date(session.updated_at).toLocaleDateString()}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800 dark:text-white flex items-center">
                        <Bot className="w-5 h-5 mr-2 text-indigo-500" />
                        İlişki Koçu
                    </h2>
                    {/* Mobile: New Chat Button (visible only on small screens) */}
                    <button
                        onClick={() => startNewSession()}
                        className="md:hidden p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-8 h-8 text-indigo-500 opacity-80" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Merhaba!</h3>
                            <p className="max-w-xs mx-auto text-sm">Ben senin 7/24 yapay zeka ilişki koçunum. İlişkin, analizlerin veya duyguların hakkında konuşabiliriz.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-3 max-w-3xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Bir şeyler yaz..."
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
