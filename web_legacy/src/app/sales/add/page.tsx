"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createSale } from "@/lib/firestore";
import { TopBar } from "@/components/TopBar";
import { todayISO } from "@/lib/utils";
import type { BuyerType, PaymentStatus } from "@/types";
import { Loader2, ShoppingCart } from "lucide-react";

const BUYER_TYPES: { value: BuyerType; label: string; icon: string }[] = [
  { value: "market", label: "Market", icon: "🏪" },
  { value: "cooperative", label: "Co-op", icon: "🤝" },
  { value: "individual", label: "Person", icon: "👤" },
  { value: "other", label: "Other", icon: "📋" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "paid", label: "Paid ✓" },
  { value: "partial", label: "Partial" },
  { value: "unpaid", label: "Unpaid" },
];

export default function AddSalePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={32} /></div>}>
      <AddSaleContent />
    </Suspense>
  );
}

function AddSaleContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cropId = searchParams.get("cropId") || "";
  const seasonId = searchParams.get("seasonId") || "";

  const [quantitySold, setQuantitySold] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [date, setDate] = useState(todayISO());
  const [buyerType, setBuyerType] = useState<BuyerType>("market");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [buyerName, setBuyerName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const qty = parseFloat(quantitySold) || 0;
  const price = parseFloat(pricePerUnit) || 0;
  const totalPrice = qty * price;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || qty <= 0 || price <= 0) return;

    setSaving(true);
    await createSale(user.uid, {
      cropCycleId: cropId,
      seasonId,
      date,
      quantitySold: qty,
      unit,
      pricePerUnit: price,
      totalPrice,
      buyerType,
      paymentStatus,
      buyerName: buyerName.trim() || undefined,
      note: note.trim() || undefined,
    });
    router.back();
  }

  return (
    <>
      <TopBar title="Record Sale" showBack />
      <div className="page-container">
        {/* Sale Icon Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center">
            <ShoppingCart className="text-brand-500" size={32} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quantity */}
          <div>
            <label className="label">Quantity Sold</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value)}
                placeholder="0"
                className="input-field flex-1 text-lg font-bold"
                min="0.1"
                step="0.1"
                required
                autoFocus
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="input-field w-24"
              >
                <option value="kg">kg</option>
                <option value="bags">bags</option>
                <option value="tons">tons</option>
                <option value="bundles">bundles</option>
              </select>
            </div>
          </div>

          {/* Price Per Unit */}
          <div>
            <label className="label">Price per {unit} (RWF)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                RWF
              </span>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                placeholder="0"
                className="input-field pl-14 text-lg font-bold"
                min="1"
                required
              />
            </div>
          </div>

          {/* Total Preview */}
          {totalPrice > 0 && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-center">
              <p className="text-sm text-brand-600 font-medium">Total Sale</p>
              <p className="text-2xl font-extrabold text-brand-700">
                {totalPrice.toLocaleString()} RWF
              </p>
            </div>
          )}

          {/* Buyer Type */}
          <div>
            <label className="label">Buyer Type</label>
            <div className="grid grid-cols-4 gap-2">
              {BUYER_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => setBuyerType(bt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    buyerType === bt.value
                      ? "border-brand-400 bg-brand-50"
                      : "border-stone-100 bg-white hover:border-stone-200"
                  }`}
                >
                  <span className="text-xl">{bt.icon}</span>
                  <span className="text-xs font-medium text-stone-600">{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="label">Payment Status</label>
            <div className="flex gap-2">
              {PAYMENT_STATUSES.map((ps) => (
                <button
                  key={ps.value}
                  type="button"
                  onClick={() => setPaymentStatus(ps.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    paymentStatus === ps.value
                      ? ps.value === "paid"
                        ? "bg-brand-50 text-brand-700 border-2 border-brand-300"
                        : ps.value === "partial"
                        ? "bg-amber-50 text-amber-700 border-2 border-amber-300"
                        : "bg-red-50 text-red-700 border-2 border-red-300"
                      : "bg-white text-stone-500 border-2 border-stone-100 hover:border-stone-200"
                  }`}
                >
                  {ps.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">Sale Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Buyer Name */}
          <div>
            <label className="label">Buyer Name (optional)</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="e.g. Kigali Market, Jean"
              className="input-field"
            />
          </div>

          {/* Note */}
          <div>
            <label className="label">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Grade A quality"
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : "Save Sale"}
          </button>
        </form>
      </div>
    </>
  );
}
