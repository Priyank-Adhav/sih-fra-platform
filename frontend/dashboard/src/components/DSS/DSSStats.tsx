import React from 'react';
import { useTranslation } from "react-i18next";

interface StatsData {
  total: number;
  high: number;
  medium: number;
  low: number;
  avgScore: number;
}

interface DSSStatsProps {
  stats: StatsData;
  loading: boolean;
}

export function DSSStats({ stats, loading }: DSSStatsProps) {
  const { t } = useTranslation();

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon, 
    color = 'indigo',
    loading: cardLoading = false 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ReactNode;
    color?: string;
    loading?: boolean;
  }) => {
    const colorClasses = {
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      red: 'bg-red-50 text-red-600 border-red-100',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo}`}>
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              </div>
            </div>
            <div className="mt-3">
              {cardLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  <div className="text-sm text-gray-500">{description}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title={t("dss_stats.total_schemes")}
        value={stats.total}
        description={t("dss_stats.recommended_schemes")}
        loading={loading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        }
        color="indigo"
      />

      <StatCard
        title={t("dss_stats.high_priority")}
        value={stats.high}
        description={t("dss_stats.urgent_recommendations")}
        loading={loading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        }
        color="red"
      />

      <StatCard
        title={t("dss_stats.medium_priority")}
        value={stats.medium}
        description={t("dss_stats.standard_recommendations")}
        loading={loading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        }
        color="yellow"
      />

      <StatCard
        title={t("dss_stats.low_priority")}
        value={stats.low}
        description={t("dss_stats.optional_schemes")}
        loading={loading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        }
        color="green"
      />

      <StatCard
        title={t("dss_stats.average_score")}
        value={loading ? "-" : `${Math.round(stats.avgScore * 100)}%`}
        description={t("dss_stats.match_confidence")}
        loading={loading}
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        }
        color="blue"
      />
    </div>
  );
}