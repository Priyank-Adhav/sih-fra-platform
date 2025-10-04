import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, ClaimsTitlesDistribution } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatNumber } from '../utils/formatters';
import { CARD_COLORS } from '../utils/constants';

interface TitlesOverviewCardProps {
  filters: AnalyticsFilters;
}

export const TitlesOverviewCard: React.FC<TitlesOverviewCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClaimsTitlesDistribution[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const distribution = await analyticsService.getClaimsTitlesDistribution(filters.snapshotDate || undefined);
      setData(distribution);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch titles data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.snapshotDate]);

  const totalClaims = data.reduce((sum, item) => sum + item.total_claims, 0);
  const totalTitles = data.reduce((sum, item) => sum + item.total_titles, 0);
  const successRate = totalClaims > 0 ? (totalTitles / totalClaims) * 100 : 0;

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );

  return (
    <AnalyticsCard
      title={t("titles_overview")}
      description={t("claims_to_titles_conversion")}
      icon={icon}
      color={CARD_COLORS.titles}
      loading={loading}
      error={error}
      onRetry={fetchData}
    >
      {data.length > 0 && (
        <div className="flex flex-col h-full justify-between space-y-6">
          {/* Conversion Rate */}
          <div className="text-center py-4">
            <div className="radial-progress text-green-600" 
              style={{ '--value': successRate, '--size': '9rem' } as React.CSSProperties}>
              <span className="text-2xl font-bold">{successRate.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-gray-600 font-medium mt-3">{t("success_rate")}</p>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(totalClaims)}
              </div>
              <div className="text-sm text-blue-800 font-medium mt-1">{t("total_claims")}</div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(totalTitles)}
              </div>
              <div className="text-sm text-green-800 font-medium mt-1">{t("titles_issued")}</div>
            </div>
          </div>

          {/* Pending Claims */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-primary mt-auto">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div className="text-center">
                <span className="text-lg font-bold text-yellow-800">
                  {formatNumber(totalClaims - totalTitles)}
                </span>
                <span className="text-sm font-medium text-yellow-700 ml-2">
                  {t("claims_pending")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
};