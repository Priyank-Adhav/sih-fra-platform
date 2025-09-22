import { useState } from 'react';
import { VillageSelector } from './VillageSelector';
import { RecommendationsList } from './RecommendationsList';
import { DSSStats } from './DSSStats';
import { QuickActions } from './QuickActions';

interface Recommendation {
  scheme: string;
  reason: string;
  score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  estimated_cost: number;
  duration_months: number;
}

interface DSSResponse {
  village_id: string;
  recommendations: Recommendation[];
  total_schemes: number;
  generated_at: string;
}

export default function DSSPanel() {
  const [selectedVillage, setSelectedVillage] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRecommendations = async (villageId: string) => {
    if (!villageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/dss/recommend?village_id=${villageId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DSSResponse = await response.json();
      setRecommendations(data.recommendations);
      setLastUpdated(new Date(data.generated_at).toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillage(villageId);
    if (villageId) {
      fetchRecommendations(villageId);
    } else {
      setRecommendations([]);
      setLastUpdated(null);
    }
  };

  const handleRefresh = () => {
    if (selectedVillage) {
      fetchRecommendations(selectedVillage);
    }
  };

  const getStatsData = () => {
    const highPriority = recommendations.filter(r => r.priority === 'HIGH').length;
    const mediumPriority = recommendations.filter(r => r.priority === 'MEDIUM').length;
    const lowPriority = recommendations.filter(r => r.priority === 'LOW').length;
    const avgScore = recommendations.length > 0 
      ? recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length 
      : 0;

    return {
      total: recommendations.length,
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority,
      avgScore: avgScore
    };
  };

  const stats = getStatsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Decision Support System</h1>
              <p className="text-gray-600">AI-powered scheme recommendations for villages</p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
              )}
            </div>
          </div>
        </div>

        {/* Village Selector */}
        <div className="mb-6">
          <VillageSelector
            selectedVillage={selectedVillage}
            onVillageChange={handleVillageChange}
            loading={loading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {selectedVillage && (
          <div className="mb-6">
            <DSSStats stats={stats} loading={loading} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommendations Panel */}
          <div className="lg:col-span-2">
            <RecommendationsList
              recommendations={recommendations}
              loading={loading}
              selectedVillage={selectedVillage}
            />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions
              onRefresh={handleRefresh}
              hasData={recommendations.length > 0}
              selectedVillage={selectedVillage}
              loading={loading}
            />
          </div>
        </div>

        {/* API Status Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Connected to DSS Engine API • Real-time recommendations</p>
        </div>
      </div>
    </div>
  );
}