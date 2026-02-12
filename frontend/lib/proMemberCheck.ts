/**
 * Pro Member Check Utilities (Stage 4)
 * Feature gating and subscription validation
 */

export interface User {
    id: number;
    email: string;
    is_pro: boolean;
    subscription_end_date?: string;
}

export interface FeatureLimits {
    free: {
        analysesPerMonth: number;
        chatMessagesPerDay: number;
        exportEnabled: boolean;
        advancedModules: boolean;
        historyDays: number;
    };
    pro: {
        analysesPerMonth: number;
        chatMessagesPerDay: number;
        exportEnabled: boolean;
        advancedModules: boolean;
        historyDays: number;
    };
}

export const FEATURE_LIMITS: FeatureLimits = {
    free: {
        analysesPerMonth: 3,
        chatMessagesPerDay: 10,
        exportEnabled: false,
        advancedModules: false,
        historyDays: 7
    },
    pro: {
        analysesPerMonth: -1, // Unlimited
        chatMessagesPerDay: -1, // Unlimited
        exportEnabled: true,
        advancedModules: true,
        historyDays: 365
    }
};

export const FEATURE_NAMES = {
    ANALYSIS: 'analysis',
    CHAT: 'chat',
    EXPORT: 'export',
    TONE_SHIFTER: 'tone_shifter',
    LOVE_LANGUAGE_TEST: 'love_language_test',
    CONFLICT_SOLVER: 'conflict_solver',
    HISTORY: 'history'
} as const;

export type FeatureName = typeof FEATURE_NAMES[keyof typeof FEATURE_NAMES];

/**
 * Check if user is Pro member
 */
export function isProMember(user: User | null): boolean {
    if (!user) return false;

    // Check if pro flag is set
    if (!user.is_pro) return false;

    // Check if subscription is still active
    if (user.subscription_end_date) {
        const endDate = new Date(user.subscription_end_date);
        const now = new Date();
        return endDate > now;
    }

    return user.is_pro;
}

/**
 * Check if user can access a feature
 */
export function canAccessFeature(user: User | null, feature: FeatureName): boolean {
    const isPro = isProMember(user);

    switch (feature) {
        case FEATURE_NAMES.ANALYSIS:
            return true; // Everyone can analyze (with limits)

        case FEATURE_NAMES.CHAT:
            return true; // Everyone can chat (with limits)

        case FEATURE_NAMES.EXPORT:
            return isPro;

        case FEATURE_NAMES.TONE_SHIFTER:
            return isPro;

        case FEATURE_NAMES.LOVE_LANGUAGE_TEST:
            return true; // Free users get 1 test

        case FEATURE_NAMES.CONFLICT_SOLVER:
            return isPro;

        case FEATURE_NAMES.HISTORY:
            return true; // Everyone has history (with limits)

        default:
            return false;
    }
}

/**
 * Get feature limit for user
 */
export function getFeatureLimit(user: User | null, feature: FeatureName): number {
    const isPro = isProMember(user);
    const limits = isPro ? FEATURE_LIMITS.pro : FEATURE_LIMITS.free;

    switch (feature) {
        case FEATURE_NAMES.ANALYSIS:
            return limits.analysesPerMonth;

        case FEATURE_NAMES.CHAT:
            return limits.chatMessagesPerDay;

        case FEATURE_NAMES.HISTORY:
            return limits.historyDays;

        default:
            return 0;
    }
}

/**
 * Get upgrade message for feature
 */
export function getUpgradeMessage(feature: FeatureName): string {
    const messages: Record<FeatureName, string> = {
        [FEATURE_NAMES.ANALYSIS]: 'Pro üyeliğe geçerek sınırsız analiz yapabilirsiniz',
        [FEATURE_NAMES.CHAT]: 'Pro üyeliğe geçerek sınırsız sohbet edebilirsiniz',
        [FEATURE_NAMES.EXPORT]: 'Analiz sonuçlarını dışa aktarmak için Pro üyelik gereklidir',
        [FEATURE_NAMES.TONE_SHIFTER]: 'Ton Değiştirici özelliği Pro üyelere özeldir',
        [FEATURE_NAMES.LOVE_LANGUAGE_TEST]: 'Birden fazla test için Pro üyelik gereklidir',
        [FEATURE_NAMES.CONFLICT_SOLVER]: 'Çatışma Çözücü özelliği Pro üyelere özeldir',
        [FEATURE_NAMES.HISTORY]: 'Daha uzun geçmiş için Pro üyelik gereklidir'
    };

    return messages[feature] || 'Bu özellik Pro üyelere özeldir';
}

/**
 * Check if user has reached usage limit
 */
export function hasReachedLimit(
    user: User | null,
    feature: FeatureName,
    currentUsage: number
): boolean {
    const limit = getFeatureLimit(user, feature);

    // -1 means unlimited
    if (limit === -1) return false;

    return currentUsage >= limit;
}

/**
 * Get remaining usage for feature
 */
export function getRemainingUsage(
    user: User | null,
    feature: FeatureName,
    currentUsage: number
): number {
    const limit = getFeatureLimit(user, feature);

    // -1 means unlimited
    if (limit === -1) return Infinity;

    return Math.max(0, limit - currentUsage);
}
