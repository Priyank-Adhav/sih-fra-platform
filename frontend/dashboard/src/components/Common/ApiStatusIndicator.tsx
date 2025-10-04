import React from 'react';
import { useTranslation } from 'react-i18next';

interface ApiStatusIndicatorProps {
  status: 'checking' | 'connected' | 'error';
  onRetry?: () => void;
}

export const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ 
  status, 
  onRetry 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${
        status === 'connected' ? 'bg-green-500 animate-pulse' :
        status === 'checking' ? 'bg-yellow-500 animate-ping' :
        'bg-red-500'
      }`} />
      <span className="text-sm text-gray-600">
        {status === 'connected' ? t("api_status.connected") :
         status === 'checking' ? t("api_status.connecting") :
         t("api_status.disconnected")}
      </span>
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 btn btn-xs btn-outline"
          title={t("api_status.retry")}
        >
          {t("buttons.retry")}
        </button>
      )}
    </div>
  );
};