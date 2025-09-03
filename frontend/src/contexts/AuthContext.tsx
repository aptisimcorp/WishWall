import React, { createContext, useContext, useState, useEffect } from "react";

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

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem("wishboard-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // TypeScript fix for import.meta.env
  interface ImportMetaEnv {
    VITE_API_URL: string;
  }
  interface ImportMeta {
    env: ImportMetaEnv;
  }
  const API_URL = import.meta.env.VITE_API_URL;

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("wishboard-user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setLoading(true);
    try {
      let profilePhotoUrl: string | undefined = undefined;
      if (userData.profilePhoto) {
        // Upload profile photo first
        const formData = new FormData();
        formData.append("profilepicture", userData.profilePhoto);
        const uploadRes = await fetch(`${API_URL}/profile/upload`, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Profile photo upload failed");
        }
        const uploadData = await uploadRes.json();
        profilePhotoUrl = uploadData.url;
      }

      // Prepare user data for signup
      const signupPayload = {
        ...userData,
        profilePhoto: profilePhotoUrl,
      };
      // Remove profilePhoto file from payload if it's a File
      if (
        signupPayload.profilePhoto &&
        typeof signupPayload.profilePhoto === "object" &&
        "size" in signupPayload.profilePhoto
      ) {
        delete signupPayload.profilePhoto;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("wishboard-user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wishboard-user");
    localStorage.removeItem("token");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("wishboard-user", JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error("Profile update failed");
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
