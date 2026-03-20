import { useState, useEffect } from 'react';

let cachedConfig = null;

export function usePaypalConfig() {
  const [config, setConfig] = useState(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedConfig) {
      setConfig(cachedConfig);
      setLoading(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL || '';

    fetch(`${baseUrl}/api/paypal-config`)
      .then(res => res.json())
      .then(data => {
        cachedConfig = data;
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load PayPal configuration.');
        setLoading(false);
      });
  }, []);

  return { config, loading, error };
}
