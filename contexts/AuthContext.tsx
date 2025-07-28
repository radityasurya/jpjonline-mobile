import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    email: 'premium@jpj.com',
    password: 'premium123',
    subscription: 'premium' as const,
  },
  {
    id: '2',
    name: 'Siti Aminah',
    email: 'free@jpj.com',
    password: 'free123',
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
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = DEMO_USERS.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          subscription: foundUser.subscription,
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('token', 'mock-jwt-token');
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        subscription: 'free' as const,
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', 'mock-jwt-token');
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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