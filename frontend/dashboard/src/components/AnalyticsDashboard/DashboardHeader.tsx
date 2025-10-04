import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsFilters } from './types/analytics';
import { METRIC_OPTIONS, TARGET_STATES } from './utils/constants';

interface DashboardHeaderProps {
  filters: AnalyticsFilters;
  onFiltersChange: (updates: Partial<AnalyticsFilters>) => void;
  onClearFilters: () => void;
  lastUpdated: Date | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  lastUpdated
}) => {
  const { t } = useTranslation();

  // Available snapshot dates from your data
  const snapshotDates = [
    { value: '2025-06-30', label: '30/06/2025' },
    { value: '2025-07-31', label: '31/07/2025' }
  ];

  // Set default to 31/07/2025 if no snapshot date is selected
  React.useEffect(() => {
    if (!filters.snapshotDate) {
      onFiltersChange({ snapshotDate: '2025-07-31' });
    }
  }, [filters.snapshotDate, onFiltersChange]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t("filter_by_state")}</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filters.state[0] || ''}
              onChange={(e) => onFiltersChange({ state: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">{t("all_states")}</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Tripura">Tripura</option>
              <option value="Odisha">Odisha</option>
              <option value="Telangana">Telangana</option>
              <option value="All Target States">All Target States</option>
            </select>
          </div>

          {/* Snapshot Date Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t("snapshot_date")}</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filters.snapshotDate || '2025-07-31'}
              onChange={(e) => onFiltersChange({ snapshotDate: e.target.value })}
            >
              {snapshotDates.map(date => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t("primary_metric")}</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filters.metric}
              onChange={(e) => onFiltersChange({ metric: e.target.value })}
            >
              {METRIC_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="form-control justify-end">
            <label className="label">
              <span className="label-text font-medium invisible">Actions</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={onClearFilters}
                className="btn btn-outline btn-sm"
              >
                {t("buttons.clear")}
              </button>
              <button
                onClick={() => onFiltersChange({ state: TARGET_STATES })}
                className="btn btn-primary btn-sm"
              >
                {t("show_target_states")}
              </button>
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="text-sm text-gray-500 lg:text-right">
            {t("last_updated")}: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};