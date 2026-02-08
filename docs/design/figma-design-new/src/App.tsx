import { useState } from "react";
import { DashboardScreen } from "./components/DashboardScreen";
import { AnalysisTypeScreen } from "./components/AnalysisTypeScreen";
import { MessageAnalysisScreen } from "./components/MessageAnalysisScreen";
import { FileUploadScreen } from "./components/FileUploadScreen";
import { RelationshipAssessmentScreen } from "./components/RelationshipAssessmentScreen";
import { ProcessingScreen } from "./components/ProcessingScreen";
import { InsightsScreen } from "./components/InsightsScreen";
import { SubscriptionScreen } from "./components/SubscriptionScreen";

export type ScreenType =
  | "dashboard"
  | "analysis-type"
  | "message-analysis"
  | "file-upload"
  | "relationship-assessment"
  | "processing"
  | "insights"
  | "subscription";

export type AnalysisType = "message" | "file" | "relationship";

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
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("dashboard");
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [currentInsight, setCurrentInsight] = useState<InsightData | null>(
    null,
  );
  const [isPro, setIsPro] = useState(false);

  const handleStartAnalysis = (type: AnalysisType) => {
    setAnalysisType(type);
    if (type === "message") {
      setCurrentScreen("message-analysis");
    } else if (type === "file") {
      setCurrentScreen("file-upload");
    } else {
      setCurrentScreen("relationship-assessment");
    }
  };

  const handleAnalysisSubmit = () => {
    setCurrentScreen("processing");

    setTimeout(() => {
      const mockInsight: InsightData = {
        type: analysisType!,
        score: 72,
        metrics: {
          communication: 68,
          emotional: 75,
          compatibility: 70,
          conflict: 45,
        },
        findings: [
          "İletişim kalıplarınızda tutarlılık gözlemleniyor",
          "Duygusal tepkiler genellikle dengeli",
          "Belirli konularda çatışma eğilimi var",
          "Karşılıklı anlayış orta-yüksek seviyede",
        ],
        recommendations: [
          "Çatışma anlarında 24 saat bekleme kuralı uygulayın",
          'Haftada en az bir kez "kalite zamanı" ayırın',
          "Duygusal ihtiyaçları açıkça ifade etme pratiği yapın",
          "Aktif dinleme tekniklerini geliştirin",
        ],
        riskAreas: [
          "Stres anlarında iletişim kopukluğu",
          "Beklentilerin net olmayışı",
          "Çatışma çözüm stratejilerinin yetersizliği",
        ],
        strengths: [
          "Güçlü duygusal bağ",
          "Karşılıklı saygı",
          "Ortak değerler ve hedefler",
          "Destekleyici tutum",
        ],
        timestamp: new Date(),
        messageCount: analysisType === "file" ? 1247 : undefined,
        timeRange: analysisType === "file" ? "3 ay" : undefined,
      };

      setCurrentInsight(mockInsight);
      setCurrentScreen("insights");
    }, 3500);
  };

  const handleBack = () => {
    if (currentScreen === "insights") {
      setCurrentScreen("dashboard");
    } else if (currentScreen === "subscription") {
      setCurrentScreen("dashboard");
    } else {
      setCurrentScreen("analysis-type");
    }
  };

  const handleUpgrade = () => {
    setCurrentScreen("subscription");
  };

  const handleProActivate = () => {
    setIsPro(true);
    setCurrentScreen("dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentScreen === "dashboard" && (
          <DashboardScreen
            isPro={isPro}
            onStartAnalysis={() => setCurrentScreen("analysis-type")}
            onViewInsight={(insight) => {
              setCurrentInsight(insight);
              setCurrentScreen("insights");
            }}
            onUpgrade={handleUpgrade}
          />
        )}

        {currentScreen === "analysis-type" && (
          <AnalysisTypeScreen
            onSelectType={handleStartAnalysis}
            onBack={() => setCurrentScreen("dashboard")}
            isPro={isPro}
          />
        )}

        {currentScreen === "message-analysis" && (
          <MessageAnalysisScreen
            onSubmit={handleAnalysisSubmit}
            onBack={() => setCurrentScreen("analysis-type")}
          />
        )}

        {currentScreen === "file-upload" && (
          <FileUploadScreen
            onSubmit={handleAnalysisSubmit}
            onBack={() => setCurrentScreen("analysis-type")}
          />
        )}

        {currentScreen === "relationship-assessment" && (
          <RelationshipAssessmentScreen
            onSubmit={handleAnalysisSubmit}
            onBack={() => setCurrentScreen("analysis-type")}
          />
        )}

        {currentScreen === "processing" && (
          <ProcessingScreen analysisType={analysisType!} />
        )}

        {currentScreen === "insights" && currentInsight && (
          <InsightsScreen
            insight={currentInsight}
            isPro={isPro}
            onBack={handleBack}
            onUpgrade={handleUpgrade}
          />
        )}

        {currentScreen === "subscription" && (
          <SubscriptionScreen
            onBack={handleBack}
            onSubscribe={handleProActivate}
          />
        )}
      </div>
    </div>
  );
}
