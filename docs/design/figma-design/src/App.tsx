import { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { QuestionScreen } from "./components/QuestionScreen";
import { AnalysisScreen } from "./components/AnalysisScreen";
import { ResultScreen } from "./components/ResultScreen";

export type ScreenType = "welcome" | "questions" | "analysis" | "result";

export interface Answer {
  questionId: number;
  answer: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("welcome");
  const [answers, setAnswers] = useState<Answer[]>([]);

  const handleStart = () => {
    setCurrentScreen("questions");
  };

  const handleComplete = (userAnswers: Answer[]) => {
    setAnswers(userAnswers);
    setCurrentScreen("analysis");

    // Analiz ekranından sonra sonuç ekranına geç
    setTimeout(() => {
      setCurrentScreen("result");
    }, 3000);
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentScreen("welcome");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentScreen === "welcome" && <WelcomeScreen onStart={handleStart} />}
        {currentScreen === "questions" && (
          <QuestionScreen onComplete={handleComplete} />
        )}
        {currentScreen === "analysis" && <AnalysisScreen />}
        {currentScreen === "result" && (
          <ResultScreen answers={answers} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
