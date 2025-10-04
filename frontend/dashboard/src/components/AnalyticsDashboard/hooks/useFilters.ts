import { useState, useEffect } from 'react';
import type { AnalyticsFilters } from '../types/analytics';

export function useFilters() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    state: [],
    startDate: null,
    endDate: null,
    snapshotDate: null,
    metric: 'claims_individual' // Changed from 'total_claims' to valid metric
  });

  // Set default snapshot date to latest available
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFilters(prev => ({
      ...prev,
      snapshotDate: '2025-07-31' // Use the latest snapshot date
    }));
  }, []);

  const updateFilters = (updates: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({
      state: [],
      startDate: null,
      endDate: null,
      snapshotDate: '2025-07-31',
      metric: 'claims_individual'
    });
  };

  return {
    filters,
    updateFilters,
    clearFilters
  };
}