'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Heart } from 'lucide-react';

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
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 transition-colors">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <img
            src="/amor-logo.jpg"
            alt="AMOR Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-wide">AMOR</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-light">
          {mode === 'login' ? 'İlişkine değer ver' : 'Aşkın matematiğini keşfet'}
        </p>
      </div>

      {/* Error Display */}
      {displayError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{displayError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İsim
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Şifre
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            'Giriş Yap'
          ) : (
            'Kayıt Ol'
          )}
        </button>
      </form>

      {/* Toggle Mode */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {mode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setLocalError('');
            }}
            className="ml-2 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
        <span className="text-sm text-gray-500 dark:text-gray-400">veya</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
      </div>

      {/* Guest Mode */}
      <button
        onClick={onContinueAsGuest}
        className="w-full py-3 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        Misafir Olarak Devam Et
      </button>

      {/* Privacy Note */}
      <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
        Devam ederek{' '}
        <a href="/privacy-policy" className="text-purple-600 hover:underline">
          Gizlilik Politikası
        </a>
        'nı kabul etmiş olursunuz.
      </p>
    </div>
  );
}
