"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createExpense } from "@/lib/firestore";
import { TopBar } from "@/components/TopBar";
import { todayISO } from "@/lib/utils";
import type { ExpenseCategory } from "@/types";
import { Loader2 } from "lucide-react";

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "seed", label: "Seed", icon: "🌱" },
  { value: "fertilizer", label: "Fertilizer", icon: "🧪" },
  { value: "pesticide", label: "Pesticide", icon: "🛡️" },
  { value: "labor", label: "Labor", icon: "👷" },
  { value: "transport", label: "Transport", icon: "🚛" },
  { value: "equipment", label: "Equipment", icon: "🔧" },
  { value: "irrigation", label: "Irrigation", icon: "💧" },
  { value: "other", label: "Other", icon: "📦" },
];

export default function AddExpensePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={32} /></div>}>
      <AddExpenseContent />
    </Suspense>
  );
}

function AddExpenseContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cropId = searchParams.get("cropId") || "";
  const seasonId = searchParams.get("seasonId") || "";

  const [category, setCategory] = useState<ExpenseCategory>("seed");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !amount) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) return;

    setSaving(true);
    await createExpense(user.uid, {
      cropCycleId: cropId,
      seasonId,
      category,
      amount: numAmount,
      date,
      note: note.trim(),
    });
    router.back();
  }

  return (
    <>
      <TopBar title="Add Expense" showBack />
      <div className="page-container">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Selection */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    category === cat.value
                      ? "border-brand-400 bg-brand-50"
                      : "border-stone-100 bg-white hover:border-stone-200"
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-stone-600">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (RWF)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                RWF
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="input-field pl-14 text-xl font-bold"
                min="1"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="label">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Bought 10kg of NPK fertilizer"
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : "Save Expense"}
          </button>
        </form>
      </div>
    </>
  );
}
