"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useToastContext } from "../providers";
import { PageLoadingSpinner } from "@/components/LoadingSkeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { info } = useToastContext();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // 1. No user -> Redirect to Auth
    if (!user) {
      console.log("[Guard] No user, redirecting to /auth");
      router.push("/auth");
      return;
    }

    // 2. Guest user -> Allow
    if (user.email === "guest@amor.ai" || user.id === "guest") {
      setIsAuthorized(true);
      return;
    }

    // 3. Unverified user -> Redirect to verify
    if (!user.is_verified) {
      console.log("[Guard] User not verified, redirecting to /verify-email");
      info("Lütfen önce email adresinizi doğrulayın");
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    // 4. Authorized
    setIsAuthorized(true);
  }, [user, isLoading, router, info]);

  if (isLoading || !isAuthorized) {
    return <PageLoadingSpinner />;
  }

  return <>{children}</>;
}
