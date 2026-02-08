/**
 * Lottie Animation Component
 *
 * Romantic heart animations for loading states and transitions
 */

"use client";

import React, { useEffect, useRef } from "react";

interface LottieAnimationProps {
  animationType: "heart-pulse" | "loading" | "success" | "analyzing";
  size?: number;
  loop?: boolean;
}

export default function LottieAnimation({
  animationType,
  size = 100,
  loop = true,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lottie will be loaded dynamically
    const loadLottie = async () => {
      try {
        const lottie = (await import("lottie-web")).default;

        if (!containerRef.current) return;

        // Clear previous animation
        containerRef.current.innerHTML = "";

        // Animation data URLs (can be replaced with actual Lottie JSON files)
        const animationPaths: Record<string, string> = {
          "heart-pulse": "/animations/heart-pulse.json",
          loading: "/animations/loading.json",
          success: "/animations/success.json",
          analyzing: "/animations/analyzing.json",
        };

        // For now, use CSS animation as fallback
        // In production, replace with actual Lottie files
        const fallbackAnimation = createFallbackAnimation(animationType);
        containerRef.current.appendChild(fallbackAnimation);
      } catch (error) {
        console.error("Failed to load Lottie:", error);
        // Fallback to CSS animation
        if (containerRef.current) {
          const fallback = createFallbackAnimation(animationType);
          containerRef.current.appendChild(fallback);
        }
      }
    };

    loadLottie();
  }, [animationType]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    />
  );
}

/**
 * Fallback CSS animations when Lottie is not available
 */
function createFallbackAnimation(type: string): HTMLElement {
  const div = document.createElement("div");
  div.className = "relative w-full h-full flex items-center justify-center";

  switch (type) {
    case "heart-pulse":
      div.innerHTML = `
        <div class="animate-pulse">
          <svg class="w-full h-full text-pink-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        </div>
      `;
      break;

    case "loading":
      div.innerHTML = `
        <div class="animate-spin rounded-full h-full w-full border-4 border-pink-200 border-t-pink-500"></div>
      `;
      break;

    case "success":
      div.innerHTML = `
        <div class="animate-bounce">
          <svg class="w-full h-full text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      `;
      break;

    case "analyzing":
      div.innerHTML = `
        <div class="relative">
          <div class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></div>
          <div class="relative inline-flex rounded-full h-full w-full bg-pink-500"></div>
        </div>
      `;
      break;
  }

  return div;
}

/**
 * Glassmorphism Card Component
 */
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className = "",
  blur = "md",
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  };

  return (
    <div
      className={`
        ${blurClasses[blur]}
        bg-white/10 dark:bg-gray-900/10
        border border-white/20 dark:border-gray-700/20
        rounded-2xl
        shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Romantic Gradient Background
 */
export function RomanticGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-pink-900/20"></div>
    </div>
  );
}
