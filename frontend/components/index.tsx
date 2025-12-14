import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load heavy components
export const AnalysisResult = dynamic(() => import('./AnalysisResult'), {
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false
});

export const ResultScreen = dynamic(() => import('./ResultScreen').then(mod => ({ default: mod.ResultScreen })), {
  loading: () => (
    <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[600px] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false
});

export const QuestionScreen = dynamic(() => import('./QuestionScreen').then(mod => ({ default: mod.QuestionScreen })), {
  loading: () => (
    <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[600px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    </div>
  ),
  ssr: false
});

// Export other components normally
export { WelcomeScreen } from './WelcomeScreen';
export { AnalysisScreen } from './AnalysisScreen';
export { PrivacyConsent } from './PrivacyConsent';
