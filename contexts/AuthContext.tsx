import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { progressService, activityService, ACTIVITY_TYPES } from '@/services';
import { login as loginAPI, refreshAccessToken, signup as signupAPI } from '@/services/authService';
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
  register: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => Promise<boolean>;
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
        logger.info('AuthContext', 'User found in storage', {
          userId: user.id,
        });
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
      const response = await loginAPI({ email, password }) as any;

      if (response.success && response.user) {
        logger.info('AuthContext', 'Login successful', {
          userId: response.user.id,
          tier: response.user.tier,
        });
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
        progressService?.updateStats?.('session_start', {
          timestamp: new Date().toISOString(),
        });

        // Track login activity
        activityService?.addActivity?.(ACTIVITY_TYPES.SESSION_STARTED, {
          userId: userData.id,
          userTier: userData.tier,
          timestamp: new Date().toISOString(),
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

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }): Promise<boolean> => {
    setIsLoading(true);
    logger.info('AuthContext', 'Registration attempt started', {
      email: userData.email,
      name: userData.name
    });
    
    try {
      const response = await signupAPI(userData) as any;

      if (response.success && response.user) {
        logger.info('AuthContext', 'Registration successful', {
          userId: response.user.id,
          email: response.user.email
        });
        
        const user = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          tier: response.user.tier,
          role: response.user.role,
          isActive: response.user.isActive,
          premiumUntil: response.user.premiumUntil,
        };
        
        await storageService.setItem('user', user);
        
        // Initialize progress tracking for new user
        progressService?.initializeUser?.(user.id);

        setUser(user);
        logger.info('AuthContext', 'Registration completed successfully, returning true');
        return true;
      } else {
        logger.warn('AuthContext', 'Registration failed', { response });
        return false;
      }
    } catch (error: any) {
      logger.error('AuthContext', 'Registration error', error);
      
      // Re-throw the error with validation details so the UI can handle it
      if (error.validationErrors || error.statusCode === 400) {
        throw error;
      }
      
      // Fallback to demo registration for development (only for network errors)
      logger.debug('AuthContext', 'Using demo registration fallback');
      const user = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        tier: 'FREE' as const,
        role: 'USER',
        isActive: true,
      };
      
      await storageService.setItem('user', user);
      await storageService.setItem('accessToken', 'demo-jwt-token');
      
      // Initialize progress tracking for new user
      progressService?.initializeUser?.(user.id);

      setUser(user);
      return true;
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
          timestamp: new Date().toISOString(),
        });

        // Track logout activity
        activityService?.addActivity?.(ACTIVITY_TYPES.SESSION_ENDED, {
          userId: user.id,
          sessionDuration: 0, // Could calculate actual duration
          timestamp: new Date().toISOString(),
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
    const handleAuthError = (error: any) => {
      if (error.message === 'Session expired. Please login again.') {
        logger.warn('AuthContext', 'Session expired, logging out user');
        logout();
      }
    };

    // Global error handler for authentication errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('Session expired. Please login again.')) {
        handleAuthError({ message: 'Session expired. Please login again.' });
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
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
