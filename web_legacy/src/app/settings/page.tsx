"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { TopBar } from "@/components/TopBar";
import {
  LogOut,
  User,
  Shield,
  Smartphone,
  Globe,
  Info,
  ChevronRight,
  Sprout,
} from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    if (!confirm("Are you sure you want to sign out?")) return;
    await signOut();
    router.replace("/");
  }

  const isAnonymous = user?.isAnonymous;

  return (
    <>
      <TopBar title="Settings" />
      <div className="page-container">
        {/* User Info */}
        <div className="card flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center">
            {isAnonymous ? (
              <Smartphone className="text-brand-600" size={24} />
            ) : (
              <User className="text-brand-600" size={24} />
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-stone-800">
              {isAnonymous ? "Offline User" : user?.email || "Farmer"}
            </h2>
            <p className="text-sm text-stone-400">
              {isAnonymous
                ? "Data stored on this device"
                : "Synced to cloud"}
            </p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-2 mb-8">
          <SettingItem
            icon={<Globe size={20} />}
            label="Language"
            sublabel="English"
            disabled
          />
          <SettingItem
            icon={<Shield size={20} />}
            label="Privacy"
            sublabel="Your data is private and encrypted"
            disabled
          />
          <SettingItem
            icon={<Info size={20} />}
            label="About FarmTrack"
            sublabel="Version 1.0.0 MVP"
            disabled
          />
        </div>

        {/* Privacy Notice */}
        <div className="card bg-brand-50 border-brand-100 mb-6">
          <div className="flex gap-3">
            <Sprout className="text-brand-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-brand-800 text-sm mb-1">
                Your Data is Private
              </h3>
              <p className="text-brand-700 text-xs leading-relaxed">
                FarmTrack stores your data securely. Only you can access your
                farming records. No data is shared with third parties.
                {isAnonymous
                  ? " Sign up to backup your data to the cloud."
                  : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={handleSignOut} className="btn-danger w-full">
          <LogOut size={18} />
          {isAnonymous ? "Reset & Sign Out" : "Sign Out"}
        </button>
      </div>
    </>
  );
}

function SettingItem({
  icon,
  label,
  sublabel,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="card w-full flex items-center gap-3 text-left opacity-90"
    >
      <div className="text-stone-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-700 text-sm">{label}</p>
        {sublabel && (
          <p className="text-xs text-stone-400 truncate">{sublabel}</p>
        )}
      </div>
      <ChevronRight size={16} className="text-stone-300" />
    </button>
  );
}
