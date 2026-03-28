"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { Sprout, TrendingUp, Wifi, WifiOff } from "lucide-react";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-600">
        <Sprout className="text-white animate-pulse" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 via-brand-700 to-brand-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
          <Sprout className="text-white" size={40} />
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-3">
          FarmTrack
        </h1>
        <p className="text-brand-100 text-lg max-w-xs leading-relaxed">
          Know your profit. Grow your farm.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 w-full max-w-xs">
          <Feature
            icon={<TrendingUp size={20} />}
            text="Track expenses, harvests & sales"
          />
          <Feature
            icon={<Sprout size={20} />}
            text="See profit per crop, per season"
          />
          <Feature
            icon={<WifiOff size={20} />}
            text="Works offline — sync when ready"
          />
        </div>
      </div>

      <div className="px-6 pb-10 space-y-3 max-w-sm mx-auto w-full">
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-white text-brand-700 font-bold rounded-2xl px-6 py-4 text-lg
                     hover:bg-brand-50 active:scale-[0.98] transition-all shadow-lg shadow-brand-900/20"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/login?mode=offline")}
          className="w-full bg-white/10 text-white font-semibold rounded-2xl px-6 py-4 text-base
                     hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-sm
                     border border-white/20"
        >
          <span className="flex items-center justify-center gap-2">
            <WifiOff size={18} />
            Continue Offline
          </span>
        </button>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
      <div className="text-brand-200 flex-shrink-0">{icon}</div>
      <span className="text-white/90 text-sm font-medium">{text}</span>
    </div>
  );
}
