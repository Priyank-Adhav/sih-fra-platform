import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, TopState } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatNumber, formatPercentage, formatArea } from '../utils/formatters';
import { METRIC_OPTIONS, CARD_COLORS } from '../utils/constants';

interface TopStatesCardProps {
  filters: AnalyticsFilters;
}

export const TopStatesCard: React.FC<TopStatesCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TopState[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('claims_individual');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const topStates = await analyticsService.getTopStates(selectedMetric, 5, filters.snapshotDate || undefined);
      setData(topStates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top states data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMetric, filters.snapshotDate]);

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );

  const formatValue = (value: number | null, metric: string) => {
    if (value === null) return 'N/A';
    
    if (metric.includes('pct')) {
      return formatPercentage(value);
    } else if (metric.includes('acres')) {
      return formatArea(value);
    } else {
      return formatNumber(value);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <AnalyticsCard
      title={t("top_states")}
      description={t("leading_performers")}
      icon={icon}
      color={CARD_COLORS.ranking}
      loading={loading}
      error={error}
      onRetry={fetchData}
      actions={
        <select 
          className="h-15 select select-bordered select-xs"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {METRIC_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    >
      {data.length > 0 && (
        <div className="space-y-3">
          {data.map((state) => (
            <div key={state.state} className="h-20 flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankColor(state.rank)}`}>
                  {state.rank}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{state.state}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(state.snapshot_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatValue(state.metric_value, state.metric_name)}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {state.metric_name.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {data.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>{t("no_ranking_data")}</p>
        </div>
      )}
    </AnalyticsCard>
  );
};