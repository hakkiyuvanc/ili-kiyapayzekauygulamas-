"use client";

import React from 'react';

interface CircularProgressProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    label?: string;
    color?: string;
    showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    value,
    size = 120,
    strokeWidth = 8,
    label = '',
    color = '#FF6B9D',
    showPercentage = true
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    // Color based on value
    const getColor = () => {
        if (color !== '#FF6B9D') return color; // Custom color
        if (value >= 70) return '#10B981'; // Green
        if (value >= 40) return '#F59E0B'; // Amber
        return '#EF4444'; // Red
    };

    const strokeColor = getColor();

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(255, 107, 157, 0.3))'
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(value)}%
                    </span>
                )}
                {label && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
};

interface MultiCircularProgressProps {
    metrics: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    size?: number;
}

export const MultiCircularProgress: React.FC<MultiCircularProgressProps> = ({
    metrics,
    size = 100
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                    <CircularProgress
                        value={metric.value}
                        size={size}
                        label={metric.label}
                        color={metric.color}
                    />
                </div>
            ))}
        </div>
    );
};

export default CircularProgress;
