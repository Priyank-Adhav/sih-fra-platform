import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpis } from './DashboardKpis';
import { ClaimsOverviewCard } from './components/ClaimsOverviewCard';
import { TitlesOverviewCard } from './components/TitlesOverviewCard';
import { ForestLandCard } from './components/ForestLandCard';
import { StateComparisonCard } from './components/StateComparisonCard';
import { TrendsCard } from './components/TrendsCard';
import { TopStatesCard } from './components/TopStatesCard';
import { RejectionAnalysisCard } from './components/RejectionAnalysisCard';
import { TargetStatesCard } from './components/TargetStatesCard';
import { useApiHealth } from './hooks/useApiHealth';
import { useFilters } from './hooks/useFilters';
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ApiStatusIndicator } from '../Common/ApiStatusIndicator';

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { apiStatus, checkApiHealth } = useApiHealth();
  const { filters, updateFilters, clearFilters } = useFilters();
  const { loading, error, kpiData, lastUpdated, refreshData } = useAnalyticsData(filters);

  if (loading && !kpiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
        <LoadingSpinner message={t("loading_analytics")} size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
        <div className="alert alert-error max-w-4xl mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t("error_loading_analytics")}: {error}</span>
          <button onClick={refreshData} className="btn btn-sm btn-outline">
            {t("buttons.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4 lg:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t("analytics_dashboard")}</h1>
                <p className="text-gray-600">{t("fra_implementation_insights")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ApiStatusIndicator status={apiStatus} onRetry={checkApiHealth} />
              
              <button
                onClick={refreshData}
                className="btn btn-primary btn-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {t("buttons.refresh")}
              </button>
            </div>
          </div>

          <DashboardHeader
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* KPI Cards */}
        {kpiData && <DashboardKpis data={kpiData} />}

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          <ClaimsOverviewCard filters={filters} />
          <TitlesOverviewCard filters={filters} />
          <ForestLandCard filters={filters} />
          <StateComparisonCard filters={filters} />
          <TrendsCard filters={filters} />
          <TopStatesCard filters={filters} />
          <RejectionAnalysisCard filters={filters} />
          <TargetStatesCard filters={filters} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-4">
          <p>{t("data_source")}: Ministry of Tribal Affairs FRA Implementation Data</p>
          {lastUpdated && (
            <p>{t("last_updated")}: {lastUpdated.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;