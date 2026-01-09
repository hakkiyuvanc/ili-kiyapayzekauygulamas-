'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Heart } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, fullName: string) => Promise<void>;
  onContinueAsGuest: () => void;
  isLoading: boolean;
  error?: string;
}

export function AuthScreen({ onLogin, onRegister, onContinueAsGuest, isLoading, error }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email || !password) {
      setLocalError('Email ve şifre gereklidir');
      return;
    }

    if (mode === 'register' && !fullName) {
      setLocalError('İsim gereklidir');
      return;
    }

    if (password.length < 6) {
      setLocalError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, fullName);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Bir hata oluştu');
      }
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center safe-top safe-bottom px-6 bg-romantic-gradient-soft">
      {/* AMOR AI Logo */}
      <div className="mb-8 text-center animate-fadeIn">
        <div className="relative mb-4 inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-2xl opacity-30 animate-heartbeat"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl">
            <Heart className="w-16 h-16 text-[#B76E79] fill-[#FFB6C1]" />
          </div>
        </div>
        <h1 className="amor-logo text-4xl mb-1 tracking-tight">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm font-medium">
          {mode === 'login' ? 'İlişkine değer ver 💕' : 'Aşkın matematiğini keşfet 💗'}
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="ios-card-elevated max-w-md w-full p-8 animate-slideUp">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-[#FFF0F5] rounded-xl">
          <button
            onClick={() => { setMode('login'); setLocalError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${mode === 'login'
              ? 'bg-white text-[#B76E79] shadow-sm'
              : 'text-[#6B3F3F]/60'
              }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setMode('register'); setLocalError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${mode === 'register'
              ? 'bg-white text-[#B76E79] shadow-sm'
              : 'text-[#6B3F3F]/60'
              }`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Error Display */}
        {displayError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
            <p className="text-sm text-red-600">{displayError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label={mode === 'login' ? 'Giriş formu' : 'Kayıt formu'}>
          {mode === 'register' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-[#331A1A] mb-2">
                İsim Soyisim
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B76E79]/50" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="ios-input w-full pl-12 pr-4"
                  aria-label="İsim Soyisim"
                  aria-required="true"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#331A1A] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B76E79]/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="ios-input w-full pl-12 pr-4"
                aria-label="Email adresi"
                aria-required="true"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#331A1A] mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B76E79]/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="ios-input w-full pl-12 pr-12"
                aria-label="Şifre"
                aria-required="true"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 no-select"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-[#B76E79]/50" />
                ) : (
                  <Eye className="w-5 h-5 text-[#B76E79]/50" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="ios-button-primary w-full py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Yükleniyor...
              </span>
            ) : mode === 'login' ? (
              '💗 Giriş Yap'
            ) : (
              '💕 Hesap Oluştur'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#FFB6C1]/30" />
          <span className="text-sm text-[#6B3F3F]/60">veya</span>
          <div className="flex-1 h-px bg-[#FFB6C1]/30" />
        </div>

        {/* Guest Mode */}
        <button
          onClick={onContinueAsGuest}
          className="w-full py-3 border-2 border-[#FFB6C1]/30 text-[#6B3F3F] rounded-xl font-medium hover:bg-[#FFF0F5] transition-all active:scale-95"
        >
          Misafir Olarak Devam Et
        </button>

        {/* Privacy Note */}
        <p className="mt-6 text-xs text-center text-[#6B3F3F]/60">
          🔒 Devam ederek{' '}
          <a href="/privacy-policy" className="text-[#B76E79] hover:underline font-medium">
            Gizlilik Politikası
          </a>
          'nı kabul etmiş olursunuz.
        </p>
      </div>

      {/* Bottom Branding */}
      <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <p className="text-[#6B3F3F]/60 text-sm">
          Sevgi dolu ilişkiler için
        </p>
        <p className="amor-logo text-lg font-semibold mt-1">AMOR AI</p>
      </div>
    </div>
  );
}
