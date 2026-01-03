'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User, Heart } from 'lucide-react';
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
            href: '/analysis/new',
            icon: FileText,
        },
        {
            label: 'Koç',
            href: '/chat',
            icon: Heart,
        },
        {
            label: 'Profil',
            href: '/profile',
            icon: User,
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#FFB6C1]/30 pb-safe-area-bottom md:hidden shadow-lg">
            <div className="flex items-center justify-around h-16">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95 ${isActive
                                    ? 'text-[#B76E79]'
                                    : 'text-[#6B3F3F]/60'
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 transition-all ${isActive ? 'fill-[#FFB6C1]' : ''
                                    }`}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
