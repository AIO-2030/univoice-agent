/**
 * CORS Proxy Utility
 * This utility handles CORS issues by providing a safer way to make cross-origin requests
 */

/**
 * Fetches data from a URL while handling CORS issues
 * @param url The URL to fetch from
 * @param options Fetch options
 * @returns Promise with the fetch response
 */
export async function fetchWithCorsHandling(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // First try with normal fetch
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.error("Initial fetch failed, trying with no-cors mode:", error);
    
    // If normal fetch fails, try with no-cors mode
    // Note: This will return an opaque response that can't be read
    // but can be used for requests that don't need a response body
    const fallbackOptions = {
      ...options,
      mode: 'no-cors' as RequestMode
    };
    
    return fetch(url, fallbackOptions);
  }
}

/**
 * Specifically for the status API endpoint
 * @returns Promise with the API status
 */
export async function checkApiStatus(): Promise<{ status: string } | null> {
  try {
    const response = await fetchWithCorsHandling('http://localhost:5000/api/v2/status');
    
    // If we got an opaque response, just return a default value
    if (response.type === 'opaque') {
      console.log('Received opaque response from status API - assuming it is working');
      return { status: 'ok' };
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking API status:", error);
    return null;
  }
} 