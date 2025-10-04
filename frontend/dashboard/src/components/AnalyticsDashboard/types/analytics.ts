export interface AnalyticsFilters {
    state: string[];
    startDate: string | null;
    endDate: string | null;
    snapshotDate: string | null;
    metric: string;
  }
  
  export interface KpiData {
    totalClaims: number;
    totalTitles: number;
    totalForestLand: number;
    claimsChange: number;
    titlesChange: number;
    forestLandChange: number;
  }
  
  export interface SnapshotSummary {
    snapshot_date: string;
    total_states: number;
    total_claims_individual: number;
    total_claims_community: number;
    total_claims: number;
    total_titles_individual: number;
    total_titles_community: number;
    total_titles: number;
    total_claims_rejected: number;
    total_claims_disposed: number;
    avg_pct_disposed: number | null;
    avg_pct_titles_distributed: number | null;
    total_forest_land_individual_acres: number;
    total_forest_land_community_acres: number;
    total_forest_land_acres: number;
  }
  
  export interface StateComparison {
    state: string;
    date1: string;
    date2: string;
    claims_individual_diff: number | null;
    claims_community_diff: number | null;
    titles_individual_diff: number | null;
    titles_community_diff: number | null;
    claims_rejected_diff: number | null;
    forest_land_individual_diff: number | null;
    forest_land_community_diff: number | null;
    pct_disposed_diff: number | null;
    pct_titles_distributed_diff: number | null;
  }
  
  export interface TopState {
    rank: number;
    state: string;
    snapshot_date: string;
    metric_value: number | null;
    metric_name: string;
  }
  
  export interface TrendDataPoint {
    snapshot_date: string;
    value: number;
  }
  
  export interface StateTrend {
    state: string;
    metric_name: string;
    data_points: TrendDataPoint[];
  }
  
  export interface ClaimsTitlesDistribution {
    state: string;
    snapshot_date: string;
    total_claims: number;
    total_titles: number;
    titles_issued_pct: number | null;
    claims_pending: number;
  }
  
  export interface RejectionAnalysis {
    state: string;
    snapshot_date: string;
    total_claims: number;
    claims_rejected: number;
    rejection_rate: number | null;
  }
  
  export interface ForestLandSummary {
    state: string;
    snapshot_date: string;
    individual_acres: number;
    community_acres: number;
    total_acres: number;
  }
  
  export interface OverallStats {
    total_states: number;
    total_snapshots: number;
    earliest_date: string;
    latest_date: string;
    total_claims: number;
    total_titles: number;
    total_rejected: number;
    total_forest_land_acres: number;
  }