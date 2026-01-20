"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Wind, Check, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ConflictResolutionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const reset = () => {
    setIsOpen(false);
    setStep(0);
  };

  const steps = [
    {
      title: "Derin Bir Nefes Al",
      content:
        "Önce biyolojini sakinleştir. 4 saniye nefes al, 4 saniye tut, 4 saniye ver.",
      icon: Wind,
      action: "Sakince Aldım",
    },
    {
      title: "Duygunu Tanımla",
      content:
        "Ona saldırmak yerine ne hissettiğine odaklan. Öfke mi? Hayal kırıklığı mı? Korku mu?",
      icon: ShieldAlert,
      action: "Tanımladım",
    },
    {
      title: "'Ben' Dili Kullan",
      content:
        "'Sen hep böylesin' yerine 'Ben şu an incinmiş hissediyorum çünkü...' diye başla.",
      icon: Check,
      action: "Mesajı Tasarladım",
    },
  ];

  if (!isOpen) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-200" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-200 text-sm">
                Çatışma Çözücü
              </h3>
              <p className="text-xs text-red-600 dark:text-red-300">
                Şu an gergin misiniz?
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Yardım Et
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-2 border-red-100 dark:border-red-900 shadow-xl overflow-hidden relative">
      <button
        onClick={reset}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-4"
          >
            {step < steps.length ? (
              <>
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const Icon = steps[step]?.icon;
                    return Icon ? (
                      <Icon className="w-8 h-8 text-red-500" />
                    ) : null;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {steps[step]?.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {steps[step]?.content}
                </p>
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  {steps[step]?.action}{" "}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="py-6">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Hazırsın!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Şimdi o konuşmayı sakince yapabilirsin.
                </p>
                <Button onClick={reset} variant="outline" className="w-full">
                  Tamamla
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < steps.length && (
          <div className="flex justify-center gap-1 mt-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-red-500" : "w-2 bg-gray-200 dark:bg-slate-700"}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
