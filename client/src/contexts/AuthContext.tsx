import React, { createContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me", { credentials: "include" });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Not authenticated, but not an error
        setUser(null);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch user data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await res.json();
      
      setUser(userData);
      
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      
      console.log(`Login successful: Welcome back, ${userData.username}!`);
    } catch (err) {
      setError("Invalid username or password");
      console.error("Login failed: Invalid username or password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await apiRequest("POST", "/api/auth/register", { 
        username, 
        email, 
        password, 
        role 
      });
      
      const userData = await res.json();
      setUser(userData);
      
      console.log(`Registration successful: Welcome to LawnMates, ${userData.username}!`);
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed: Username or email may already be in use");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      
      // Clear any cached data
      queryClient.clear();
      
      console.log("Logged out successfully");
    } catch (err) {
      setError("Logout failed");
      console.error("Logout failed: Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
