import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { progressService, activityService, ACTIVITY_TYPES } from '@/services';
import { login as loginAPI, refreshAccessToken } from '@/services/authService';
import storageService from '@/services/storage';

interface User {
  id: string;
  name: string;
  email: string;
  tier: 'FREE' | 'PREMIUM';
  role: string;
  premiumUntil?: string;
  isActive: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users
const DEMO_USERS = [
  {
    id: '1',
    name: 'Ahmad Faizal',
    email: 'premium@jpjonline.com',
    password: 'premium123',
    tier: 'PREMIUM' as const,
    role: 'USER',
    isActive: true,
    premiumUntil: '2026-07-25T13:41:01.520Z',
  },
  {
    id: '2',
    name: 'Siti Aminah',
    email: 'free@jpjonline.com',
    password: 'free123',
    tier: 'FREE' as const,
    role: 'USER',
    isActive: true,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      logger.debug('AuthContext', 'Checking authentication state');
      const userData = await storageService.getItem('user');
      if (userData) {
        const user = userData;
        logger.info('AuthContext', 'User found in storage', { userId: user.id });
        // Initialize progress tracking for returning user
        progressService?.initializeUser?.(user.id);
        setUser(user);
      } else {
        logger.debug('AuthContext', 'No user found in storage');
      }
    } catch (error) {
      logger.error('AuthContext', 'Failed to check auth state', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    logger.info('AuthContext', 'Login attempt started', { email });
    try {
      const response = await loginAPI({ email, password });
      
      if (response.success && response.user) {
        logger.info('AuthContext', 'Login successful', { userId: response.user.id, tier: response.user.tier });
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          tier: response.user.tier,
          role: response.user.role,
          premiumUntil: response.user.premiumUntil,
          isActive: response.user.isActive,
        };
        await storageService.setItem('user', userData);
        if (response.token) {
          await storageService.setItem('accessToken', response.token);
        }
        if (response.refreshToken) {
          await storageService.setItem('refreshToken', response.refreshToken);
        }
        
        // Initialize progress tracking for new session
        progressService?.initializeUser?.(userData.id);
        
        // Track login session
        progressService?.updateStats?.('session_start', { timestamp: new Date().toISOString() });
        
        // Track login activity
        activityService?.addActivity?.(ACTIVITY_TYPES.SESSION_STARTED, {
          userId: userData.id,
          userTier: userData.tier,
          timestamp: new Date().toISOString()
        });
        
        setUser(userData);
        return true;
      }
      
      logger.warn('AuthContext', 'Login failed - invalid response', { email });
      return false;
    } catch (error) {
      logger.error('AuthContext', 'Login error', error);
      // Demo users fallback - kept for debugging
      // logger.debug('AuthContext', 'Falling back to demo users');
      // const foundUser = DEMO_USERS.find(
      //   u => u.email === email && u.password === password
      // );
      //
      // if (foundUser) {
      //   logger.info('AuthContext', 'Demo login successful', { userId: foundUser.id, tier: foundUser.tier });
      //   const userData = {
      //     id: foundUser.id,
      //     name: foundUser.name,
      //     email: foundUser.email,
      //     tier: foundUser.tier,
      //     role: foundUser.role,
      //     premiumUntil: foundUser.premiumUntil,
      //     isActive: foundUser.isActive,
      //   };
      //   await AsyncStorage.setItem('user', JSON.stringify(userData));
      //   await AsyncStorage.setItem('accessToken', 'demo-jwt-token');
      //   
      //   // Initialize progress tracking for new session
      //   progressService?.initializeUser?.(userData.id);
      //   
      //   // Track login session
      //   progressService?.updateStats?.('session_start', { timestamp: new Date().toISOString() });
      //   
      //   // Track login activity
      //   activityService?.addActivity?.(ACTIVITY_TYPES.SESSION_STARTED, {
      //     userId: userData.id,
      //     userTier: userData.tier,
      //     timestamp: new Date().toISOString()
      //   });
      //   
      //   setUser(userData);
      //   return true;
      // }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    logger.info('AuthContext', 'Registration attempt started', { email, name });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info('AuthContext', 'Registration successful', { email });
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        tier: 'FREE' as const,
        role: 'USER',
        isActive: true,
      };
      await storageService.setItem('user', userData);
      await storageService.setItem('accessToken', 'demo-jwt-token');
      
      // Initialize progress tracking for new user
      progressService?.initializeUser?.(userData.id);
      
      setUser(userData);
      return true;
    } catch (error) {
      logger.error('AuthContext', 'Registration error', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      logger.info('AuthContext', 'User logout initiated');
      
      // Track session end before logout
      if (user) {
        progressService?.updateStats?.('session_end', { 
          duration: 0, // Could track actual session duration
          timestamp: new Date().toISOString() 
        });
        
        // Track logout activity
        activityService?.addActivity?.(ACTIVITY_TYPES.SESSION_ENDED, {
          userId: user.id,
          sessionDuration: 0, // Could calculate actual duration
          timestamp: new Date().toISOString()
        });
      }
      
      await storageService.removeItem('user');
      await storageService.removeItem('accessToken');
      await storageService.removeItem('refreshToken');
      setUser(null);
      logger.info('AuthContext', 'User logout completed');
    } catch (error) {
      logger.error('AuthContext', 'Logout error', error);
    }
  };

  // Listen for authentication errors and logout user
  useEffect(() => {
    const handleAuthError = () => {
      logger.warn('AuthContext', 'Authentication error detected, logging out user');
      logout();
    };

    // You can add event listeners here if needed
    // For now, the makeAuthenticatedRequest function handles token refresh automatically
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};