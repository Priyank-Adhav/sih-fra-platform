// DSSStats.tsx
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
    color = 'purple',
    loading: cardLoading = false 
  }: {
    title: string;
    value: string | number;
    description: string;
    color?: string;
    loading?: boolean;
  }) => {

    const bgColorClasses = {
      purple: 'bg-purple-50 border-purple-100',
      red: 'bg-red-50 border-red-100',
      amber: 'bg-amber-50 border-amber-100',
      emerald: 'bg-emerald-50 border-emerald-100',
      blue: 'bg-blue-50 border-blue-100',
    };

    return (
      <div className={`bg-white rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
        bgColorClasses[color as keyof typeof bgColorClasses] || bgColorClasses.purple
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
              </div>
            </div>
            <div className="mt-2">
              {cardLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-gray-200 rounded-xl w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                  <div className="text-sm text-gray-600 font-medium">{description}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <StatCard
        title={t("dss_stats.total_schemes")}
        value={stats.total}
        description={t("dss_stats.recommended_schemes")}
        loading={loading}
        color="purple"
      />

      <StatCard
        title={t("dss_stats.high_priority")}
        value={stats.high}
        description={t("dss_stats.urgent_recommendations")}
        loading={loading}
        color="red"
      />

      <StatCard
        title={t("dss_stats.medium_priority")}
        value={stats.medium}
        description={t("dss_stats.standard_recommendations")}
        loading={loading}
        color="amber"
      />

      <StatCard
        title={t("dss_stats.low_priority")}
        value={stats.low}
        description={t("dss_stats.optional_schemes")}
        loading={loading}
        color="emerald"
      />

      <StatCard
        title={t("dss_stats.average_score")}
        value={loading ? "-" : `${Math.round(stats.avgScore * 100)}%`}
        description={t("dss_stats.match_confidence")}
        loading={loading}
        color="blue"
      />
    </div>
  );
}