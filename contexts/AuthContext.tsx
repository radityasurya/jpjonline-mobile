import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';
import { progressService, activityService, ACTIVITY_TYPES } from '@/services';

interface User {
  id: string;
  name: string;
  email: string;
  subscription: 'free' | 'premium';
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
    subscription: 'premium' as const,
  },
  {
    id: '2',
    name: 'Siti Aminah',
    email: 'user@jpjonline.com',
    password: 'user123',
    subscription: 'free' as const,
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
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = DEMO_USERS.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        logger.info('AuthContext', 'Login successful', { userId: foundUser.id, tier: foundUser.subscription });
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          subscription: foundUser.subscription,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', 'mock-jwt-token');
        
        // Initialize progress tracking for new session
        progressService?.initializeUser?.(userData.id);
        
        // Track login session
        progressService?.updateStats?.('session_start', { timestamp: new Date().toISOString() });
        
        // Track login activity
        activityService?.addActivity?.(ACTIVITY_TYPES.SESSION_STARTED, {
          userId: userData.id,
          userTier: userData.subscription,
          timestamp: new Date().toISOString()
        });
        
        setUser(userData);
        return true;
      } else {
        logger.warn('AuthContext', 'Login failed - invalid credentials', { email });
      }
      return false;
    } catch (error) {
      logger.error('AuthContext', 'Login error', error);
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
        subscription: 'free' as const,
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', 'mock-jwt-token');
      
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
      
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      logger.info('AuthContext', 'User logout completed');
    } catch (error) {
      logger.error('AuthContext', 'Logout error', error);
    }
  };

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