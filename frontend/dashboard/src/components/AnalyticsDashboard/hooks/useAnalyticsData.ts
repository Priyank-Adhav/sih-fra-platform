import { useState, useEffect } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import type { AnalyticsFilters, KpiData, OverallStats } from '../types/analytics';

export function useAnalyticsData(filters: AnalyticsFilters) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall stats for KPIs
      const stats = await analyticsService.getOverallStats();
      setOverallStats(stats);

      // Calculate KPI data
      const kpis: KpiData = {
        totalClaims: stats.total_claims,
        totalTitles: stats.total_titles,
        totalForestLand: stats.total_forest_land_acres,
        claimsChange: 0, // Would need historical data for actual change
        titlesChange: 0,
        forestLandChange: 0
      };
      setKpiData(kpis);

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [filters]);

  return {
    loading,
    error,
    kpiData,
    overallStats,
    lastUpdated,
    refreshData
  };
}