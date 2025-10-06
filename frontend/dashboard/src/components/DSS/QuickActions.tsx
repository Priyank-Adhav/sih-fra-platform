import { useState } from 'react';
import { useTranslation } from "react-i18next";

interface QuickActionsProps {
  onRefresh: () => void;
  hasData: boolean;
  selectedVillage: string;
  loading: boolean;
}

export function QuickActions({ onRefresh, hasData, selectedVillage, loading }: QuickActionsProps) {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [showSchemes, setShowSchemes] = useState(false);

  const handleExportReport = () => {
    if (!hasData) {
      alert(t("quick_actions_panel.alerts.no_data_export"));
      return;
    }

    // Create a simple CSV export
    const csvContent = `Village ID,${selectedVillage}\nGenerated At,${new Date().toLocaleString()}\n\nThis would contain the recommendation data in a real implementation.`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dss-report-${selectedVillage}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleViewAllSchemes = async () => {
    if (showSchemes && schemes.length > 0) {
      setShowSchemes(!showSchemes);
      return;
    }

    try {
      setLoadingSchemes(true);
      const response = await fetch('http://localhost:8000/api/dss/schemes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch schemes');
      }
      
      const data = await response.json();
      setSchemes(data);
      setShowSchemes(true);
    } catch (error) {
      alert(t("quick_actions_panel.alerts.failed_fetch_schemes"));
    } finally {
      setLoadingSchemes(false);
    }
  };

  const handleGenerateAnalysis = () => {
    if (!hasData) {
      alert(t("quick_actions_panel.alerts.no_data_analysis"));
      return;
    }
    alert(t("quick_actions_panel.alerts.analysis_generation"));
  };

  const handleBatchProcess = () => {
    alert(t("quick_actions_panel.alerts.batch_processing"));
  };

  const handleHelp = () => {
    const helpText = `
${t("quick_actions_panel.help_text.title")}

${t("quick_actions_panel.help_text.select_village")}
${t("quick_actions_panel.help_text.view_recommendations")}
${t("quick_actions_panel.help_text.export_report")}
${t("quick_actions_panel.help_text.refresh")}

${t("quick_actions_panel.help_text.api_endpoints")}
${t("quick_actions_panel.help_text.get_recommendations")}
${t("quick_actions_panel.help_text.get_villages")}
${t("quick_actions_panel.help_text.get_schemes")}

${t("quick_actions_panel.help_text.support_contact")}
    `;
    alert(helpText);
  };

  return (
    <div className="space-y-6">
      {/* Main Actions Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t("quick_actions_panel.title")}</h2>
            <p className="text-gray-600">{t("quick_actions_panel.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRefresh}
            disabled={!selectedVillage || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            )}
            {loading ? t("quick_actions_panel.refreshing") : t("quick_actions_panel.refresh_recommendations")}
          </button>

          <button
            onClick={handleExportReport}
            disabled={!hasData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {t("quick_actions_panel.export_report")}
          </button>

          <button
            onClick={handleGenerateAnalysis}
            disabled={!hasData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            {t("quick_actions_panel.generate_analysis")}
          </button>

          <button
            onClick={handleBatchProcess}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {t("quick_actions_panel.batch_process")}
          </button>

          <button
            onClick={handleHelp}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {t("quick_actions_panel.help_support")}
          </button>
        </div>
      </div>

      {/* Available Schemes Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t("quick_actions_panel.available_schemes")}</h3>
              <p className="text-gray-600">{t("quick_actions_panel.subtitle")}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleViewAllSchemes}
          disabled={loadingSchemes}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loadingSchemes ? (
            <div className="animate-spin h-4 w-4">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {showSchemes ? t("quick_actions_panel.hide_schemes") : t("quick_actions_panel.view_all_schemes")}
        </button>

        {showSchemes && schemes.length > 0 && (
          <div className="mt-4 max-h-60 overflow-y-auto border rounded-lg">
            <div className="divide-y divide-gray-200">
              {schemes.map((scheme, index) => (
                <div key={index} className="p-3 hover:bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">{scheme.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {scheme.scheme_id} • Category: {scheme.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t("quick_actions_panel.api_status")}</h3>
            <p className="text-xs text-gray-600">{t("quick_actions_panel.connected_to_dss")}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {t("quick_actions_panel.base_url")}: http://localhost:8000
        </div>
      </div>
    </div>
  );
}