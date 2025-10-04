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
<div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-6 overflow-y-auto">
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
            
            {/* Enhanced API Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-300 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${
                  apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                  apiStatus === 'checking' ? 'bg-amber-500 animate-ping' :
                  'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {apiStatus === 'connected' ? t("api_connected") :
                   apiStatus === 'checking' ? t("connecting") :
                   t("api_disconnected")}
                </span>
                <button
                  onClick={checkApiHealth}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                  title={t("check_api_status")}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
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