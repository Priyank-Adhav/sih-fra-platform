import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, RejectionAnalysis } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { CARD_COLORS } from '../utils/constants';

interface RejectionAnalysisCardProps {
  filters: AnalyticsFilters;
}

export const RejectionAnalysisCard: React.FC<RejectionAnalysisCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RejectionAnalysis[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rejectionData = await analyticsService.getRejectionAnalysis(
        filters.snapshotDate || undefined,
        0 // min rejection rate
      );
      setData(rejectionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rejection data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.snapshotDate]);

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const highRejectionStates = data.filter(state => 
    state.rejection_rate && state.rejection_rate > 20
  ).slice(0, 5);

  const totalRejected = data.reduce((sum, state) => sum + state.claims_rejected, 0);
  const totalClaims = data.reduce((sum, state) => sum + state.total_claims, 0);
  const overallRejectionRate = totalClaims > 0 ? (totalRejected / totalClaims) * 100 : 0;

  return (
    <AnalyticsCard
      title={t("rejection_analysis")}
      description={t("claim_rejection_rates")}
      icon={icon}
      color={CARD_COLORS.rejection}
      loading={loading}
      error={error}
      onRetry={fetchData}
    >
      {data.length > 0 && (
        <div className="flex flex-col h-full justify-between space-y-6">
          {/* Overall Rejection */}
          <div className="text-center p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-red-600">
              {formatPercentage(overallRejectionRate)}
            </div>
            <div className="text-sm text-red-800 font-medium mt-1">{t("overall_rejection_rate")}</div>
            <div className="text-xs text-red-600 mt-2">
              {formatNumber(totalRejected)} {t("of")} {formatNumber(totalClaims)} {t("claims_rejected")}
            </div>
          </div>

          {/* High Rejection States */}
          {highRejectionStates.length > 0 && (
            <div className="flex-grow">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t("states_with_high_rejection")}
              </h4>
              <div className="space-y-3">
                {highRejectionStates.map((state) => (
                  <div key={state.state} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{state.state}</span>
                      <span className="text-sm font-bold text-red-600">
                        {state.rejection_rate ? formatPercentage(state.rejection_rate) : 'N/A'}
                      </span>
                    </div>
                    <div 
                      className="w-full bg-red-100 rounded-full h-2.5"
                      title={`${state.claims_rejected} rejected of ${state.total_claims} total`}
                    >
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(state.rejection_rate || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </AnalyticsCard>
  );
};