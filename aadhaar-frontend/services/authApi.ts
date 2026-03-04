/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls including:
 * - Email/password login
 * - Google OAuth
 * - Logout
 * - Token refresh
 * - Get current user
 */

import {
  User,
  AuthResponse,
  LoginCredentials,
  GoogleAuthPayload,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Token storage (in-memory with sessionStorage fallback)
let accessToken: string | null = null;

/**
 * Get the current auth token
 */
export function getAuthToken(): string | null {
  if (accessToken) return accessToken;
  // Fallback to sessionStorage for page refreshes
  return sessionStorage.getItem('auth_token');
}

/**
 * Set the auth token
 */
export function setAuthToken(token: string | null): void {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('auth_token', token);
  } else {
    sessionStorage.removeItem('auth_token');
  }
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  accessToken = null;
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
}

/**
 * Store user data
 */
export function setStoredUser(user: User | null): void {
  if (user) {
    sessionStorage.setItem('auth_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('auth_user');
  }
}

/**
 * Get stored user data
 */
export function getStoredUser(): User | null {
  const stored = sessionStorage.getItem('auth_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Generic fetch wrapper for auth endpoints
 */
async function authFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Auth Error (${response.status})`);
  }

  return response.json();
}

/**
 * Login with email and password
 * POST /auth/login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await authFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // Store token and user
  setAuthToken(response.accessToken);
  setStoredUser(response.user);
  
  return response;
}

/**
 * Login with Google OAuth
 * POST /auth/google
 */
export async function googleLogin(payload: GoogleAuthPayload): Promise<AuthResponse> {
  const response = await authFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  // Store token and user
  setAuthToken(response.accessToken);
  setStoredUser(response.user);
  
  return response;
}

/**
 * Logout user
 * POST /auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await authFetch<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  } finally {
    // Always clear local auth data, even if API call fails
    clearAuthData();
  }
}

/**
 * Get current authenticated user
 * GET /auth/me
 */
export async function getCurrentUser(): Promise<User> {
  const user = await authFetch<User>('/auth/me');
  setStoredUser(user);
  return user;
}

/**
 * Refresh access token
 * POST /auth/refresh
 */
export async function refreshToken(): Promise<AuthResponse> {
  const response = await authFetch<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });
  
  setAuthToken(response.accessToken);
  setStoredUser(response.user);
  
  return response;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  // Add 30 second buffer
  return Date.now() >= (expiresAt * 1000) - 30000;
}

/**
 * Initialize auth state from storage (for page refresh)
 */
export function initializeAuth(): { token: string | null; user: User | null } {
  const token = getAuthToken();
  const user = getStoredUser();
  return { token, user };
}
