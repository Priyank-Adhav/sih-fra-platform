import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters, StateTrend } from '../types/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { AnalyticsCard } from './AnalyticsCard';
import { formatExactNumber } from '../utils/formatters';
import { CARD_COLORS, METRIC_OPTIONS } from '../utils/constants';

interface TrendsCardProps {
  filters: AnalyticsFilters;
}

export const TrendsCard: React.FC<TrendsCardProps> = ({ filters: _filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StateTrend | null>(null);
  const [selectedState, setSelectedState] = useState('Odisha');
  const [selectedMetric, setSelectedMetric] = useState('claims_individual');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const trend = await analyticsService.getStateTrends(selectedState, selectedMetric);
      setData(trend);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trends data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedState) {
      fetchData();
    }
  }, [selectedState, selectedMetric]);

  const icon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  // Enhanced trend visualization with colorful bars
  const renderTrendChart = () => {
    if (!data || data.data_points.length === 0) return null;

    const values = data.data_points.map(dp => dp.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    // Gradient colors for bars
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-red-400 to-red-600',
      'from-orange-400 to-orange-600',
      'from-amber-400 to-amber-600',
      'from-yellow-400 to-yellow-600',
      'from-lime-400 to-lime-600',
      'from-green-400 to-green-600',
      'from-emerald-400 to-emerald-600',
      'from-teal-400 to-teal-600',
      'from-cyan-400 to-cyan-600',
    ];

    return (
      <div className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div key={percent} className="border-t border-gray-200 w-full" />
          ))}
        </div>
        
        {/* Chart */}
        <div className="h-40 flex items-end gap-2 relative z-10 px-2">
          {data.data_points.map((point, index) => {
            // Enhanced height calculation for better visibility with similar values
            let heightPercent;
            if (range > 0) {
              // If the range is very small relative to values (less than 5% variation), amplify the differences
              const variationPercent = (range / minValue) * 100;
              if (variationPercent < 5) {
                // Amplify small differences by using a larger base
                heightPercent = 50 + ((point.value - minValue) / range) * 50;
              } else {
                heightPercent = ((point.value - minValue) / range) * 100;
              }
            } else {
              heightPercent = 100;
            }
            
            const colorClass = colors[index % colors.length];
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1 h-full justify-end group"
              >
                {/* Tooltip on hover - showing exact value */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap absolute -translate-y-full pointer-events-none z-20">
                  {formatExactNumber(point.value)}
                </div>
                
                {/* Bar */}
                <div
                  className={`bg-gradient-to-t ${colorClass} rounded-t-lg w-full transition-all duration-300 min-h-[4px] shadow-lg hover:shadow-xl cursor-pointer relative overflow-hidden`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </div>
                
                {/* Date label */}
                <div className="text-[10px] text-gray-600 mt-2 font-medium">
                  {new Date(point.snapshot_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: '2-digit' 
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnalyticsCard
      title={t("trends_analysis")}
      description={t("performance_over_time")}
      icon={icon}
      color={CARD_COLORS.trends}
      loading={loading}
      error={error}
      onRetry={fetchData}
      actions={
        <div className="flex flex-col gap-2 w-full">
          <select 
            className="h-12 select select-bordered select-sm w-full"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Tripura">Tripura</option>
            <option value="Odisha">Odisha</option>
            <option value="Telangana">Telangana</option>
          </select>
          <select 
            className="h-12 select select-bordered select-sm w-full"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {METRIC_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {data && (
        <div className="space-y-6">
          {/* Current Value */}
          <div className="text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {formatExactNumber(data.data_points[data.data_points.length - 1]?.value || 0)}
            </div>
            <div className="text-sm text-gray-600 capitalize mt-1">
              {METRIC_OPTIONS.find(m => m.value === selectedMetric)?.label || selectedMetric.replace(/_/g, ' ')}
            </div>
            {data.data_points.length > 1 && (() => {
              const values = data.data_points.map(dp => dp.value);
              const min = Math.min(...values);
              const max = Math.max(...values);
              return (
                <div className="text-xs text-gray-500 mt-2">
                  Range: {formatExactNumber(min)} - {formatExactNumber(max)}
                </div>
              );
            })()}
          </div>

          {/* Trend Chart */}
          {renderTrendChart()}

          {/* Trend Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">{t("data_points")}</span>
              <span className="font-bold text-gray-800">{data.data_points.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">{t("time_period")}</span>
              <span className="font-bold text-gray-800">
                {data.data_points.length > 0 && (
                  <>
                    {new Date(data.data_points[0].snapshot_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })} - {' '}
                    {new Date(data.data_points[data.data_points.length - 1].snapshot_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </AnalyticsCard>
  );
};