import { useState, useEffect } from 'react';
import { analyticsService } from '../../../services/analyticsService';

export function useApiHealth() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      setError(null);
      await analyticsService.checkHealth();
      setApiStatus('connected');
    } catch (err) {
      setApiStatus('error');
      setError(err instanceof Error ? err.message : 'API connection failed');
    }
  };

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { apiStatus, error, checkApiHealth };
}