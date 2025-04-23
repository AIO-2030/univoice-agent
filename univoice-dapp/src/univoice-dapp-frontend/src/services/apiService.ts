/**
 * API Service
 * Centralizes all API calls and handles CORS issues
 */

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check if running in development environment
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('.localhost') ||
    import.meta.env.DEV;

  if (isDevelopment) {
    return 'http://localhost:5000';
  }
  
  // For production, use the deployed API URL (no localhost)
  // This will depend on your deployment setup, but often it's relative to the current domain
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Custom fetch function that handles CORS issues
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Check if running in development environment
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('.localhost') ||
    import.meta.env.DEV;
  
  // In production, just use regular fetch without CORS workarounds
  if (!isDevelopment) {
    return fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
  
  // Development environment with CORS handling
  try {
    // First attempt: regular fetch
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  } catch (error) {
    console.warn('Regular fetch failed, attempting with no-cors mode:', error);
    
    // Second attempt: no-cors mode
    return fetch(fullUrl, {
      ...options,
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
}

/**
 * Checks the status of the API
 * @returns Promise with the API status or null if error
 */
export async function checkApiStatus(): Promise<{ status: string } | null> {
  // Check if running in development environment
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('.localhost') ||
    import.meta.env.DEV;
    
  const endpoint = isDevelopment 
    ? `${API_BASE_URL}/api/v2/status` 
    : '/api/v2/status';  // In production, use a relative URL
  
  try {
    if (isDevelopment) {
      // Development: Use no-cors mode directly
      const response = await fetch(endpoint, {
        method: 'GET',
        mode: 'no-cors',
      });
      
      // With no-cors mode, we get an opaque response that we can't read
      // So we just return a default status object
      if (response.type === 'opaque') {
        console.log('Received opaque response from status API - assuming it is working');
        return { status: 'ok' };
      }
      
      if (!response.ok) {
        console.error(`API status error: ${response.status}`);
        return null;
      }
      
      return await response.json();
    } else {
      // Production: Just use regular fetch
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`API status error: ${response.status}`);
        return null;
      }
      return await response.json();
    }
  } catch (error) {
    console.error('Error checking API status:', error);
    return null;
  }
}

/**
 * Additional API methods can be added here
 */ 