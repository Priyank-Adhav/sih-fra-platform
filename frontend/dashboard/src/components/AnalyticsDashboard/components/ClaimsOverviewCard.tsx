import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, SnapshotSummary } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { CARD_COLORS } from '../utils/constants';

interface ClaimsOverviewCardProps {
  filters: AnalyticsFilters;
}

export const ClaimsOverviewCard: React.FC<ClaimsOverviewCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SnapshotSummary | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const snapshotDate = filters.snapshotDate || new Date().toISOString().split('T')[0];
      const summary = await analyticsService.getSnapshotSummary(snapshotDate);
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch claims data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.snapshotDate]);

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <AnalyticsCard
      title={t("claims_overview")}
      description={t("individual_vs_community_claims")}
      icon={icon}
      color={CARD_COLORS.claims}
      loading={loading}
      error={error}
      onRetry={fetchData}
    >
      {data && (
        <div className="flex flex-col h-full justify-between space-y-6">
          {/* Total Claims */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(data.total_claims_individual)}
              </div>
              <div className="text-sm text-blue-800 font-medium mt-1">{t("individual")}</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(data.total_claims_community)}
              </div>
              <div className="text-sm text-green-800 font-medium mt-1">{t("community")}</div>
            </div>
          </div>

          {/* Progress Metrics */}
          <div className="space-y-4 flex-grow">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">{t("disposal_rate")}</span>
                <span className="font-bold text-primary">
                  {data.avg_pct_disposed ? formatPercentage(data.avg_pct_disposed) : 'N/A'}
                </span>
              </div>
              <progress 
                className="progress progress-primary w-full h-3" 
                value={data.avg_pct_disposed || 0} 
                max="100"
              ></progress>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium text-sm">{t("claims_rejected")}</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(data.total_claims_rejected)}
                  </div>
                  <div className="text-xs text-gray-500">rejected claims</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary - Now at bottom with mt-auto */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4  border-primary mt-auto">
            <div className="text-sm text-gray-700 font-medium text-center">
              {t("total_claims_across")} <span className="text-primary font-bold">{data.total_states}</span> {t("states")}
            </div>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
};