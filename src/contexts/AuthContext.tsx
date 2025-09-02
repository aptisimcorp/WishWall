import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  personalAnniversary?: string;
  workAnniversary: string;
  profilePhoto?: string;
  department?: string;
  team?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  personalAnniversary?: string;
  workAnniversary: string;
  profilePhoto?: File;
  department?: string;
  team?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('wishboard-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email,
        birthday: '1990-05-15',
        workAnniversary: '2020-03-10',
        department: 'Engineering',
        team: 'Frontend',
        createdAt: new Date().toISOString(),
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      };
      
      setUser(mockUser);
      localStorage.setItem('wishboard-user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        birthday: userData.birthday,
        personalAnniversary: userData.personalAnniversary,
        workAnniversary: userData.workAnniversary,
        department: userData.department,
        team: userData.team,
        createdAt: new Date().toISOString(),
        profilePhoto: userData.profilePhoto ? URL.createObjectURL(userData.profilePhoto) : undefined
      };
      
      setUser(newUser);
      localStorage.setItem('wishboard-user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wishboard-user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('wishboard-user', JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}