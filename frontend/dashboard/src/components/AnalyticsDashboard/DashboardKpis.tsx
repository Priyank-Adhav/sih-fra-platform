import React from 'react';
import { useTranslation } from 'react-i18next';
import type { KpiData } from './types/analytics';
import { formatNumber, formatArea, getChangeIcon } from './utils/formatters';

interface DashboardKpisProps {
  data: KpiData;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ data }) => {
  const { t } = useTranslation();

  const kpis = [
    {
      title: t("kpi.total_claims"),
      value: formatNumber(data.totalClaims),
      change: data.claimsChange,
      icon: '📋',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      title: t("kpi.titles_distributed"),
      value: formatNumber(data.totalTitles),
      change: data.titlesChange,
      icon: '🏆',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      title: t("kpi.forest_land"),
      value: formatArea(data.totalForestLand),
      change: data.forestLandChange,
      icon: '🌳',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      iconBg: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{kpi.title}</p>
              <p className="text-3xl font-bold text-gray-900 mb-3">{kpi.value}</p>
              
              {/* Change Indicator */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  kpi.change >= 0 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <span className="text-xs">{getChangeIcon(kpi.change)}</span>
                  <span>{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                </div>
                <span className="text-xs text-gray-500">{t("kpi.vs_previous")}</span>
              </div>
            </div>
            
            {/* Icon Badge */}
            <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-2xl">{kpi.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};