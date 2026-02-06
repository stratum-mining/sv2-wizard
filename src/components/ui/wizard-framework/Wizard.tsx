// Main Wizard component - orchestrates the wizard flow

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { Card, CardContent } from "../card";
import { Button } from "../button";
import { cn } from "../../../lib/utils";
import type { WizardConfig, StepId } from "./types";
import { WizardStepCard } from "./WizardStepCard";

interface WizardProps {
  config: WizardConfig;
  onComplete?: (finalStepId: string) => void;
  className?: string;
}

export function Wizard({ config, onComplete, className }: WizardProps) {
  const [currentStepId, setCurrentStepId] = useState<StepId>(config.initialStepId);
  const [history, setHistory] = useState<StepId[]>([]);
  const [data, setData] = useState<any>({});
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  const currentStep = config.steps[currentStepId];

  if (!currentStep) {
    return <div className="text-red-500">Error: Step '{currentStepId}' not found in configuration.</div>;
  }

  const handleOptionSelect = (nextStepId: StepId, value?: string) => {
    setHistory((prev) => [...prev, currentStepId]);
    // Save the selected value if it's a pool selection
    if (value && (currentStepId === 'select_pool_construct' || currentStepId === 'select_pool_construct_mainnet' || currentStepId === 'select_pool_construct_testnet4' || currentStepId === 'select_pool_all' || currentStepId === 'select_pool_all_mainnet' || currentStepId === 'select_pool_all_testnet4')) {
      updateData({ selectedPool: value });
    }
    // Save the selected network value for pool network selection
    if (value && currentStepId === 'pool_network_selection') {
      updateData({ selectedNetwork: value });
    }
    // Save the selected network value
    if (value && currentStepId === 'bitcoin_network_selection') {
      updateData({ selectedNetwork: value });
    }
    // Save the template construction choice
    if (value && currentStepId === 'client_template_decision') {
      updateData({ constructTemplates: value === 'yes' });
    }
    // Save the template construction choice for PoolConnectionWizard
    if (value && currentStepId === 'block_template_construction') {
      updateData({ constructTemplates: value === 'yes' });
    }
    setCurrentStepId(nextStepId);
  };

  const handleContinue = () => {
    if (currentStep.nextStepId) {
      setHistory((prev) => [...prev, currentStepId]);
      setCurrentStepId(currentStep.nextStepId);
    } else if (onComplete) {
      onComplete(currentStepId);
    }
  };

  const handleBack = () => {
    const newHistory = [...history];
    const prevStep = newHistory.pop();
    if (prevStep) {
      setHistory(newHistory);
      setCurrentStepId(prevStep);
    }
  };

  const handleReset = () => {
    setShowCompletionMessage(true);
    setTimeout(() => {
      setHistory([]);
      setData({});
      setCurrentStepId(config.initialStepId);
      setShowCompletionMessage(false);
    }, 2000);
  };

  const updateData = (newData: any) => {
      setData((prev: any) => ({...prev, ...newData}));
  }

  const progress = Math.min(history.length * 15, 100);

  return (
    <div className={cn("w-full max-w-3xl relative mx-auto pt-12", className)}>
      {/* Title */}
      {config.title && (
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">{config.title}</h1>
          {config.subtitle && (
            <p className="text-lg text-muted-foreground">{config.subtitle}</p>
          )}
        </div>
      )}

      <Card className="border-border min-h-[400px] flex flex-col relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-muted rounded-t-2xl overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="h-8 w-8 -ml-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs font-mono text-primary uppercase tracking-widest">
              Step {history.length + 1}
            </span>
          </div>
          
          {/* Breadcrumbs / Dots */}
          <div className="flex gap-1">
            {Array.from({ length: Math.max(history.length + 2, 3) }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                  history.length > i ? "bg-primary" : (history.length === i ? "bg-primary animate-pulse" : "bg-border")
                )} 
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <CardContent className="p-8 md:p-12 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <WizardStepCard 
                step={currentStep}
                onOptionSelect={handleOptionSelect}
                onContinue={handleContinue}
                data={data}
                updateData={updateData}
              />

              {/* Show Completed button on Result Steps */}
              {currentStep.type === 'result' && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleReset} 
                    className="border-primary/30 hover:bg-primary/10 text-primary"
                    disabled={showCompletionMessage}
                  >
                    Completed!
                  </Button>
                  <AnimatePresence>
                    {showCompletionMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-2xl border border-border bg-card px-6 py-3 text-sm text-foreground"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span>Deployment configuration completed successfully!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

