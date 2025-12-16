import { AlertCircle, CheckCircle } from 'lucide-react';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  static email(value: string): ValidationResult {
    const rules: ValidationRule[] = [
      {
        test: (v) => v.length > 0,
        message: 'Email gereklidir'
      },
      {
        test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Geçerli bir email adresi giriniz'
      }
    ];

    return this.validate(value, rules);
  }

  static password(value: string): ValidationResult {
    const rules: ValidationRule[] = [
      {
        test: (v) => v.length >= 8,
        message: 'Şifre en az 8 karakter olmalıdır'
      },
      {
        test: (v) => /[A-Z]/.test(v),
        message: 'En az bir büyük harf içermelidir'
      },
      {
        test: (v) => /[a-z]/.test(v),
        message: 'En az bir küçük harf içermelidir'
      },
      {
        test: (v) => /[0-9]/.test(v),
        message: 'En az bir rakam içermelidir'
      }
    ];

    return this.validate(value, rules);
  }

  static messageLength(value: string, min: number = 10, max: number = 1000): ValidationResult {
    const rules: ValidationRule[] = [
      {
        test: (v) => v.trim().length >= min,
        message: `Mesaj en az ${min} karakter olmalıdır`
      },
      {
        test: (v) => v.length <= max,
        message: `Mesaj en fazla ${max} karakter olabilir`
      }
    ];

    return this.validate(value, rules);
  }

  static fileSize(size: number, maxSizeMB: number = 10): ValidationResult {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const rules: ValidationRule[] = [
      {
        test: () => size > 0,
        message: 'Dosya seçilmedi'
      },
      {
        test: () => size <= maxBytes,
        message: `Dosya boyutu en fazla ${maxSizeMB}MB olabilir`
      }
    ];

    return this.validate(size.toString(), rules);
  }

  static fileType(fileName: string, allowedTypes: string[]): ValidationResult {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const rules: ValidationRule[] = [
      {
        test: () => !!extension && allowedTypes.includes(extension),
        message: `İzin verilen dosya türleri: ${allowedTypes.join(', ')}`
      }
    ];

    return this.validate(fileName, rules);
  }

  private static validate(value: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Validation message component
interface ValidationMessageProps {
  validation: ValidationResult;
  showSuccess?: boolean;
}

export function ValidationMessage({ validation, showSuccess = false }: ValidationMessageProps) {
  if (validation.isValid && !showSuccess) {
    return null;
  }

  if (validation.isValid && showSuccess) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
        <CheckCircle className="w-4 h-4" />
        <span>Geçerli</span>
      </div>
    );
  }

  return (
    <div className="space-y-1 mt-2">
      {validation.errors.map((error, index) => (
        <div key={index} className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
}

// Input with validation
interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  validationType: 'email' | 'password' | 'message';
  placeholder?: string;
  label?: string;
  showValidation?: boolean;
  className?: string;
}

export function ValidatedInput({
  value,
  onChange,
  validationType,
  placeholder,
  label,
  showValidation = true,
  className = ''
}: ValidatedInputProps) {
  const getValidation = () => {
    switch (validationType) {
      case 'email':
        return Validator.email(value);
      case 'password':
        return Validator.password(value);
      case 'message':
        return Validator.messageLength(value);
      default:
        return { isValid: true, errors: [] };
    }
  };

  const validation = getValidation();
  const hasError = !validation.isValid && value.length > 0;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <input
        type={validationType === 'password' ? 'password' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${hasError 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
          }
          dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100
        `}
      />
      
      {showValidation && value.length > 0 && (
        <ValidationMessage validation={validation} showSuccess={validation.isValid} />
      )}
    </div>
  );
}

// Character counter with visual feedback
interface CharacterCounterProps {
  current: number;
  max: number;
  min?: number;
  className?: string;
}

export function CharacterCounter({ current, max, min, className = '' }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isOverLimit = current > max;
  const isUnderMin = min !== undefined && current < min;

  const getColor = () => {
    if (isOverLimit) return 'text-red-600';
    if (isUnderMin) return 'text-yellow-600';
    if (percentage > 80) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className={`text-sm ${getColor()} ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">
          {current} / {max}
        </span>
        {min !== undefined && current < min && (
          <span className="text-xs">
            (en az {min} karakter)
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isOverLimit 
              ? 'bg-red-500' 
              : isUnderMin 
                ? 'bg-yellow-500' 
                : percentage > 80 
                  ? 'bg-orange-500' 
                  : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
