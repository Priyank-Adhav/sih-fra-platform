import { useState, useEffect } from 'react';
import type { StepInstance, WorkflowProgress } from '../types/claimProcess';
import { claimProcessService } from '../services/claimProcessService';

export const useWorkflowSteps = (caseId: number | null) => {
  const [steps, setSteps] = useState<StepInstance[]>([]);
  const [currentStep, setCurrentStep] = useState<StepInstance | null>(null);
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (caseId) {
      loadWorkflowData();
    }
  }, [caseId]);

  const loadWorkflowData = async () => {
    if (!caseId) return;
    
    try {
      setLoading(true);
      const [stepsData, progressData, currentStepData] = await Promise.all([
        claimProcessService.getCaseSteps(caseId),
        claimProcessService.getProgress(caseId),
        claimProcessService.getCurrentStep(caseId).catch(() => null) // Optional
      ]);

      setSteps(stepsData);
      setProgress(progressData);
      setCurrentStep(currentStepData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow data');
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (stepId: number, status: string, notes?: string) => {
    try {
      const updatedStep = await claimProcessService.updateStepStatus(stepId, status, notes);
      setSteps(prev => prev.map(s => s.id === stepId ? updatedStep : s));
      
      // Update current step if this is the current one
      if (currentStep && currentStep.id === stepId) {
        setCurrentStep(updatedStep);
      }
      
      // Reload progress
      if (caseId) {
        const progressData = await claimProcessService.getProgress(caseId);
        setProgress(progressData);
      }
      
      return updatedStep;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update step');
    }
  };

  const proceedToNext = async () => {
    if (!caseId) return;
    
    try {
      const nextStep = await claimProcessService.proceedToNextStep(caseId);
      await loadWorkflowData(); // Reload all data
      return nextStep;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to proceed to next step');
    }
  };

  return {
    steps,
    currentStep,
    progress,
    loading,
    error,
    updateStep,
    proceedToNext,
    refresh: loadWorkflowData
  };
};