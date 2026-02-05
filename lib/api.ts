/**
 * API Client for MadrasOne Backend
 * Production Configuration
 */

// Production API URL
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.mecfoodapp.welocalhost.com/api/v1').replace(/\/+$/, '');

// Log API base URL on client side
if (typeof window !== 'undefined') {
  console.log('[API] Base URL:', API_BASE_URL);
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  };
  timestamp?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Normalize endpoint to ensure proper URL construction
   * - Ensures endpoint starts with /
   * - Prevents double slashes
   */
  private normalizeEndpoint(endpoint: string): string {
    // Ensure endpoint starts with exactly one slash
    const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return normalized;
  }

  /**
   * Safe JSON parse that handles non-JSON responses
   */
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    // Check if response is JSON
    if (!contentType || !contentType.includes('application/json')) {
      // Non-JSON response (e.g., HTML error page)
      const text = await response.text();
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: response.ok ? 'Unexpected response format' : `Server error: ${response.status}`,
          details: text.substring(0, 200), // First 200 chars for debugging
        },
      };
    }

    try {
      return await response.json();
    } catch {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to parse server response',
        },
      };
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, requireAuth = false } = options;
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth) {
      const token = this.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Only log in development
    const isDev = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';

    try {
      if (isDev) {
        console.log(`[API] ${method} ${url}`, body ? JSON.stringify(body) : '');
      }

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      // Handle token expiration BEFORE parsing response
      if (response.status === 401 && requireAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          const newToken = this.getAccessToken();
          if (newToken) {
            requestHeaders['Authorization'] = `Bearer ${newToken}`;
          }
          const retryResponse = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include', // Include credentials in retry
          });
          const retryData = await this.parseResponse<T>(retryResponse);
          if (isDev) {
            console.log(`[API] Retry Response:`, retryData);
          }
          return retryData;
        }
        // Refresh failed, return unauthorized error
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Session expired. Please login again.',
          },
        };
      }

      const data = await this.parseResponse<T>(response);
      if (isDev) {
        console.log(`[API] Response:`, data);
      }

      return data;
    } catch (error) {
      // Network errors (no connection, CORS issues, etc.)
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      console.error('[API] Request failed:', errorMessage);

      // Check for common error types
      let errorCode = 'NETWORK_ERROR';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorCode = 'NETWORK_ERROR';
      } else if (errorMessage.includes('CORS')) {
        errorCode = 'CORS_ERROR';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        errorCode = 'TIMEOUT';
      }

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      // Check if response is OK and JSON
      if (!response.ok) {
        console.error('[API] Token refresh failed with status:', response.status);
        this.clearTokens();
        return false;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[API] Token refresh returned non-JSON response');
        this.clearTokens();
        return false;
      }

      const data = await response.json();

      // Backend returns tokens inside data.tokens
      const tokens = data.data?.tokens || data.data;
      if (data.success && tokens?.accessToken) {
        this.setTokens(tokens.accessToken, tokens.refreshToken || refreshToken);
        return true;
      }

      // Response was JSON but refresh was not successful
      console.error('[API] Token refresh unsuccessful:', data.error?.message);
    } catch (error) {
      console.error('[API] Token refresh failed:', error instanceof Error ? error.message : error);
    }

    this.clearTokens();
    return false;
  }

  // Convenience methods
  get<T>(endpoint: string, requireAuth = false) {
    return this.request<T>(endpoint, { method: 'GET', requireAuth });
  }

  post<T>(endpoint: string, body: unknown, requireAuth = false) {
    return this.request<T>(endpoint, { method: 'POST', body, requireAuth });
  }

  put<T>(endpoint: string, body: unknown, requireAuth = false) {
    return this.request<T>(endpoint, { method: 'PUT', body, requireAuth });
  }

  patch<T>(endpoint: string, body: unknown, requireAuth = false) {
    return this.request<T>(endpoint, { method: 'PATCH', body, requireAuth });
  }

  delete<T>(endpoint: string, requireAuth = false) {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
