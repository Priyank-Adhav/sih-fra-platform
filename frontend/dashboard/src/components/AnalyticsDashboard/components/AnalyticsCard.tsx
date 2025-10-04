import React from 'react';
import { LoadingSpinner } from '../../Common/LoadingSpinner';

interface AnalyticsCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'emerald' | 'purple' | 'orange' | 'pink' | 'red' | 'cyan';
  loading?: boolean;
  error?: string | null; // Allow null as well
  onRetry?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  description,
  icon,
  color,
  loading = false,
  error = null, // Default to null
  onRetry,
  children,
  actions
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
    red: 'bg-red-100 text-red-600',
    cyan: 'bg-cyan-100 text-cyan-600'
  };

  // Check if there's an actual error (not null or empty string)
  const hasError = error && error.trim() !== '';

  if (hasError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        </div>
        
        <div className="alert alert-error">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          {onRetry && (
            <button onClick={onRetry} className="btn btn-sm btn-outline">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div className="min-h-[200px]">
          {children}
        </div>
      )}
    </div>
  );
};