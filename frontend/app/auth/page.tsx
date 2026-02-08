"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "@/components/AuthScreen";
import { authApi } from "@/lib/api";
import { useAuth, useToastContext } from "../providers";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error: showError, info } = useToastContext();

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError("");

    try {
      // 1. Login
      const response = await authApi.login({ username: email, password });
      const { access_token } = response.data;

      // Save token temporarily
      localStorage.setItem("token", access_token);

      // 2. Immediate verification (Get Profile)
      try {
        console.log("[AUTH] Fetching user profile...");
        const profileResponse = await authApi.getProfile();
        console.log("[AUTH] Profile response received:", profileResponse);
        const user = profileResponse.data;
        console.log("[AUTH] User data:", user);

        // Save user data
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, is_pro: user.is_pro || false }),
        );
        console.log("[AUTH] User data saved to localStorage");

        success("Giriş başarılı, yönlendiriliyorsunuz...");
        console.log("[AUTH] Success toast shown, redirecting in 500ms...");

        setTimeout(() => {
          console.log("[AUTH] Redirecting to /dashboard");
          window.location.href = "/dashboard";
        }, 500);
      } catch (profileErr: any) {
        console.error("[AUTH] Profile fetch failed immediately:", profileErr);
        console.error(
          "[AUTH] Profile error details:",
          profileErr.response?.data,
        );
        console.error(
          "[AUTH] Profile error status:",
          profileErr.response?.status,
        );
        console.error(
          "[AUTH] Full error object:",
          JSON.stringify(profileErr, null, 2),
        );

        // Check specific error
        if (profileErr.response?.status === 401) {
          setAuthError(
            "Oturum açılamadı (Token reddedildi). Lütfen tekrar deneyin.",
          );
        } else {
          setAuthError(
            "Giriş yapıldı fakat profil alınamadı. Bağlantınızı kontrol edin.",
          );
        }
        // localStorage.removeItem('token'); // Keep token for debugging
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Giriş başarısız";

      if (
        err.response?.status === 403 &&
        errorMessage.includes("doğrulamanız")
      ) {
        info("Lütfen önce email adresinizi doğrulayın.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      setAuthError(errorMessage);
      showError(errorMessage);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    setIsLoading(true);
    setAuthError("");

    try {
      await authApi.register({ email, password, full_name: fullName });
      success("Kayıt başarılı! Lütfen emailinizi doğrulayın.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Kayıt başarısız";
      setAuthError(errorMessage);
      showError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    // Set guest user data in localStorage
    const guestUser = {
      id: 0,
      email: "guest@amor.ai",
      full_name: "Misafir Kullanıcı",
      is_pro: false,
      is_verified: false,
      onboarding_completed: false,
    };

    localStorage.setItem("isGuest", "true"); // CRITICAL: This flag tells AuthProvider to skip backend verification
    localStorage.setItem("user", JSON.stringify(guestUser));
    localStorage.setItem("token", "guest-token");

    info("Misafir olarak devam ediyorsunuz");

    // Force page reload to update auth context
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-romantic-gradient-soft flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="w-full max-w-md">
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onContinueAsGuest={handleContinueAsGuest}
          isLoading={isLoading}
          error={authError}
        />
      </div>
    </div>
  );
}
