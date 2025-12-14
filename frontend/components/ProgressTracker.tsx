interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  compact?: boolean;
}

export function ProgressTracker({ currentStep, totalSteps, steps, compact = false }: ProgressTrackerProps) {
  const progress = (currentStep / totalSteps) * 100;

  if (compact) {
    return (
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Adım {currentStep} / {totalSteps}
          </span>
          <span className="text-sm font-medium text-indigo-600">
            %{Math.round(progress)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            İlerleme
          </span>
          <span className="text-sm font-bold text-indigo-600">
            %{Math.round(progress)}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1"
            >
              {/* Circle Indicator */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600 scale-110' : ''}
                ${isCurrent ? 'bg-gradient-to-br from-indigo-500 to-purple-500 scale-125 shadow-lg' : ''}
                ${isPending ? 'bg-gray-300' : ''}
              `}>
                {isCompleted ? (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`
                    font-bold text-sm
                    ${isCurrent ? 'text-white' : 'text-gray-600'}
                  `}>
                    {stepNumber}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <span className={`
                text-xs text-center max-w-[80px] transition-colors duration-300
                ${isCompleted ? 'text-green-700 font-medium' : ''}
                ${isCurrent ? 'text-indigo-600 font-bold' : ''}
                ${isPending ? 'text-gray-500' : ''}
              `}>
                {step}
              </span>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 -translate-y-1/2 hidden sm:block">
                  <div className={`
                    h-full transition-colors duration-300
                    ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}
                  `} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mini circular progress for quick indicators
export function CircularProgress({ progress, size = 'md', label }: { progress: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-gray-700 ${textSizeClasses[size]}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-gray-600 text-center">{label}</span>
      )}
    </div>
  );
}
