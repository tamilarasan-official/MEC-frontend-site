/**
 * Authentication Service
 */

import { api } from './api';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'student' | 'captain' | 'owner' | 'accountant' | 'superadmin';
  isApproved: boolean;
  isActive: boolean;
  rollNumber?: string;
  department?: string;
  year?: number;
  balance: number;
  shopId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface RegisterData {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber: string;
  department: string;
  year: number;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

class AuthService {
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { username, password });

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens
        api.setTokens(tokens.accessToken, tokens.refreshToken);

        // Store user in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }

        return { success: true, user };
      }

      return {
        success: false,
        error: response.error?.message || 'Login failed',
      };
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);

      if (response.success && response.data) {
        return { success: true, user: response.data.user };
      }

      return {
        success: false,
        error: response.error?.message || 'Registration failed',
      };
    } catch (error) {
      console.error('[AuthService] Register error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  logout(): void {
    api.clearTokens();
    // Explicitly clear user data (also done in clearTokens, but being explicit)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    // Require both token and user data to be present
    return !!(token && user);
  }

  async refreshUserData(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/auth/me', true);

      if (response.success && response.data) {
        const user = response.data.user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
      }

      // 401/403 responses mean token is invalid - clear tokens to force re-login
      if (response.error?.code === 'UNAUTHORIZED' || response.error?.code === 'FORBIDDEN') {
        console.log('[AuthService] Session expired or invalid token - clearing auth');
        api.clearTokens();
        return null;
      }

      return null;
    } catch (error) {
      // Only log unexpected errors
      console.error('[AuthService] RefreshUserData error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
