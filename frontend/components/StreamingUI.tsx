"use client";

import React, { useState, useEffect } from 'react';

interface StreamingTextProps {
    text: string;
    speed?: number; // Characters per interval
    interval?: number; // Milliseconds
    onComplete?: () => void;
    className?: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
    text,
    speed = 2,
    interval = 30,
    onComplete,
    className = ''
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex >= text.length) {
            onComplete?.();
            return;
        }

        const timer = setTimeout(() => {
            const nextIndex = Math.min(currentIndex + speed, text.length);
            setDisplayedText(text.slice(0, nextIndex));
            setCurrentIndex(nextIndex);
        }, interval);

        return () => clearTimeout(timer);
    }, [currentIndex, text, speed, interval, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {currentIndex < text.length && (
                <span className="inline-block w-1 h-4 ml-1 bg-pink-500 animate-pulse" />
            )}
        </span>
    );
};

interface StreamingInsightProps {
    insight: {
        category: string;
        title: string;
        description: string;
        icon?: string;
    };
    delay?: number;
    onComplete?: () => void;
}

export const StreamingInsight: React.FC<StreamingInsightProps> = ({
    insight,
    delay = 0,
    onComplete
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [stage, setStage] = useState<'title' | 'description'>('title');

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-pink-100 dark:border-pink-900/20 animate-fade-in">
            <div className="flex items-start space-x-4">
                {insight.icon && (
                    <span className="text-3xl flex-shrink-0">{insight.icon}</span>
                )}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                            {insight.category}
                        </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stage === 'title' ? (
                            <StreamingText
                                text={insight.title}
                                speed={3}
                                interval={20}
                                onComplete={() => setStage('description')}
                            />
                        ) : (
                            insight.title
                        )}
                    </h3>

                    {stage === 'description' && (
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            <StreamingText
                                text={insight.description}
                                speed={2}
                                interval={15}
                                onComplete={onComplete}
                            />
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface StreamingInsightsListProps {
    insights: Array<{
        category: string;
        title: string;
        description: string;
        icon?: string;
    }>;
    staggerDelay?: number;
}

export const StreamingInsightsList: React.FC<StreamingInsightsListProps> = ({
    insights,
    staggerDelay = 500
}) => {
    const [completedCount, setCompletedCount] = useState(0);

    return (
        <div className="space-y-4">
            {insights.map((insight, index) => (
                <StreamingInsight
                    key={index}
                    insight={insight}
                    delay={index * staggerDelay}
                    onComplete={() => setCompletedCount(prev => prev + 1)}
                />
            ))}

            {completedCount === insights.length && insights.length > 0 && (
                <div className="text-center py-4 animate-fade-in">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        ✨ Analiz tamamlandı
                    </span>
                </div>
            )}
        </div>
    );
};

export default StreamingText;
