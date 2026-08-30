"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles, redirectTo = "/login" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push(redirectTo);
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.push("/");
    }
  }, [user, loading, roles, router, redirectTo]);

  if (loading) {
    return (
      <div className="section flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
          <p className="text-sm text-ink-muted">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user || (roles && !roles.includes(user.role))) return null;

  return children;
}
