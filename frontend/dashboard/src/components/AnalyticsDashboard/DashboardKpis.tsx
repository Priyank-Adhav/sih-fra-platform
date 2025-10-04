import React from 'react';
import { useTranslation } from 'react-i18next';
import type { KpiData } from './types/analytics';
import { formatNumber, formatArea, getChangeColor, getChangeIcon } from './utils/formatters';

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
      color: 'blue'
    },
    {
      title: t("kpi.titles_distributed"),
      value: formatNumber(data.totalTitles),
      change: data.titlesChange,
      icon: '🏆',
      color: 'green'
    },
    {
      title: t("kpi.forest_land"),
      value: formatArea(data.totalForestLand),
      change: data.forestLandChange,
      icon: '🌳',
      color: 'emerald'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(kpi.change)}`}>
                <span>{getChangeIcon(kpi.change)}</span>
                <span>{kpi.change > 0 ? '+' : ''}{kpi.change}%</span>
                <span className="text-gray-500 ml-1">{t("kpi.vs_previous")}</span>
              </div>
            </div>
            <div className={`text-3xl bg-${kpi.color}-100 p-3 rounded-lg`}>
              {kpi.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};