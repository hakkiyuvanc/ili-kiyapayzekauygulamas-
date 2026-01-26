"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { InsightData } from "@/types";
import { coachingApi } from "@/lib/api";

interface CoachingWidgetProps {
  latestAnalysis: InsightData | null;
}

export function CoachingWidget({ latestAnalysis }: CoachingWidgetProps) {
  const [tasks, setTasks] = useState<
    { id: string; text: string; completed: boolean }[]
  >([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Don't show coaching widget for guest users
  const isGuest =
    typeof window !== "undefined" && localStorage.getItem("isGuest") === "true";
  if (isGuest) {
    return null;
  }

  // 1. Load persisted status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await coachingApi.getStatus();
        if (res.data) {
          setCompletedIds(res.data.completed_tasks || []);
        }
      } catch (err) {
        console.error("Failed to load coaching status", err);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, []);

  // 2. Generate tasks and merge with status
  useEffect(() => {
    // Default tasks
    let generatedTasks = [
      { id: "gen_1", text: 'Partnerinize "Günün nasıl geçti?" diye sorun.' },
      { id: "gen_2", text: "Birlikte 15 dakika telefonsuz zaman geçirin." },
      { id: "gen_3", text: "Ona sevdiğiniz bir özelliğini söyleyin." },
    ];

    if (latestAnalysis && latestAnalysis.metrics) {
      const metrics = latestAnalysis.metrics;
      // Mock logic: find lowest metric
      const metricEntries = Object.entries(metrics).map(([key, val]: any) => ({
        key,
        score: val.score,
      }));
      metricEntries.sort((a, b) => a.score - b.score);
      const lowest = metricEntries[0];

      if (lowest) {
        if (lowest.key === "empathy") {
          generatedTasks = [
            { id: "emp_1", text: "Partneriniz konuşurken sözünü kesmeyin." },
            { id: "emp_2", text: '"Seni anlıyorum" cümlesini kullanın.' },
            { id: "emp_3", text: "Duygularını sormak için zaman ayırın." },
          ];
        } else if (lowest.key === "conflict") {
          generatedTasks = [
            {
              id: "conf_1",
              text: 'Tartışmada "Sen" yerine "Ben" dili kullanın.',
            },
            { id: "conf_2", text: "Gergin anlarda 5 dakika mola verin." },
            { id: "conf_3", text: "Ortak noktalarınızı hatırlayın." },
          ];
        }
      }
    }

    // Merge with completedIds
    const merged = generatedTasks.map((t) => ({
      ...t,
      completed: completedIds.includes(t.id),
    }));
    setTasks(merged);
  }, [latestAnalysis, completedIds]); // Re-run if analysis or loaded IDs change

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    // Optimistic update
    const newCompleted = !currentCompleted;
    const newIds = newCompleted
      ? [...completedIds, id]
      : completedIds.filter((cid) => cid !== id);

    setCompletedIds(newIds);

    // API Call
    try {
      await coachingApi.updateStatus({ completed_tasks: newIds });
    } catch (err) {
      console.error("Failed to update task", err);
      // Revert? For now, risk drift for better UX.
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-900 dark:text-blue-100">
          <Target className="w-5 h-5 text-blue-600" />
          Haftalık Koçluk
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500">Yükleniyor...</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id, task.completed)}
                className="w-full flex items-start gap-3 p-2 hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors text-left group"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-blue-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-sm ${task.completed ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"}`}
                >
                  {task.text}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
