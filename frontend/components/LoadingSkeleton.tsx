'use client';

import { Heart } from 'lucide-react';

// ============================================================================
// Loading Skeleton Component - Romantic Theme
// ============================================================================

/**
 * Props for LoadingSkeleton component
 */
interface LoadingSkeletonProps {
    /** Type of skeleton to display */
    type?: 'message' | 'chat-list' | 'assessment' | 'default';
    /** Number of items to show (for list types) */
    count?: number;
}

/**
 * LoadingSkeleton - Romantic themed loading states
 * 
 * Provides various loading skeleton animations with the romantic iOS theme.
 * Uses rose gold, blush pink, and coral colors for a cohesive experience.
 * 
 * @component
 * @param {LoadingSkeletonProps} props - Component props
 * @param {'message' | 'chat-list' | 'assessment' | 'default'} [props.type='default'] - Type of skeleton
 * @param {number} [props.count=1] - Number of items for list skeletons
 * 
 * @example
 * // Default loading state
 * <LoadingSkeleton />
 * 
 * @example
 * // Message loading with typing indicator
 * <LoadingSkeleton type="message" />
 * 
 * @example
 * // Chat list with 5 items
 * <LoadingSkeleton type="chat-list" count={5} />
 * 
 * @example
 * // Assessment question loading
 * <LoadingSkeleton type="assessment" />
 */
export function LoadingSkeleton({ type = 'default', count = 1 }: LoadingSkeletonProps) {
    const renderSkeleton = () => {
        switch (type) {
            case 'message':
                return <MessageSkeleton />;
            case 'chat-list':
                return <ChatListSkeleton count={count} />;
            case 'assessment':
                return <AssessmentSkeleton />;
            default:
                return <DefaultSkeleton />;
        }
    };

    return <div className="animate-fadeIn">{renderSkeleton()}</div>;
}

// ============================================================================
// Message Loading Skeleton
// ============================================================================

function MessageSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {/* User message skeleton */}
            <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm p-4 bg-gradient-to-br from-[#B76E79]/20 to-[#FF7F7F]/20">
                    <div className="animate-shimmer h-4 w-48 rounded" />
                </div>
            </div>

            {/* AI message skeleton */}
            <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm p-4 bg-white border border-[#FFB6C1]/20">
                    <div className="space-y-2">
                        <div className="animate-shimmer h-4 w-64 rounded" />
                        <div className="animate-shimmer h-4 w-56 rounded" />
                        <div className="animate-shimmer h-4 w-48 rounded" />
                    </div>
                </div>
            </div>

            {/* Typing indicator */}
            <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-bl-sm flex items-center space-x-2 border border-[#FFB6C1]/20">
                    <div className="w-2 h-2 bg-[#B76E79] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#FFB6C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#FF7F7F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Chat List Skeleton
// ============================================================================

function ChatListSkeleton({ count }: { count: number }) {
    return (
        <div className="space-y-2 p-2">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="w-full p-3 rounded-xl bg-white/50 border border-[#FFB6C1]/20"
                >
                    <div className="animate-shimmer h-4 w-32 rounded mb-2" />
                    <div className="animate-shimmer h-3 w-24 rounded" />
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// Assessment Loading Skeleton
// ============================================================================

function AssessmentSkeleton() {
    return (
        <div className="ios-card-elevated p-6 max-w-2xl mx-auto animate-fadeIn">
            {/* Header skeleton */}
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-[#FFF0F5] rounded-xl mr-3" />
                <div className="flex-1">
                    <div className="animate-shimmer h-5 w-48 rounded mb-2" />
                    <div className="animate-shimmer h-3 w-24 rounded" />
                </div>
            </div>

            {/* Progress bar skeleton */}
            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <div className="animate-shimmer h-3 w-20 rounded" />
                    <div className="animate-shimmer h-3 w-12 rounded" />
                </div>
                <div className="w-full bg-[#FFF0F5] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#B76E79] to-[#FFB6C1] h-2 rounded-full w-1/3 animate-pulse" />
                </div>
            </div>

            {/* Question skeleton */}
            <div className="mb-6">
                <div className="animate-shimmer h-6 w-full rounded mb-4" />
                <div className="animate-shimmer h-6 w-3/4 rounded mx-auto" />
            </div>

            {/* Options skeleton */}
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="w-full p-4 rounded-xl border-2 border-[#FFB6C1]/30 bg-white"
                    >
                        <div className="animate-shimmer h-5 w-40 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// Default Loading Skeleton
// ============================================================================

function DefaultSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
                {/* Romantic loading animation */}
                <div className="relative mb-4 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-2xl opacity-20 animate-heartbeat" />
                    <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Heart className="w-8 h-8 text-[#B76E79] fill-[#FFB6C1] animate-pulse" />
                    </div>
                </div>

                {/* Loading text */}
                <p className="text-[#6B3F3F] font-medium mb-2">Yükleniyor...</p>

                {/* Animated dots */}
                <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-[#B76E79] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#FFB6C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#FF7F7F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Specialized Loading Components
// ============================================================================

/**
 * ChatLoadingIndicator - Typing indicator for chat messages
 * 
 * Shows animated dots in romantic theme colors to indicate AI is typing.
 * Used in chat interfaces for better UX.
 * 
 * @component
 * @example
 * <ChatLoadingIndicator />
 */
export function ChatLoadingIndicator() {
    return (
        <div className="flex justify-start animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl rounded-bl-sm flex items-center space-x-2 border border-[#FFB6C1]/20 shadow-sm">
                <div className="w-2 h-2 bg-[#B76E79] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#FFB6C1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#FF7F7F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}

/**
 * PageLoadingSpinner - Full page loading state
 * 
 * Displays a centered loading animation with AMOR AI branding.
 * Uses romantic theme with heart icon and gradient effects.
 * 
 * @component
 * @example
 * <PageLoadingSpinner />
 */
export function PageLoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-romantic-gradient-soft">
            <div className="text-center animate-fadeIn">
                <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6C1] to-[#FF7F7F] rounded-full blur-3xl opacity-30 animate-heartbeat" />
                    <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Heart className="w-12 h-12 text-[#B76E79] fill-[#FFB6C1] animate-pulse" />
                    </div>
                </div>
                <h2 className="amor-logo text-2xl mb-2">AMOR AI</h2>
                <p className="text-[#6B3F3F] text-sm">Hazırlanıyor...</p>
            </div>
        </div>
    );
}

export default LoadingSkeleton;
