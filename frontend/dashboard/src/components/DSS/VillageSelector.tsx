import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";

interface Village {
  village_id: string;
  village_name: string;
  state: string;
  district: string;
}

interface VillageSelectorProps {
  selectedVillage: string;
  onVillageChange: (villageId: string) => void;
  loading: boolean;
}

export function VillageSelector({ selectedVillage, onVillageChange, loading }: VillageSelectorProps) {
  const { t } = useTranslation();
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingVillages, setLoadingVillages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      setLoadingVillages(true);
      const response = await fetch('http://localhost:8000/api/dss/villages/names');
      
      if (!response.ok) {
        throw new Error('Failed to fetch villages');
      }
      
      const data = await response.json();
      setVillages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load villages');
    } finally {
      setLoadingVillages(false);
    }
  };

  // Helper function to format village display name
  const formatVillageName = (village: Village) => {
    return `${village.village_name}, ${village.district}, ${village.state}`;
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 text-red-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{t("village_selector.error.loading", { error })}</span>
          <button
            onClick={fetchVillages}
            className="ml-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            {t("village_selector.error.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t("village_selector.title")}</h2>
          <p className="text-gray-600">{t("village_selector.subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div> 

          <div className="relative">
            <select
              id="village-select"
              value={selectedVillage}
              onChange={(e) => onVillageChange(e.target.value)}
              disabled={loadingVillages || loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white"
            >
              <option value="">
                {loadingVillages ? t("village_selector.loading_villages") : t("village_selector.select_village")}
              </option>
              {villages.map((village) => (
                <option key={village.village_id} value={village.village_id}>
                  {formatVillageName(village)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {(loadingVillages || loading) ? (
                <div className="animate-spin h-5 w-5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {villages.length > 0 && (
          <div className="text-sm text-gray-500">
            {t("village_selector.villages_available", { count: villages.length })}
          </div>
        )}
      </div>
    </div>
  );
}