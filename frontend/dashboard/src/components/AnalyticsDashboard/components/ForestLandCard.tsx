import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, ForestLandSummary } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatArea } from '../utils/formatters';
import { CARD_COLORS } from '../utils/constants';

interface ForestLandCardProps {
  filters: AnalyticsFilters;
}

export const ForestLandCard: React.FC<ForestLandCardProps> = ({ filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ForestLandSummary[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await analyticsService.getForestLandSummary(filters.snapshotDate || undefined);
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forest land data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.snapshotDate]);

  const totalIndividual = data.reduce((sum, item) => sum + item.individual_acres, 0);
  const totalCommunity = data.reduce((sum, item) => sum + item.community_acres, 0);
  const totalAcres = totalIndividual + totalCommunity;

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <AnalyticsCard
      title={t("forest_land")}
      description={t("land_distribution_acres")}
      icon={icon}
      color={CARD_COLORS.forest}
      loading={loading}
      error={error}
      onRetry={fetchData}
    >
      {data.length > 0 && (
        <div className="space-y-4">
          {/* Total Land */}
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {formatArea(totalAcres)}
            </div>
            <div className="text-sm text-emerald-800">{t("total_forest_land")}</div>
          </div>

          {/* Distribution */}
          <div className="space-y-3">
            <div className='h-15'>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t("individual_rights")}</span>
                <span className="font-medium text-blue-600">
                  {formatArea(totalIndividual)}
                </span>
              </div>
              <progress 
                className="progress progress-info w-full" 
                value={totalIndividual} 
                max={totalAcres}
              ></progress>
            </div>

            <div className='h-15'>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t("community_rights")}</span>
                <span className="font-medium text-green-600">
                  {formatArea(totalCommunity)}
                </span>
              </div>
              <progress 
                className="progress progress-success w-full" 
                value={totalCommunity} 
                max={totalAcres}
              ></progress>
            </div>
          </div>

          {/* Top States */}
          <div className="bg-gray-50 rounded-lg px-5 py-8">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t("top_states_by_land")}</h4>
            <div className="space-y-2">
              {data.slice(0, 3).map((state, index) => (
                <div key={state.state} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {index + 1}. {state.state}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatArea(state.total_acres)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
};