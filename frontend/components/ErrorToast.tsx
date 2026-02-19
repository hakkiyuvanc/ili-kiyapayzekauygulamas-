'use client';

import { useEffect, useState } from 'react';
import { X, Wifi, Clock, AlertTriangle, ServerCrash, RefreshCw } from 'lucide-react';

export type ErrorType = 'network' | 'timeout' | 'rate_limit' | 'server_busy' | 'server_error' | 'generic';

export interface AppError {
    type: ErrorType;
    message: string;
    detail?: string;
    retryAt?: number; // Unix timestamp (ms) — countdown için
}

interface ErrorToastProps {
    error: AppError | null;
    onDismiss: () => void;
    onRetry?: () => void;
}

const ERROR_CONFIG: Record<
    ErrorType,
    { icon: React.ReactNode; title: string; color: string; bg: string; border: string }
> = {
    network: {
        icon: <Wifi className="w-5 h-5" />,
        title: 'Bağlantı Hatası',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
    },
    timeout: {
        icon: <Clock className="w-5 h-5" />,
        title: 'Zaman Aşımı',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    },
    rate_limit: {
        icon: <Clock className="w-5 h-5" />,
        title: 'Çok Fazla İstek',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
    },
    server_busy: {
        icon: <ServerCrash className="w-5 h-5" />,
        title: 'Sunucu Meşgul',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
    },
    server_error: {
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Sunucu Hatası',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
    },
    generic: {
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Bir Hata Oluştu',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
    },
};

/** Hata mesajını kullanıcıya güzel göster — toast stili */
export default function ErrorToast({ error, onDismiss, onRetry }: ErrorToastProps) {
    const [countdown, setCountdown] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);

    // Animate in
    useEffect(() => {
        if (error) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [error]);

    // Countdown timer for rate limit
    useEffect(() => {
        if (!error?.retryAt) {
            setCountdown(null);
            return;
        }
        const tick = () => {
            const remaining = Math.ceil((error.retryAt! - Date.now()) / 1000);
            if (remaining <= 0) {
                setCountdown(null);
            } else {
                setCountdown(remaining);
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [error?.retryAt]);

    if (!error) return null;

    const config = ERROR_CONFIG[error.type];

    return (
        <div
            role="alert"
            aria-live="assertive"
            className={`
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${config.bg} ${config.border} border rounded-2xl px-4 py-3 shadow-lg
      `}
        >
            {/* Header row */}
            <div className="flex items-start gap-3">
                <span className={config.color}>{config.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${config.color}`}>{config.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5 leading-snug">{error.message}</p>
                    {error.detail && (
                        <p className="text-xs text-gray-400 mt-1">{error.detail}</p>
                    )}
                </div>
                <button
                    onClick={onDismiss}
                    aria-label="Kapat"
                    className={`${config.color} opacity-60 hover:opacity-100 transition-opacity shrink-0`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Retry / countdown row */}
            {(onRetry || countdown !== null) && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-current/10">
                    {countdown !== null ? (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {countdown} saniye sonra tekrar deneyebilirsiniz
                        </p>
                    ) : (
                        onRetry && (
                            <button
                                onClick={onRetry}
                                className={`flex items-center gap-1.5 text-xs font-medium ${config.color} hover:underline`}
                            >
                                <RefreshCw className="w-3 h-3" />
                                Tekrar Dene
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Yardımcı: Axios/fetch hatasını AppError'a dönüştür ───────────────────────
export function classifyError(err: unknown): AppError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    const status: number | undefined = e?.response?.status;
    const serverMsg: string | undefined =
        e?.response?.data?.detail || e?.response?.data?.message;

    // Network (no response at all)
    if (!e?.response) {
        const isTimeout =
            e?.code === 'ECONNABORTED' || e?.message?.toLowerCase().includes('timeout');
        if (isTimeout) {
            return {
                type: 'timeout',
                message: 'Sunucu yanıt vermedi. Analiz çok büyük olabilir.',
                detail: 'Lütfen birkaç saniye bekleyip tekrar deneyin.',
            };
        }
        return {
            type: 'network',
            message: 'İnternet bağlantınız kesilmiş olabilir.',
            detail: 'Bağlantınızı kontrol edip tekrar deneyin.',
        };
    }

    // 429 Rate Limit
    if (status === 429) {
        const retryAfter = parseInt(e?.response?.headers?.['retry-after'] || '60', 10);
        return {
            type: 'rate_limit',
            message: 'Çok fazla istek gönderildi.',
            detail: 'AI servisi şu an yoğun, lütfen bekleyin.',
            retryAt: Date.now() + retryAfter * 1000,
        };
    }

    // 503 / 502 Server Busy
    if (status === 503 || status === 502) {
        return {
            type: 'server_busy',
            message: 'Sunucu şu an yoğun, lütfen biraz bekleyin.',
            detail: serverMsg || 'Sistem kapasitesi geçici olarak dolu.',
        };
    }

    // 5xx Server Error
    if (status && status >= 500) {
        return {
            type: 'server_error',
            message: 'Beklenmedik bir sunucu hatası oluştu.',
            detail: serverMsg || 'Ekibimiz bilgilendirildi. Lütfen daha sonra tekrar deneyin.',
        };
    }

    // 4xx — Use server message directly
    return {
        type: 'generic',
        message: serverMsg || 'Bir hata oluştu.',
    };
}
