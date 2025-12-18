'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/app/providers';

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Only show on mobile and if user is logged in
    // Don't show on login/register pages
    if (!user || pathname === '/auth') {
        return null;
    }

    const items = [
        {
            label: 'Ana Sayfa',
            href: '/dashboard',
            icon: Home,
        },
        {
            label: 'Yeni Analiz',
            href: '/analysis/new', // Assumes this route exists or we use dashboard? For now, point to dashboard/action
            icon: FileText,
        },
        {
            label: 'Koç',
            href: '/chat',
            icon: MessageCircle,
        },
        {
            label: 'Profil',
            href: '/profile',
            icon: User,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-safe-area-bottom md:hidden">
            <div className="flex items-center justify-around h-16">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
