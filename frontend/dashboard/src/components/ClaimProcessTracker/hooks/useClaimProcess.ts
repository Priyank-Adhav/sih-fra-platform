import { useState, useEffect } from 'react';
import type { ClaimCase, StepInstance, Document } from '../types/claimProcess';
import { claimProcessService } from '../services/claimProcessService';

export const useClaimProcess = () => {
  const [cases, setCases] = useState<ClaimCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkApiHealth();
    loadCases();
  }, []);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      await claimProcessService.healthCheck();
      setApiStatus('connected');
      setError(null);
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
    }
  };

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await claimProcessService.getCases();
      setCases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (caseData: any): Promise<ClaimCase> => {
    try {
      const newCase = await claimProcessService.createCase(caseData);
      setCases(prev => [...prev, newCase]);
      return newCase;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create case');
    }
  };

  const updateStepStatus = async (stepId: number, status: string, notes?: string) => {
    try {
      const updatedStep = await claimProcessService.updateStepStatus(stepId, status, notes);
      // Update the case with the new step status
      setCases(prev => prev.map(c => ({
        ...c,
        steps: c.steps.map(s => s.id === stepId ? updatedStep : s)
      })));
      return updatedStep;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update step');
    }
  };

  const uploadDocument = async (caseId: number, file: File, stepInstanceId?: number) => {
    try {
      const document = await claimProcessService.uploadDocument(caseId, file, stepInstanceId);
      // Update the case with the new document
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, documents: [...c.documents, document] }
          : c
      ));
      return document;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload document');
    }
  };

  return {
    cases,
    loading,
    error,
    apiStatus,
    createCase,
    updateStepStatus,
    uploadDocument,
    refreshCases: loadCases,
    checkApiHealth
  };
};