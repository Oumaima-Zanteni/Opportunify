"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getStoredToken, setStoredToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await api.post("/auth/register", payload);
    setStoredToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await api.put("/auth/profile", payload);
    setUser(data.user);
    return data.user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    reload: loadMe,
    isRecruiter: user?.role === "recruiter" || user?.role === "admin",
    isJobseeker: user?.role === "jobseeker",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
