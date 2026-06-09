let apiBase = (import.meta as any).env.VITE_API_URL || '';

if (typeof window !== 'undefined') {
  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalHost && (apiBase.includes('localhost') || apiBase.includes('127.0.0.1'))) {
    console.log('💡 Decoupled local VITE_API_URL from non-local environment. Using relative paths.');
    apiBase = '';
  }
}

export const API_BASE_URL = apiBase;

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
