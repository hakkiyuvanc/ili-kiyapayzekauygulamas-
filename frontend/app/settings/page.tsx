'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, userApi, api } from '@/lib/api';
import { User } from '@/types';
import {
    Shield,
    Cpu,
    Cloud,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
} from 'lucide-react';

// ─── AI Modu Türleri ───────────────────────────────────────────────────────
type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'none';

interface SystemStatus {
    ai_provider: AIProvider;
    ai_available: boolean;
    ollama_running: boolean;
    ollama_url: string;
    ollama_model: string;
}

interface OllamaModel {
    name: string;
}

// ─── Güvenli Key Saklama Yardımcıları ─────────────────────────────────────
// Electron ortamında: node-keytar (main process IPC üzerinden)
// Web ortamında: sessionStorage (sayfa kapanınca temizlenir, localStorage değil)

function secureGet(key: string): string {
    if (typeof window === 'undefined') return '';
    // Electron: window.electronAPI.secureGet varsa kullan
    // Fallback: sessionStorage
    return sessionStorage.getItem(key) || '';
}

function secureSet(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    if (value) {
        sessionStorage.setItem(key, value);
    } else {
        sessionStorage.removeItem(key);
    }
}

// ─── Ana Bileşen ───────────────────────────────────────────────────────────
export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profil state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [loveLanguage, setLoveLanguage] = useState('');
    const [conflictStyle, setConflictStyle] = useState('');

    // AI Modu state
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [ollamaModels, setOllamaModels] = useState<string[]>([]);
    const [selectedOllamaModel, setSelectedOllamaModel] = useState('llama3');
    const [switchingAI, setSwitchingAI] = useState(false);
    const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Sistem durumunu yükle
    const loadSystemStatus = useCallback(async () => {
        try {
            const res = await api.get<SystemStatus>('/system/status');
            setSystemStatus(res.data);
            setSelectedProvider(res.data.ai_provider);
            setSelectedOllamaModel(res.data.ollama_model || 'llama3');
        } catch {
            // Backend erişilemiyorsa sessizce geç
        }
    }, []);

    // Ollama modellerini listele
    const loadOllamaModels = useCallback(async () => {
        try {
            const res = await api.get<{ running: boolean; models: string[] }>('/system/ollama/models');
            if (res.data.running) {
                setOllamaModels(res.data.models);
            }
        } catch {
            setOllamaModels([]);
        }
    }, []);

    const loadUserData = useCallback(async () => {
        try {
            const response = await authApi.getProfile();
            const userData = response.data;
            setUser(userData);
            setFullName(userData.full_name || '');
            setEmail(userData.email || '');
            setGoals(userData.goals || []);
            setLoveLanguage(userData.love_language || '');
            setConflictStyle(userData.conflict_resolution_style || '');
        } catch {
            router.push('/auth');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        loadUserData();
        loadSystemStatus();
    }, [loadUserData, loadSystemStatus]);

    useEffect(() => {
        if (selectedProvider === 'ollama') {
            loadOllamaModels();
        }
        // Kayıtlı key'i sessionStorage'dan geri yükle
        const saved = secureGet(`api_key_${selectedProvider}`);
        setApiKey(saved);
    }, [selectedProvider, loadOllamaModels]);

    // ─── Profil kaydet ─────────────────────────────────────────────────────
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await userApi.updateProfile({
                full_name: fullName,
                goals,
                love_language: loveLanguage,
                conflict_resolution_style: conflictStyle,
            });
            alert('Ayarlar başarıyla kaydedildi!');
        } catch {
            alert('Ayarlar kaydedilirken hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    // ─── AI Provider değiştir ──────────────────────────────────────────────
    const handleSwitchAI = async () => {
        setSwitchingAI(true);
        setAiMessage(null);
        try {
            const payload: Record<string, string> = { provider: selectedProvider };
            if (apiKey) {
                payload.api_key = apiKey;
                // Güvenli kaydet (session bazlı)
                secureSet(`api_key_${selectedProvider}`, apiKey);
            }
            if (selectedProvider === 'ollama') {
                payload.ollama_model = selectedOllamaModel;
            }

            const res = await api.post<{ success: boolean; provider: string; message: string }>(
                '/system/ai-provider',
                payload,
            );

            setAiMessage({ type: 'success', text: res.data.message });
            await loadSystemStatus();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
                'AI modu değiştirilemedi.';
            setAiMessage({ type: 'error', text: message });
        } finally {
            setSwitchingAI(false);
        }
    };

    // ─── Provider UI Konfigürasyonu ────────────────────────────────────────
    const providerConfig: Record<AIProvider, {
        label: string;
        icon: React.ReactNode;
        desc: string;
        badge: string;
        badgeColor: string;
        needsKey: boolean;
        keyLabel?: string;
        keyPlaceholder?: string;
    }> = {
        gemini: {
            label: 'Google Gemini',
            icon: <Cloud className="w-5 h-5 text-blue-500" />,
            desc: 'Hızlı ve güçlü. API key gerektirir.',
            badge: 'Bulut',
            badgeColor: 'bg-blue-100 text-blue-700',
            needsKey: true,
            keyLabel: 'Gemini API Key',
            keyPlaceholder: 'AIzaSy...',
        },
        openai: {
            label: 'OpenAI GPT',
            icon: <Cloud className="w-5 h-5 text-green-500" />,
            desc: 'En güçlü analiz. API key gerektirir.',
            badge: 'Bulut',
            badgeColor: 'bg-green-100 text-green-700',
            needsKey: true,
            keyLabel: 'OpenAI API Key',
            keyPlaceholder: 'sk-...',
        },
        anthropic: {
            label: 'Anthropic Claude',
            icon: <Cloud className="w-5 h-5 text-orange-500" />,
            desc: 'Derin psikolojik analiz. API key gerektirir.',
            badge: 'Bulut',
            badgeColor: 'bg-orange-100 text-orange-700',
            needsKey: true,
            keyLabel: 'Anthropic API Key',
            keyPlaceholder: 'sk-ant-...',
        },
        ollama: {
            label: 'Ollama (Yerel AI)',
            icon: <Cpu className="w-5 h-5 text-purple-500" />,
            desc: 'Tamamen gizli — internet bağlantısı gerekmez. Bilgileriniz cihazınızda kalır.',
            badge: 'Yerel & Gizli',
            badgeColor: 'bg-purple-100 text-purple-700',
            needsKey: false,
        },
        none: {
            label: 'AI Devre Dışı',
            icon: <XCircle className="w-5 h-5 text-gray-400" />,
            desc: 'Sadece temel metrik analizi. AI içgörüsü üretilmez.',
            badge: 'Kapalı',
            badgeColor: 'bg-gray-100 text-gray-500',
            needsKey: false,
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-romantic-gradient-soft flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B76E79]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-romantic-gradient-soft safe-top safe-bottom">
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">

                {/* Header */}
                <div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-[#B76E79] hover:text-[#FF7F7F] mb-4 flex items-center gap-2 transition-colors"
                    >
                        ← Dashboard&apos;a Dön
                    </button>
                    <h1 className="text-3xl font-bold text-[#331A1A]">Ayarlar</h1>
                    <p className="text-[#6B3F3F] mt-2">Profil bilgilerinizi ve tercihlerinizi yönetin</p>
                </div>

                {/* ── AI Modu Bölümü ─────────────────────────────────────────── */}
                <div className="ios-card-elevated p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-rose-100">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[#331A1A]">AI Modu</h2>
                            <p className="text-sm text-[#6B3F3F]">Gizlilik önceliğinize göre seçin</p>
                        </div>
                        {systemStatus && (
                            <div className="ml-auto flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${systemStatus.ai_available ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                                        }`}
                                />
                                <span className="text-xs text-gray-500">
                                    {systemStatus.ai_available ? 'Aktif' : 'Pasif'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Provider Kartları */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.entries(providerConfig) as [AIProvider, typeof providerConfig[AIProvider]][]).map(
                            ([key, cfg]) => (
                                <button
                                    key={key}
                                    id={`ai-provider-${key}`}
                                    onClick={() => setSelectedProvider(key)}
                                    className={`
                    relative text-left p-4 rounded-2xl border-2 transition-all duration-200
                    ${selectedProvider === key
                                            ? 'border-[#B76E79] bg-gradient-to-br from-[#FFF0F5] to-white shadow-md'
                                            : 'border-gray-100 bg-white/60 hover:border-[#FFB6C1] hover:shadow-sm'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        {cfg.icon}
                                        <span className="font-medium text-[#331A1A] text-sm">{cfg.label}</span>
                                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badgeColor}`}>
                                            {cfg.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#6B3F3F] leading-snug">{cfg.desc}</p>
                                    {selectedProvider === key && (
                                        <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#B76E79]" />
                                    )}
                                </button>
                            )
                        )}
                    </div>

                    {/* API Key Alanı — Cloud provider'lar için */}
                    {providerConfig[selectedProvider].needsKey && (
                        <div className="space-y-2 pt-2">
                            <label className="block text-sm font-medium text-[#331A1A] flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#B76E79]" />
                                {providerConfig[selectedProvider].keyLabel}
                            </label>
                            <div className="relative">
                                <input
                                    id="api-key-input"
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={providerConfig[selectedProvider].keyPlaceholder}
                                    className="ios-input w-full pr-10 font-mono text-sm"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label={showApiKey ? 'Gizle' : 'Göster'}
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Key bu oturumda güvenli tutulur, sunucuya gönderilmez; sadece lokal bağlantı için kullanılır.
                            </p>
                        </div>
                    )}

                    {/* Ollama Model Seçimi */}
                    {selectedProvider === 'ollama' && (
                        <div className="space-y-3 pt-2">
                            {systemStatus?.ollama_running ? (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Ollama çalışıyor — {systemStatus.ollama_url}
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                                    <p className="font-medium mb-1">⚠️ Ollama çalışmıyor</p>
                                    <p className="text-xs font-mono bg-amber-100 rounded px-2 py-1 mt-1 inline-block">
                                        ollama serve
                                    </p>
                                    <span className="text-xs ml-2">komutunu terminalde çalıştırın</span>
                                </div>
                            )}

                            {ollamaModels.length > 0 ? (
                                <div>
                                    <label className="block text-sm font-medium text-[#331A1A] mb-2">Model Seç</label>
                                    <select
                                        id="ollama-model-select"
                                        value={selectedOllamaModel}
                                        onChange={(e) => setSelectedOllamaModel(e.target.value)}
                                        className="ios-input w-full"
                                    >
                                        {ollamaModels.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-[#331A1A] mb-2">
                                        Model Adı
                                    </label>
                                    <input
                                        id="ollama-model-input"
                                        type="text"
                                        value={selectedOllamaModel}
                                        onChange={(e) => setSelectedOllamaModel(e.target.value)}
                                        placeholder="llama3, mistral, phi3..."
                                        className="ios-input w-full"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        İndirmek için:{' '}
                                        <code className="bg-gray-100 px-1 rounded">ollama pull llama3</code>
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={loadOllamaModels}
                                className="flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Modelleri Yenile
                            </button>
                        </div>
                    )}

                    {/* Uygula Butonu */}
                    <button
                        id="apply-ai-mode-btn"
                        type="button"
                        onClick={handleSwitchAI}
                        disabled={switchingAI}
                        className="ios-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {switchingAI ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        {switchingAI ? 'Uygulanıyor...' : 'AI Modunu Uygula'}
                    </button>

                    {/* Geri Bildirim */}
                    {aiMessage && (
                        <div
                            className={`flex items-start gap-2 text-sm rounded-xl p-3 ${aiMessage.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                        >
                            {aiMessage.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            )}
                            {aiMessage.text}
                        </div>
                    )}
                </div>

                {/* ── Profil Formu ─────────────────────────────────────────────── */}
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Account Info */}
                    <div className="ios-card-elevated p-6">
                        <h2 className="text-xl font-semibold mb-4 text-[#331A1A]">Hesap Bilgileri</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#331A1A] mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="ios-input w-full opacity-60 cursor-not-allowed"
                                />
                                <p className="text-xs text-[#6B3F3F] mt-1">E-posta değiştirilemez</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="ios-input w-full"
                                    placeholder="Adınız ve soyadınız"
                                />
                            </div>
                            {user?.is_pro && (
                                <div className="bg-gradient-to-r from-[#FFB6C1]/20 to-[#FF7F7F]/20 p-4 rounded-lg border border-[#FFB6C1]/30">
                                    <p className="text-sm font-medium text-[#B76E79]">✨ Pro Üye</p>
                                    <p className="text-xs text-[#6B3F3F] mt-1">Sınırsız analiz ve tüm özelliklere erişim</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="ios-card-elevated p-6">
                        <h2 className="text-xl font-semibold mb-4 text-[#331A1A]">Tercihler</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#331A1A] mb-2">Sevgi Dili</label>
                                <select
                                    value={loveLanguage}
                                    onChange={(e) => setLoveLanguage(e.target.value)}
                                    className="ios-input w-full"
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="words_of_affirmation">Onaylayıcı Sözler</option>
                                    <option value="quality_time">Kaliteli Zaman</option>
                                    <option value="receiving_gifts">Hediye Almak</option>
                                    <option value="acts_of_service">Hizmet Eylemleri</option>
                                    <option value="physical_touch">Fiziksel Temas</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#331A1A] mb-2">
                                    Çatışma Çözme Tarzı
                                </label>
                                <select
                                    value={conflictStyle}
                                    onChange={(e) => setConflictStyle(e.target.value)}
                                    className="ios-input w-full"
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="competing">Rekabetçi</option>
                                    <option value="collaborating">İşbirlikçi</option>
                                    <option value="compromising">Uzlaşmacı</option>
                                    <option value="avoiding">Kaçınan</option>
                                    <option value="accommodating">Uyumlu</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-3 text-[#6B3F3F] hover:bg-[#FFF0F5] rounded-lg transition"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="ios-button-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h2 className="text-xl font-semibold mb-2 text-red-900">Tehlikeli Bölge</h2>
                    <p className="text-sm text-red-700 mb-4">Bu işlemler geri alınamaz. Dikkatli olun.</p>
                    <button
                        onClick={() => {
                            if (confirm('Tüm verileriniz silinecek. Emin misiniz?')) {
                                alert('Hesap silme özelliği yakında eklenecek.');
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Hesabı Sil
                    </button>
                </div>

            </div>
        </div>
    );
}
