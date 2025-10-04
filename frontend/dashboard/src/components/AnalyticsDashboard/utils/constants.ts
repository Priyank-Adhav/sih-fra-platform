export const TARGET_STATES = ['Madhya Pradesh', 'Tripura', 'Odisha', 'Telangana'];

export const METRIC_OPTIONS = [
  { value: 'claims_individual', label: 'Individual Claims' },
  { value: 'claims_community', label: 'Community Claims' },
  { value: 'titles_individual', label: 'Individual Titles' },
  { value: 'titles_community', label: 'Community Titles' },
  { value: 'claims_rejected', label: 'Rejected Claims' },
  { value: 'pct_disposed', label: 'Disposal Rate %' },
  { value: 'pct_titles_distributed', label: 'Titles Distributed %' },
  { value: 'forest_land_individual_acres', label: 'Forest Land Individual (acres)' },
  { value: 'forest_land_community_acres', label: 'Forest Land Community (acres)' }
];

export const CARD_COLORS = {
  claims: 'blue',
  titles: 'green', 
  forest: 'emerald',
  comparison: 'purple',
  trends: 'orange',
  ranking: 'pink',
  rejection: 'red',
  target: 'cyan'
} as const;