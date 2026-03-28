"use client";

import { AuthProvider } from "@/lib/auth-context";
import { BottomNav } from "@/components/BottomNav";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <main className="min-h-screen bg-stone-50">{children}</main>
      <BottomNav />
    </AuthProvider>
  );
}
