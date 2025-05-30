import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

// Define types
export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'receptionist' | 'dermatologist';
  phoneNumber?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: UpdateProfileData) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'receptionist' | 'dermatologist';
  phoneNumber?: string;
}

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Set default Authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);

      const { token: newToken, user: userData } = response.data;

      // Save to state
      setToken(newToken);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);

      const { token: newToken, user: newUser } = response.data;

      // Save to state
      setToken(newToken);
      setUser(newUser);

      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      toast.success('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear Authorization header
    delete axios.defaults.headers.common['Authorization'];

    // Show success message
    toast.success('Logged out successfully');

    // Redirect to login page
    window.location.href = '/login';
  };

  // Update profile function
  const updateProfile = async (userData: UpdateProfileData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.updateProfile(userData);

      const updatedUser = response.data.user;

      // Update user in state
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);

      // Update user in localStorage
      if (user) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
