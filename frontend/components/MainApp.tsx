import { useState } from 'react';
import { DashboardScreen } from './DashboardScreen';
import { AnalysisTypeScreen } from './AnalysisTypeScreen';
import { MessageAnalysisScreen } from './MessageAnalysisScreen';
import { FileUploadScreen } from './FileUploadScreen';
import { RelationshipAssessmentScreen } from './RelationshipAssessmentScreen';
import { ProcessingScreen } from './ProcessingScreen';
import { InsightsScreen } from './InsightsScreen';
import { SubscriptionScreen } from './SubscriptionScreen';
import { analysisApi } from '@/lib/api';

export type ScreenType = 
  | 'dashboard' 
  | 'analysis-type' 
  | 'message-analysis' 
  | 'file-upload'
  | 'relationship-assessment'
  | 'processing' 
  | 'insights' 
  | 'subscription';

export type AnalysisType = 'message' | 'file' | 'relationship';

export interface InsightData {
  type: AnalysisType;
  score: number;
  metrics: {
    communication: number;
    emotional: number;
    compatibility: number;
    conflict: number;
  };
  findings: string[];
  recommendations: string[];
  riskAreas: string[];
  strengths: string[];
  timestamp: Date;
  messageCount?: number;
  timeRange?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [currentInsight, setCurrentInsight] = useState<InsightData | null>(null);
  const [isPro, setIsPro] = useState(false);

  const handleStartAnalysis = (type: AnalysisType) => {
    setAnalysisType(type);
    if (type === 'message') {
      setCurrentScreen('message-analysis');
    } else if (type === 'file') {
      setCurrentScreen('file-upload');
    } else {
      setCurrentScreen('relationship-assessment');
    }
  };

  const handleAnalysisSubmit = async (data?: string | File) => {
    setCurrentScreen('processing');
    
    try {
      let result;
      
      if (analysisType === 'message' && typeof data === 'string') {
        const response = await analysisApi.analyze({ text: data, privacy_mode: true });
        result = response.data;
      } else if (analysisType === 'file' && data instanceof File) {
        const response = await analysisApi.uploadAndAnalyze(data, true);
        result = response.data;
      } else if (analysisType === 'relationship') {
         // Mock for relationship assessment for now
         setTimeout(() => {
            const mockInsight: InsightData = {
                type: 'relationship',
                score: 78,
                metrics: { communication: 82, emotional: 71, compatibility: 80, conflict: 38 },
                findings: ['İlişkiniz güçlü temellere dayanıyor'],
                recommendations: ['Birlikte daha fazla vakit geçirin'],
                riskAreas: [],
                strengths: ['Güven', 'Saygı'],
                timestamp: new Date()
            };
            setCurrentInsight(mockInsight);
            setCurrentScreen('insights');
         }, 2000);
         return;
      }

      if (result) {
          const insight: InsightData = {
            type: analysisType!,
            score: result.overall_score,
            metrics: {
              communication: result.metrics.communication_balance?.score || 0,
              emotional: result.metrics.sentiment?.score || 0,
              compatibility: result.metrics.empathy?.score || 0,
              conflict: result.metrics.conflict?.score || 0
            },
            findings: result.insights ? result.insights.map((i: any) => i.description) : [],
            recommendations: result.recommendations ? result.recommendations.map((r: any) => r.description) : [],
            riskAreas: [], 
            strengths: [],
            timestamp: new Date(),
            messageCount: undefined,
            timeRange: undefined
          };
          setCurrentInsight(insight);
          setCurrentScreen('insights');
      }
    } catch (error) {
      console.error("Analysis failed", error);
      // Fallback to dashboard after a delay or show error
      setTimeout(() => setCurrentScreen('dashboard'), 2000);
    }
  };

  const handleBack = () => {
    if (currentScreen === 'insights') {
      setCurrentScreen('dashboard');
    } else if (currentScreen === 'subscription') {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('analysis-type');
    }
  };

  const handleUpgrade = () => {
    setCurrentScreen('subscription');
  };

  const handleProActivate = () => {
    setIsPro(true);
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentScreen === 'dashboard' && (
          <DashboardScreen 
            isPro={isPro}
            onStartAnalysis={() => setCurrentScreen('analysis-type')}
            onViewInsight={(insight) => {
              setCurrentInsight(insight);
              setCurrentScreen('insights');
            }}
            onUpgrade={handleUpgrade}
          />
        )}
        
        {currentScreen === 'analysis-type' && (
          <AnalysisTypeScreen 
            onSelectType={handleStartAnalysis}
            onBack={() => setCurrentScreen('dashboard')}
            isPro={isPro}
          />
        )}

        {currentScreen === 'message-analysis' && (
          <MessageAnalysisScreen 
            onSubmit={handleAnalysisSubmit}
            onBack={() => setCurrentScreen('analysis-type')}
          />
        )}

        {currentScreen === 'file-upload' && (
          <FileUploadScreen 
            onSubmit={handleAnalysisSubmit}
            onBack={() => setCurrentScreen('analysis-type')}
          />
        )}

        {currentScreen === 'relationship-assessment' && (
          <RelationshipAssessmentScreen 
            onSubmit={() => handleAnalysisSubmit()}
            onBack={() => setCurrentScreen('analysis-type')}
          />
        )}

        {currentScreen === 'processing' && (
          <ProcessingScreen analysisType={analysisType!} />
        )}

        {currentScreen === 'insights' && currentInsight && (
          <InsightsScreen 
            insight={currentInsight}
            isPro={isPro}
            onBack={handleBack}
            onUpgrade={handleUpgrade}
          />
        )}

        {currentScreen === 'subscription' && (
          <SubscriptionScreen 
            onBack={handleBack}
            onSubscribe={handleProActivate}
          />
        )}
      </div>
    </div>
  );
}
