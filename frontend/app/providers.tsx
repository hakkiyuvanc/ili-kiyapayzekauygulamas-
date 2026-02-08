"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { authApi } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      console.log("Auth: Init starting...");
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const isGuest = localStorage.getItem("isGuest") === "true";
      console.log("Auth: Token exists?", !!token);
      console.log("Auth: Is guest?", isGuest);

      if (token) {
        // Optimistik olarak local veriyi yükle
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log("Auth: Loaded user from localStorage", parsedUser);
          } catch (e) {
            console.error("Local user parse error", e);
          }
        }

        // Misafir kullanıcılar için backend doğrulamasını atla
        if (isGuest) {
          console.log(
            "Auth: Guest user detected, skipping backend verification",
          );
          // Ensure user is set for guest
          if (!user && savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              console.error("Failed to parse guest user", e);
            }
          }
          setIsLoading(false);
          return;
        }

        // Backend verification (sadece normal kullanıcılar için)
        try {
          console.log("Auth: Verifying with backend...");
          const response = await authApi.getProfile();
          console.log("Auth: Backend verified", response.data);
          // Backend UserResponse doesn't have is_pro, so we add it
          const freshUser: User = {
            ...response.data,
            is_pro: response.data.is_pro || false,
          };
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } catch (error: any) {
          console.error("Token verification failed:", error);
          // Only clear session if it's explicitly an Auth error
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isGuest");
            setUser(null);
          } else {
            // Network error or server error?
            // Keep the local user data (optimistic) but maybe show error toast?
            // For now, assume optimistic user is fine to show Dashboard in offline mode if needed.
            // Or we can set `isLoading` false and let the app decide.
            console.warn(
              "Retaining optimistic session despite verification failure (non-401)",
            );
          }
        }
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        setUser(null);
      }
      console.log("Auth: Loading complete");
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    // Ensure is_pro exists
    const safeUser: User = { ...userData, is_pro: userData.is_pro || false };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(safeUser));
    setUser(safeUser);
    // Force hard navigation to ensure clean state
    window.location.href = "/dashboard";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isGuest");
    setUser(null);
    window.location.href = "/auth";
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// --- Toast Context ---
// We can expose the toast methods globally if needed, or just wrap the container here.
// For simplicity, we'll keep useToast local to components or create a context if deeply nested components need it.
// Actually, creating a ToastContext is better so deep components don't need prop drilling.

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, success, error, info, warning, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {children}
    </ToastContext.Provider>
  );
}

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

// --- Main Providers Wrapper ---
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
