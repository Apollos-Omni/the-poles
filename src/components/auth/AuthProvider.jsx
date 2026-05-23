import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/entities/User';

const AuthContext = createContext(null);

// Auth state management with proper error handling
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Auto-refresh session logic
  useEffect(() => {
    let refreshTimer;
    
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);
        
        const userData = await User.me();
        setUser(userData);
        setSessionExpired(false);
        
        // Set up session refresh - check every 5 minutes
        refreshTimer = setInterval(async () => {
          try {
            await User.me();
          } catch (error) {
            console.warn('Session refresh failed:', error);
            if (error.status === 401 || error.status === 403) {
              setSessionExpired(true);
              setUser(null);
            }
          }
        }, 5 * 60 * 1000);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthError(error);
        setUser(null);
        
        // Handle specific auth errors
        if (error.status === 401) {
          setSessionExpired(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, []);

  const login = async (callbackUrl = window.location.href) => {
    try {
      setAuthError(null);
      await User.loginWithRedirect(callbackUrl);
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError(error);
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      await User.logout();
      setUser(null);
      setSessionExpired(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthError(error);
    }
  };

  const refreshSession = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setSessionExpired(false);
      setAuthError(null);
    } catch (error) {
      console.error('Session refresh failed:', error);
      setAuthError(error);
      if (error.status === 401) {
        setSessionExpired(true);
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      authError,
      sessionExpired,
      login,
      logout,
      refreshSession,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};