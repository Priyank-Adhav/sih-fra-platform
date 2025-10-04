import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, StateComparison } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { getChangeColor, getChangeIcon } from '../utils/formatters';
import { CARD_COLORS, METRIC_OPTIONS } from '../utils/constants';

interface StateComparisonCardProps {
  filters: AnalyticsFilters;
}

export const StateComparisonCard: React.FC<StateComparisonCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StateComparison[]>([]);
  const [comparisonMetric, setComparisonMetric] = useState('claims_individual');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use last two available dates for comparison
      const date2 = filters.snapshotDate || '2025-07-31';
      const date1 = '2025-06-30'; // The previous snapshot
      
      const comparison = await analyticsService.compareSnapshots(date1, date2);
      setData(comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.snapshotDate]);

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const getMetricDiff = (item: StateComparison, metric: string) => {
    switch (metric) {
      case 'claims_individual':
        return item.claims_individual_diff;
      case 'claims_community':
        return item.claims_community_diff;
      case 'titles_individual':
        return item.titles_individual_diff;
      case 'titles_community':
        return item.titles_community_diff;
      case 'forest_land_individual_acres':
        return item.forest_land_individual_diff;
      case 'forest_land_community_acres':
        return item.forest_land_community_diff;
      default:
        return item.claims_individual_diff;
    }
  };

  const filteredData = filters.state.length > 0 
    ? data.filter(item => filters.state.includes(item.state))
    : data.slice(0, 5); // Show top 5 by default

  return (
    <AnalyticsCard
      title={t("state_comparison")}
      description={t("month_over_month_changes")}
      icon={icon}
      color={CARD_COLORS.comparison}
      loading={loading}
      error={error}
      onRetry={fetchData}
      actions={
        <select 
          className="h-15 select select-bordered select-xs"
          value={comparisonMetric}
          onChange={(e) => setComparisonMetric(e.target.value)}
        >
          {METRIC_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    >
      {filteredData.length > 0 && (
        <div className="space-y-3">
          {filteredData.map((item) => {
            const diff = getMetricDiff(item, comparisonMetric);
            return (
              <div key={item.state} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{item.state}</span>
                  <div className={`flex items-center gap-1 text-sm ${getChangeColor(diff || 0)}`}>
                    <span>{getChangeIcon(diff || 0)}</span>
                    <span>{diff && diff > 0 ? '+' : ''}{diff}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  {METRIC_OPTIONS.find(m => m.value === comparisonMetric)?.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {filteredData.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t("no_comparison_data")}</p>
        </div>
      )}
    </AnalyticsCard>
  );
};