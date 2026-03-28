"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export function TopBar({ title, showBack = false, action }: TopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone-100">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="icon-btn -ml-2"
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <h1 className="text-lg font-bold text-stone-800 truncate">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
