"use client";

import React from 'react';
import Link from 'next/link';
import { canAccessFeature, getUpgradeMessage, type FeatureName, type User } from '@/lib/proMemberCheck';

interface ProGateProps {
    feature: FeatureName;
    user: User | null;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgradePrompt?: boolean;
}

export const ProGate: React.FC<ProGateProps> = ({
    feature,
    user,
    children,
    fallback,
    showUpgradePrompt = true
}) => {
    const hasAccess = canAccessFeature(user, feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (showUpgradePrompt) {
        return <UpgradePrompt feature={feature} />;
    }

    return null;
};

interface UpgradePromptProps {
    feature: FeatureName;
    size?: 'sm' | 'md' | 'lg';
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    feature,
    size = 'md'
}) => {
    const message = getUpgradeMessage(feature);

    const sizeClasses = {
        sm: 'p-4 text-sm',
        md: 'p-6 text-base',
        lg: 'p-8 text-lg'
    };

    return (
        <div className={`bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 rounded-xl border-2 border-pink-200 dark:border-pink-800 ${sizeClasses[size]}`}>
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Pro Özellik
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md">
                        {message}
                    </p>
                </div>

                <Link
                    href="/subscription"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                    </svg>
                    Pro'ya Yükselt
                </Link>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    7 gün ücretsiz deneme ile başlayın
                </p>
            </div>
        </div>
    );
};

interface ProBadgeProps {
    className?: string;
}

export const ProBadge: React.FC<ProBadgeProps> = ({ className = '' }) => {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white ${className}`}>
            <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            PRO
        </span>
    );
};

export default ProGate;
