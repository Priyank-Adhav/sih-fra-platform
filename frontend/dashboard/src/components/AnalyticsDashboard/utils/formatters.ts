export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// New function for displaying exact numbers with commas
export const formatExactNumber = (num: number): string => {
  return num.toLocaleString();
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatArea = (acres: number): string => {
  if (acres >= 1000000) {
    return (acres / 1000000).toFixed(1) + 'M acres';
  }
  if (acres >= 1000) {
    return (acres / 1000).toFixed(1) + 'K acres';
  }
  return `${acres.toFixed(0)} acres`;
};

export const getChangeColor = (change: number): string => {
  if (change > 0) return 'text-success';
  if (change < 0) return 'text-error';
  return 'text-gray-500';
};

export const getChangeIcon = (change: number): string => {
  if (change > 0) return '↗';
  if (change < 0) return '↘';
  return '→';
};