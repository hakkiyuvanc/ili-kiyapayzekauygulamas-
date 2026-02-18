"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardScreen } from "@/components/DashboardScreen";
import { analysisApi, systemApi, authApi } from "@/lib/api";
import { useAuth, useToastContext } from "../providers";

import { InsightData, AnalysisType } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { info } = useToastContext();
  const [analysisHistory, setAnalysisHistory] = useState<InsightData[]>([]);
  const [aiAvailable, setAiAvailable] = useState(true);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const res = await systemApi.getStatus();
        setAiAvailable(res.data.ai_available);
      } catch (e) {
        console.error("System check failed", e);
      }
    };
    checkSystem();
  }, []);

  useEffect(() => {
    const loadAnalysisHistory = async () => {
      try {
        const response = await analysisApi.getHistory(0, 10);
        // API returns { total: 5, analyses: [...] }
        // So we need to map response.data.analyses
        const historyData = response.data.analyses || [];
        const history = historyData.map((item: any) => ({
          type: (item.format_type === "whatsapp"
            ? "file"
            : "message") as AnalysisType,
          score: item.overall_score,
          metrics: {
            communication: 70,
            emotional: 75,
            compatibility: 72,
            conflict: 40,
          }, // API might not return full metrics in list view
          findings: [],
          recommendations: [],
          riskAreas: [],
          strengths: [],
          timestamp: new Date(item.created_at),
          messageCount: item.message_count,
          analysisId: item.id,
        }));
        setAnalysisHistory(history);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    if (!authLoading && !user) {
      // Guest logic - don't load history
      console.log("[Dashboard] Guest user detected, skipping API calls");
      return;
    }

    if (user && user.email !== "guest@amor.ai") {
      // Only load history for authenticated users, not guest users
      loadAnalysisHistory();
    }
  }, [user, authLoading]);

  // Handle Subscription Success
  const searchParams = useSearchParams();
  const { updateUser, success: showSuccess } = useAuth() as any; // Temporaryany cast or update interface
  // Wait, useToastContext provides success toast.
  const { success } = useToastContext();

  useEffect(() => {
    const checkoutSuccess = searchParams.get("checkout_success");
    if (checkoutSuccess && user && !user.is_pro) {
      // Refresh profile to get updated is_pro status
      authApi
        .getProfile()
        .then((res) => {
          const updatedUser = { ...res.data, is_pro: true }; // Backend might take a second, optimistically set true
          updateUser(updatedUser);
          success("🎉 Tebrikler! Pro üyeliğiniz aktifleşti.");
          // Clear param
          router.replace("/dashboard");
        })
        .catch((err) => {
          console.error("Failed to refresh profile after checkout", err);
        });
    }
  }, [searchParams, user]);

  const handleStartAnalysis = () => {
    router.push("/analysis/new"); // New route for selecting analysis type
  };

  const handleViewInsight = (insight: InsightData) => {
    // Navigate to detailed view
    if (insight.analysisId) {
      router.push(`/analysis/result?id=${insight.analysisId}`);
    } else {
      // Handle guest insights or those without ID (mock)
      console.warn("No ID for insight, cannot navigate");
    }
  };

  const handleUpgrade = () => {
    router.push("/subscription");
  };

  const handleStartChat = () => {
    router.push("/chat");
  };

  const handleOpenAssistant = () => {
    router.push("/assistant");
  };

  const handleLogout = () => {
    logout();
    info("Çıkış yapıldı");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <DashboardScreen
          isPro={user?.is_pro || false}
          user={user}
          aiAvailable={aiAvailable}
          onStartAnalysis={handleStartAnalysis}
          onViewInsight={handleViewInsight}
          onUpgrade={handleUpgrade}
          onLogout={handleLogout}
          onStartChat={handleStartChat}
          onOpenAssistant={handleOpenAssistant}
          analysisHistory={analysisHistory}
        />
      </div>
    </div>
  );
}
