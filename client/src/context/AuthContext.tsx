"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Role } from "@/lib/roles";
import { dataStore, User } from "@/lib/dataStore";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    password?: string;
    role: "owner" | "renter";
    campus: string;
    collegeYear?: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  loginAsRole: (role: Role) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => { },
  switchRole: () => { },
  loginAsRole: () => { },
  updateUserProfile: () => { },
  refreshUser: () => { },
});

const DEFAULT_USERS_BY_ROLE: Record<Role, string> = {
  system_admin: "usr-admin",
  owner: "usr-owner-marcus",
  renter: "usr-renter-priya",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = () => {
    try {
      const isExplicit = localStorage.getItem("wheelzy_auth_explicit") === "true";
      const storedId = localStorage.getItem("wheelzy_user_id");
      if (isExplicit && storedId) {
        const found = dataStore.getUserById(storedId);
        if (found) {
          setUser(found);
          document.cookie = `wheelzy_role=${found.role}; path=/; max-age=86400`;
          return;
        }
      }
      setUser(null);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Check localStorage for an explicit user session
    try {
      const isExplicit = localStorage.getItem("wheelzy_auth_explicit") === "true";
      const storedId = localStorage.getItem("wheelzy_user_id");

      if (isExplicit && storedId) {
        const found = dataStore.getUserById(storedId);
        if (found) {
          setUser(found);
          document.cookie = `wheelzy_role=${found.role}; path=/; max-age=86400`;
          setIsLoading(false);
          return;
        }
      }

      // Guest / unauthenticated visitor by default
      localStorage.removeItem("wheelzy_user_id");
      localStorage.removeItem("wheelzy_auth_explicit");
      document.cookie = "wheelzy_role=; path=/; max-age=0";
      setUser(null);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsRole = (role: Role) => {
    const userId = DEFAULT_USERS_BY_ROLE[role];
    const u = dataStore.getUserById(userId);
    if (u) {
      setUser(u);
      localStorage.setItem("wheelzy_auth_explicit", "true");
      localStorage.setItem("wheelzy_user_id", u.id);
      document.cookie = `wheelzy_role=${u.role}; path=/; max-age=86400`;
    }
  };

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Basic validation
      if (!normalizedEmail) {
        setIsLoading(false);
        return { success: false, error: "Please enter your registered email address." };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        setIsLoading(false);
        return { success: false, error: "Please enter a valid email format (e.g. user@campus.edu)." };
      }

      if (password !== undefined && password.trim().length === 0) {
        setIsLoading(false);
        return { success: false, error: "Please enter your password." };
      }

      const users = dataStore.getUsers();
      let matched = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      // Demo fallback matches if typing simple keyword
      if (!matched) {
        if (normalizedEmail.includes("admin")) matched = users.find((u) => u.role === "system_admin");
        else if (normalizedEmail.includes("owner")) matched = users.find((u) => u.role === "owner");
        else if (normalizedEmail.includes("suspended")) matched = users.find((u) => u.status === "suspended");
      }

      if (!matched) {
        setIsLoading(false);
        // Generic message as per security requirements to avoid revealing registered email presence
        return { success: false, error: "Invalid email address or password. Please verify your credentials." };
      }

      // Check account status
      if (matched.status === "suspended") {
        setIsLoading(false);
        dataStore.addAuditLog(
          matched.name,
          matched.role,
          `LOGIN_DENIED_SUSPENDED: Suspended account attempted login`,
          matched.id
        );
        return {
          success: false,
          error: "Your account is currently suspended by campus administration. Please contact campus safety.",
        };
      }

      // Record successful login audit
      dataStore.addAuditLog(
        matched.name,
        matched.role,
        `USER_LOGIN_SUCCESS: Authenticated as ${matched.role}`,
        matched.id
      );

      setUser(matched);
      localStorage.setItem("wheelzy_auth_explicit", "true");
      localStorage.setItem("wheelzy_user_id", matched.id);
      document.cookie = `wheelzy_role=${matched.role}; path=/; max-age=86400`;

      // Redirect to home page as requested: "after login it has to show to the home page as the role they login"
      router.push("/");

      setIsLoading(false);
      return { success: true, user: matched };
    } catch {
      setIsLoading(false);
      return { success: false, error: "An unexpected error occurred during authentication." };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password?: string;
    role: "owner" | "renter";
    campus: string;
    collegeYear?: string;
    phone: string;
  }): Promise<{ success: boolean; error?: string; user?: User }> => {
    setIsLoading(true);
    try {
      // Disallow system_admin self-registration per requirement 6
      if ((data.role as string) === "system_admin") {
        setIsLoading(false);
        return { success: false, error: "Administrator accounts cannot be created via public registration." };
      }

      const users = dataStore.getUsers();
      const existing = users.find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
      if (existing) {
        setIsLoading(false);
        return { success: false, error: "An account with this email address is already registered." };
      }

      const created = dataStore.registerUser({
        name: data.name,
        email: data.email.trim(),
        role: data.role,
        campus: data.campus,
        collegeYear: data.collegeYear,
        phone: data.phone,
      });

      setUser(created);
      localStorage.setItem("wheelzy_auth_explicit", "true");
      localStorage.setItem("wheelzy_user_id", created.id);
      document.cookie = `wheelzy_role=${created.role}; path=/; max-age=86400`;

      // Redirect to home page
      router.push("/");

      setIsLoading(false);
      return { success: true, user: created };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Registration failed. Please check your details." };
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = dataStore.updateUser(user.id, updates);
    if (updated) {
      setUser(updated);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wheelzy_user_id");
    localStorage.removeItem("wheelzy_auth_explicit");
    document.cookie = "wheelzy_role=; path=/; max-age=0";
    router.push("/login");
  };

  const switchRole = (newRole: Role) => {
    loginAsRole(newRole);
    if (newRole === "system_admin") {
      router.push("/admin/dashboard");
    } else if (newRole === "owner") {
      router.push("/owner/dashboard");
    } else {
      router.push("/renter/dashboard");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        loginAsRole,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
