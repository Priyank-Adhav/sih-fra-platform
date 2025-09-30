// DSS Components Export
export { default as DSSPanel } from './DSSPanel';
export { VillageSelector } from './VillageSelector';
export { RecommendationsList } from './RecommendationsList';
export { DSSStats } from './DSSStats';
export { QuickActions } from './QuickActions';

// Types
export interface Recommendation {
  scheme: string;
  reason: string;
  score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  estimated_cost: number;
  duration_months: number;
}

export interface DSSResponse {
  village_id: string;
  recommendations: Recommendation[];
  total_schemes: number;
  generated_at: string;
}

export interface StatsData {
  total: number;
  high: number;
  medium: number;
  low: number;
  avgScore: number;
}