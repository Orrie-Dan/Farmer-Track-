"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createHarvest } from "@/lib/firestore";
import { TopBar } from "@/components/TopBar";
import { todayISO } from "@/lib/utils";
import { Loader2, Wheat } from "lucide-react";

export default function AddHarvestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={32} /></div>}>
      <AddHarvestContent />
    </Suspense>
  );
}

function AddHarvestContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cropId = searchParams.get("cropId") || "";
  const seasonId = searchParams.get("seasonId") || "";

  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [harvestDate, setHarvestDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !quantity) return;

    const numQty = parseFloat(quantity);
    if (numQty <= 0) return;

    setSaving(true);
    await createHarvest(user.uid, {
      cropCycleId: cropId,
      seasonId,
      harvestDate,
      quantity: numQty,
      unit,
      note: note.trim(),
    });
    router.back();
  }

  return (
    <>
      <TopBar title="Record Harvest" showBack />
      <div className="page-container">
        {/* Harvest Icon Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
            <Wheat className="text-amber-500" size={32} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quantity */}
          <div>
            <label className="label">Quantity Harvested</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="input-field text-xl font-bold text-center"
              min="0"
              step="0.1"
              required
              autoFocus
            />
          </div>

          {/* Unit */}
          <div>
            <label className="label">Unit</label>
            <div className="flex gap-2">
              {["kg", "bags", "tons", "bundles"].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    unit === u
                      ? "bg-amber-50 text-amber-700 border-2 border-amber-300"
                      : "bg-white text-stone-500 border-2 border-stone-100 hover:border-stone-200"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">Harvest Date</label>
            <input
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
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
              placeholder="e.g. First harvest, good quality"
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : "Save Harvest"}
          </button>
        </form>
      </div>
    </>
  );
}
