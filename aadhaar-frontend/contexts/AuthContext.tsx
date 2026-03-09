/**
 * AuthContext
 * 
 * Provides authentication state and actions throughout the application.
 * Handles JWT token management, user sessions, and auth-related operations.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  User,
  AuthState,
  LoginCredentials,
  GoogleAuthPayload,
} from '../types';
import {
  login as apiLogin,
  googleLogin as apiGoogleLogin,
  logout as apiLogout,
  getCurrentUser,
  initializeAuth,
  clearAuthData,
  setAuthToken,
  setStoredUser,
} from '../services/authApi';

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google OAuth Client ID (from environment)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start loading to check for existing session
    error: null,
  });

  // Initialize auth state from storage on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for OAuth callback parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get('token');
      const oauthUserStr = urlParams.get('user');
      
      // Handle OAuth callback if token and user are in URL
      if (oauthToken && oauthUserStr) {
        try {
          const oauthUser = JSON.parse(decodeURIComponent(oauthUserStr));
          
          // Store token and user
          setAuthToken(oauthToken);
          setStoredUser(oauthUser);
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setState({
            user: oauthUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        } catch (err) {
          console.error('Failed to parse OAuth callback data:', err);
          // Clear URL parameters on error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
      
      const { token, user } = initializeAuth();
      
      if (token && user) {
        // If demo token, use stored user without API call
        if (token.startsWith('demo-token-')) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
        
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await getCurrentUser();
          setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // Token invalid, clear auth data
          clearAuthData();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  // Login with email/password
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiLogin(credentials);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Login failed',
      }));
      throw err;
    }
  }, []);

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async (payload: GoogleAuthPayload) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiGoogleLogin(payload);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Google login failed',
      }));
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await apiLogout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const { token } = initializeAuth();
    
    if (!token) {
      return false;
    }

    try {
      await getCurrentUser();
      return true;
    } catch {
      clearAuthData();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return false;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    loginWithGoogle,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Access authentication state and actions from any component.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Initialize Google OAuth
 * 
 * Call this to trigger Google Sign-In popup
 */
export const initGoogleAuth = (onSuccess: (payload: GoogleAuthPayload) => void): void => {
  if (!GOOGLE_CLIENT_ID) {
    console.error('Google Client ID not configured');
    return;
  }

  // Load Google Sign-In script if not already loaded
  if (!window.google) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleSignIn(onSuccess);
    document.body.appendChild(script);
  } else {
    initializeGoogleSignIn(onSuccess);
  }
};

function initializeGoogleSignIn(onSuccess: (payload: GoogleAuthPayload) => void): void {
  if (!window.google) return;

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: { credential: string }) => {
      onSuccess({ credential: response.credential });
    },
  });

  window.google.accounts.id.prompt();
}

// Type declaration for Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (
            element: HTMLElement,
            options: { theme?: string; size?: string; width?: number }
          ) => void;
        };
      };
    };
  }
}

export default AuthContext;
