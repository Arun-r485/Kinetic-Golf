import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: string;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  login: (token: string, user: any) => void;
  signIn: (email: string, password: string) => Promise<void>;
  demoLogin: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('kinetic_user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
        // Refresh with latest data from server
        await refreshUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: any) => {
    // If the data is wrapped in a 'user' property (new backend format)
    const rawUser = userData.user || userData;

    const mappedUser: User = {
      uid: rawUser.id || rawUser.uid,
      id: rawUser.id || rawUser.uid,
      email: rawUser.email,
      displayName: rawUser.name || rawUser.displayName,
      name: rawUser.name || rawUser.displayName,
      role: rawUser.role,
      subscriptionStatus: rawUser.subscriptionStatus || 'inactive',
      subscriptionPlan: rawUser.subscriptionPlan || null,
      subscriptionRenewalDate: rawUser.subscriptionRenewalDate || null,
      charityId: rawUser.charityId || null,
      charityContributionPercent: rawUser.charityContributionPercent || 0,
      createdAt: rawUser.createdAt || new Date().toISOString(),
      plan: rawUser.plan || {
        name: rawUser.subscriptionPlan,
        status: rawUser.subscriptionStatus
      },
      phone: rawUser.phone,
      address: rawUser.address,
      state: rawUser.state,
      pincode: rawUser.pincode,
      region: rawUser.region || 'India',
      currency: rawUser.currency || 'INR'
    };
    setUser(mappedUser);
    localStorage.setItem('kinetic_user', JSON.stringify(mappedUser));
    localStorage.setItem('token', token);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await api.login({ email, password });
      login(result.token, result.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = () => {
    const mockUser: User = {
      uid: 'mock-123',
      id: 'mock-123',
      email: 'demo@kineticgolf.com',
      displayName: 'Demo User',
      name: 'Demo User',
      role: 'subscriber',
      subscriptionStatus: 'active',
      subscriptionPlan: 'yearly',
      subscriptionRenewalDate: '2026-12-31T23:59:59Z',
      charityId: 'charity-1',
      charityContributionPercent: 10,
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem('kinetic_user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await api.register({ name, email, password });
      // After registration, log them in
      await signIn(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kinetic_user');
    localStorage.removeItem('token');
  };

  const refreshUser = async () => {
    try {
      const result = await api.getProfile();
      const token = localStorage.getItem('token');
      if (token) {
        login(token, result);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    role: user?.role || 'public',
    isAuthenticated: !!user,
    isSubscribed: user?.subscriptionStatus === 'active',
    login,
    signIn,
    demoLogin,
    signup,
    logout,
    refreshUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
