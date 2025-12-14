import { ReactNode, useEffect, useState } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideInRight' | 'scaleIn' | 'bounce';
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedContainer({ 
  children, 
  animation = 'fadeIn', 
  delay = 0, 
  duration = 500,
  className = '' 
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animations = {
    fadeIn: 'animate-fadeIn',
    slideUp: 'animate-slideUp',
    slideInRight: 'animate-slideInRight',
    scaleIn: 'animate-scaleIn',
    bounce: 'animate-bounce'
  };

  return (
    <div 
      className={`
        transition-opacity
        ${isVisible ? 'opacity-100' : 'opacity-0'}
        ${isVisible ? animations[animation] : ''}
        ${className}
      `}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// Stagger children animations
interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideInRight';
  className?: string;
}

export function StaggeredList({ 
  children, 
  staggerDelay = 100, 
  animation = 'slideUp',
  className = '' 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
}

// Hover scale effect
interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.05, className = '' }: HoverScaleProps) {
  return (
    <div 
      className={`transition-transform duration-300 hover:scale-[var(--scale)] ${className}`}
      style={{ '--scale': scale } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Pulse effect for notifications
export function PulseNotification({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <span className="absolute top-0 right-0 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </div>
  );
}

// Shake animation for errors
interface ShakeProps {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}

export function Shake({ children, trigger, className = '' }: ShakeProps) {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div 
      className={`
        ${isShaking ? 'animate-shake' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Gradient text animation
export function GradientText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span 
      className={`
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
        bg-clip-text text-transparent 
        bg-[length:200%_auto] 
        animate-gradient
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Floating animation
export function FloatingElement({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-float ${className}`}>
      {children}
    </div>
  );
}
