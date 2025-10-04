import type { 
    SnapshotSummary, 
    StateComparison, 
    TopState, 
    StateTrend, 
    ClaimsTitlesDistribution,
    RejectionAnalysis,
    ForestLandSummary,
    OverallStats
  } from '../components/AnalyticsDashboard/types/analytics';
  
  const API_BASE = 'http://localhost:8002';
  
  class AnalyticsService {
    private async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });
  
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    }
  
    // Health check
    async checkHealth() {
      return this.fetchWithErrorHandling(`${API_BASE}/health`);
    }
  
    // Overall statistics
    async getOverallStats(): Promise<OverallStats> {
      return this.fetchWithErrorHandling(`${API_BASE}/analytics/overall-stats`);
    }
  
    // Snapshot summary
    async getSnapshotSummary(snapshotDate: string): Promise<SnapshotSummary> {
      return this.fetchWithErrorHandling(`${API_BASE}/analytics/snapshot-summary/${snapshotDate}`);
    }
  
    // State comparison
    async compareSnapshots(date1: string, date2: string): Promise<StateComparison[]> {
      return this.fetchWithErrorHandling(
        `${API_BASE}/analytics/compare?date1=${date1}&date2=${date2}`
      );
    }
  
    // Top states
    async getTopStates(metric: string, top: number = 5, snapshotDate?: string): Promise<TopState[]> {
      let url = `${API_BASE}/analytics/top-states?metric=${metric}&top=${top}`;
      if (snapshotDate) {
        url += `&snapshot_date=${snapshotDate}`;
      }
      return this.fetchWithErrorHandling(url);
    }
  
    // State trends
    async getStateTrends(state: string, metric: string): Promise<StateTrend> {
      return this.fetchWithErrorHandling(
        `${API_BASE}/analytics/state-trends/${state}?metric=${metric}`
      );
    }
  
    // Claims vs Titles distribution
    async getClaimsTitlesDistribution(snapshotDate?: string): Promise<ClaimsTitlesDistribution[]> {
      let url = `${API_BASE}/analytics/claims-titles-distribution`;
      if (snapshotDate) {
        url += `?snapshot_date=${snapshotDate}`;
      }
      return this.fetchWithErrorHandling(url);
    }
  
    // Rejection analysis
    async getRejectionAnalysis(snapshotDate?: string, minRejectionRate: number = 0): Promise<RejectionAnalysis[]> {
      let url = `${API_BASE}/analytics/rejection-analysis?min_rejection_rate=${minRejectionRate}`;
      if (snapshotDate) {
        url += `&snapshot_date=${snapshotDate}`;
      }
      return this.fetchWithErrorHandling(url);
    }
  
    // Forest land summary
    async getForestLandSummary(snapshotDate?: string): Promise<ForestLandSummary[]> {
      let url = `${API_BASE}/analytics/forest-land-summary`;
      if (snapshotDate) {
        url += `?snapshot_date=${snapshotDate}`;
      }
      return this.fetchWithErrorHandling(url);
    }
  
    // Get all states
    async getStates(): Promise<{ state: string; observation_count: number; latest_snapshot_date: string }[]> {
      return this.fetchWithErrorHandling(`${API_BASE}/states`);
    }
  }
  
  export const analyticsService = new AnalyticsService();