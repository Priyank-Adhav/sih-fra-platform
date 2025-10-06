import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, SnapshotSummary, ClaimsTitlesDistribution } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { TARGET_STATES, CARD_COLORS } from '../utils/constants';

interface TargetStatesCardProps {
  filters: AnalyticsFilters;
}

export const TargetStatesCard: React.FC<TargetStatesCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetStatesData, setTargetStatesData] = useState<{[key: string]: any}>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data for each target state
      const snapshotDate = filters.snapshotDate || new Date().toISOString().split('T')[0];
      const promises = TARGET_STATES.map(async (state) => {
        try {
          const [summary, distribution] = await Promise.all([
            analyticsService.getSnapshotSummary(snapshotDate),
            analyticsService.getClaimsTitlesDistribution(snapshotDate)
          ]);
          
          const stateDistribution = distribution.find(d => d.state === state);
          return {
            state,
            summary,
            distribution: stateDistribution
          };
        } catch (err) {
          return { state, error: err instanceof Error ? err.message : 'Failed to fetch data' };
        }
      });
      
      const results = await Promise.all(promises);
      const dataMap: {[key: string]: any} = {};
      results.forEach(result => {
        dataMap[result.state] = result;
      });
      
      setTargetStatesData(dataMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch target states data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.snapshotDate]);

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const getPerformanceColor = (successRate: number) => {
    if (successRate >= 70) return 'text-green-600 bg-green-100';
    if (successRate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <AnalyticsCard
      title={t("target_states_focus")}
      description={t("mp_tripura_odisha_telangana")}
      icon={icon}
      color={CARD_COLORS.target}
      loading={loading}
      error={error}
      onRetry={fetchData}
    >
      <div className="space-y-4">
        {TARGET_STATES.map((state) => {
          const stateData = targetStatesData[state];
          const successRate = stateData?.distribution?.titles_issued_pct || 0;
          
          return (
            <div key={state} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{state}</span>
                <div className={`text-xs px-2 py-1 rounded-full ${getPerformanceColor(successRate)}`}>
                  {successRate ? formatPercentage(successRate) : 'N/A'} {t("success")}
                </div>
              </div>
              
              {stateData?.distribution && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-600">
                      {formatNumber(stateData.distribution.total_claims)}
                    </div>
                    <div className="text-blue-800">{t("claims")}</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium text-green-600">
                      {formatNumber(stateData.distribution.total_titles)}
                    </div>
                    <div className="text-green-800">{t("titles")}</div>
                  </div>
                </div>
              )}
              
              {stateData?.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {stateData.error}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Summary */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
          <div className="text-sm text-cyan-800">
            <strong>{t("priority_intervention")}:</strong> {t("focus_on_improving_success_rates")}
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
};