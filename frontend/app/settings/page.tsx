'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, userApi } from '@/lib/api';
import { User } from '@/types';

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [goals, setGoals] = useState<string[]>([]);
    const [loveLanguage, setLoveLanguage] = useState('');
    const [conflictStyle, setConflictStyle] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const response = await authApi.getProfile();
            const userData = response.data;
            setUser(userData);
            setFullName(userData.full_name || '');
            setEmail(userData.email || '');
            setGoals(userData.goals || []);
            setLoveLanguage(userData.love_language || '');
            setConflictStyle(userData.conflict_resolution_style || '');
        } catch (error) {
            console.error('Error loading user data:', error);
            router.push('/auth');
        } finally {
            setLoading(false);
        }
    };

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
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Ayarlar kaydedilirken hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-purple-600 dark:text-purple-400 hover:underline mb-4 flex items-center gap-2"
                    >
                        ← Dashboard'a Dön
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Ayarlar
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Profil bilgilerinizi ve tercihlerinizi yönetin
                    </p>
                </div>

                {/* Settings Form */}
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Account Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Hesap Bilgileri
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">E-posta değiştirilemez</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    placeholder="Adınız ve soyadınız"
                                />
                            </div>

                            {user?.is_pro && (
                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                        ✨ Pro Üye
                                    </p>
                                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                        Sınırsız analiz ve tüm özelliklere erişim
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            Tercihler
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sevgi Dili
                                </label>
                                <select
                                    value={loveLanguage}
                                    onChange={(e) => setLoveLanguage(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Çatışma Çözme Tarzı
                                </label>
                                <select
                                    value={conflictStyle}
                                    onChange={(e) => setConflictStyle(e.target.value)}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>

                {/* Danger Zone */}
                <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                    <h2 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">
                        Tehlikeli Bölge
                    </h2>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Bu işlemler geri alınamaz. Dikkatli olun.
                    </p>
                    <button
                        onClick={() => {
                            if (confirm('Tüm verileriniz silinecek. Emin misiniz?')) {
                                // TODO: Implement account deletion
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
