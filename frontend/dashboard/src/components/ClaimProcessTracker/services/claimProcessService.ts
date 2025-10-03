import type { ClaimCase, StepInstance, WorkflowProgress, Document } from '../types/claimProcess';

const API_BASE = 'http://localhost:8001/api/claim-process';

export const claimProcessService = {
  // Get all claim cases
  getCases: async (): Promise<ClaimCase[]> => {
    const response = await fetch(`${API_BASE}/cases`);
    if (!response.ok) throw new Error('Failed to fetch cases');
    return response.json();
  },

  // Get specific case
  getCase: async (caseId: number): Promise<ClaimCase> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch case');
    return response.json();
  },

  // Create new case
  createCase: async (caseData: any): Promise<ClaimCase> => {
    const response = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });
    if (!response.ok) throw new Error('Failed to create case');
    return response.json();
  },

  // Update case
  updateCase: async (caseId: number, caseData: any): Promise<ClaimCase> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });
    if (!response.ok) throw new Error('Failed to update case');
    return response.json();
  },

  // Get workflow progress
  getProgress: async (caseId: number): Promise<WorkflowProgress> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/progress`);
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },

  // Get case steps
  getCaseSteps: async (caseId: number): Promise<StepInstance[]> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/steps`);
    if (!response.ok) throw new Error('Failed to fetch steps');
    return response.json();
  },

  // Get current step
  getCurrentStep: async (caseId: number): Promise<StepInstance> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/steps/current`);
    if (!response.ok) throw new Error('Failed to fetch current step');
    return response.json();
  },

  // Update step status
  updateStepStatus: async (stepId: number, status: string, notes?: string): Promise<StepInstance> => {
    const response = await fetch(`${API_BASE}/steps/${stepId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step_status: status, verification_notes: notes }),
    });
    if (!response.ok) throw new Error('Failed to update step');
    return response.json();
  },

  // Proceed to next step
  proceedToNextStep: async (caseId: number): Promise<StepInstance> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/next-step`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to proceed to next step');
    return response.json();
  },

  // Upload document
  uploadDocument: async (caseId: number, file: File, stepInstanceId?: number): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    if (stepInstanceId) {
      formData.append('step_instance_id', stepInstanceId.toString());
    }

    const response = await fetch(`${API_BASE}/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  // Get case documents
  getCaseDocuments: async (caseId: number): Promise<Document[]> => {
    const response = await fetch(`${API_BASE}/cases/${caseId}/documents`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  // Get step documents
  getStepDocuments: async (stepId: number): Promise<Document[]> => {
    const response = await fetch(`${API_BASE}/steps/${stepId}/documents`);
    if (!response.ok) throw new Error('Failed to fetch step documents');
    return response.json();
  },

  // Delete document
  deleteDocument: async (documentId: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/documents/${documentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },

  // Health check
  healthCheck: async (): Promise<any> => {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error('API health check failed');
    return response.json();
  }
};