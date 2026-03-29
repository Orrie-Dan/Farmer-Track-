"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getCrop,
  getExpensesByCrop,
  getHarvestsByCrop,
  getSalesByCrop,
  updateCropStatus,
  deleteExpense,
  deleteHarvest,
  deleteSale,
} from "@/lib/firestore";
import { computeCropMetrics } from "@/lib/computations";
import { TopBar } from "@/components/TopBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CropCycle, Expense, Harvest, Sale, CropMetrics } from "@/types";
import {
  Sprout,
  Plus,
  Receipt,
  Wheat,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Package,
  Loader2,
  Trash2,
  Banknote,
  BarChart3,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  seed: "🌱",
  fertilizer: "🧪",
  pesticide: "🛡️",
  labor: "👷",
  transport: "🚛",
  equipment: "🔧",
  irrigation: "💧",
  other: "📦",
};

const TAB_CONFIG = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "expenses", label: "Expenses", icon: Receipt },
  { key: "harvests", label: "Harvests", icon: Wheat },
  { key: "sales", label: "Sales", icon: ShoppingCart },
];

export default function CropDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-brand-500" size={32} /></div>}>
      <CropDetailContent />
    </Suspense>
  );
}

function CropDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const cropId = params.id as string;
  const seasonId = searchParams.get("seasonId") || "";

  const [crop, setCrop] = useState<CropCycle | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<CropMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [c, e, h, s] = await Promise.all([
      getCrop(user.uid, cropId),
      getExpensesByCrop(user.uid, cropId),
      getHarvestsByCrop(user.uid, cropId),
      getSalesByCrop(user.uid, cropId),
    ]);
    setCrop(c);
    setExpenses(e);
    setHarvests(h);
    setSales(s);
    if (e && h && s) setMetrics(computeCropMetrics(e, h, s));
    setLoading(false);
  }, [user, cropId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleStatusChange(status: CropCycle["status"]) {
    if (!user || !crop) return;
    await updateCropStatus(user.uid, cropId, status);
    loadData();
  }

  if (loading) {
    return (
      <>
        <TopBar title="Crop" showBack />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      </>
    );
  }

  if (!crop || !metrics) {
    return (
      <>
        <TopBar title="Not Found" showBack />
        <div className="page-container empty-state">
          <p className="text-stone-500">Crop not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={crop.cropName} showBack />

      <div className="page-container">
        {/* Crop Header */}
        <div className="card mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sprout className="text-brand-500" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-stone-800">{crop.cropName}</h2>
              <p className="text-sm text-stone-400">
                {crop.fieldName} · Planted {formatDate(crop.plantingDate)}
              </p>
            </div>
          </div>

          {/* Status Selector */}
          <div className="flex gap-2">
            {(["planted", "harvested", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  crop.status === s
                    ? s === "planted"
                      ? "bg-blue-50 text-blue-700 border-2 border-blue-200"
                      : s === "harvested"
                      ? "bg-amber-50 text-amber-700 border-2 border-amber-200"
                      : "bg-stone-100 text-stone-600 border-2 border-stone-300"
                    : "bg-stone-50 text-stone-400 border-2 border-transparent hover:border-stone-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="stat-card">
            <Receipt size={18} className="mx-auto text-red-400 mb-1" />
            <p className="text-xs text-stone-400">Total Cost</p>
            <p className="text-base font-bold text-stone-700">
              {formatCurrency(metrics.totalExpenses)}
            </p>
          </div>
          <div className="stat-card">
            <Banknote size={18} className="mx-auto text-brand-500 mb-1" />
            <p className="text-xs text-stone-400">Revenue</p>
            <p className="text-base font-bold text-brand-600">
              {formatCurrency(metrics.totalRevenue)}
            </p>
          </div>
          <div className="stat-card">
            {metrics.profit >= 0 ? (
              <TrendingUp size={18} className="mx-auto text-brand-500 mb-1" />
            ) : (
              <TrendingDown size={18} className="mx-auto text-red-500 mb-1" />
            )}
            <p className="text-xs text-stone-400">Profit/Loss</p>
            <p className={`text-base font-bold ${metrics.profit >= 0 ? "text-brand-600" : "text-red-600"}`}>
              {metrics.profit >= 0 ? "+" : ""}
              {formatCurrency(metrics.profit)}
            </p>
          </div>
          <div className="stat-card">
            <Package size={18} className="mx-auto text-amber-500 mb-1" />
            <p className="text-xs text-stone-400">Stock Left</p>
            <p className="text-base font-bold text-stone-700">
              {metrics.remainingQty} {crop.unit}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-4">
          {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="card">
              <h3 className="font-semibold text-stone-700 mb-2">Summary</h3>
              <div className="space-y-2 text-sm">
                <Row label="Harvested" value={`${metrics.harvestedQty} ${crop.unit}`} />
                <Row label="Sold" value={`${metrics.soldQty} ${crop.unit}`} />
                <Row label="Remaining" value={`${metrics.remainingQty} ${crop.unit}`} />
                <Row label="Expenses" value={formatCurrency(metrics.totalExpenses)} />
                <Row label="Revenue" value={formatCurrency(metrics.totalRevenue)} />
                <div className="border-t border-stone-100 pt-2">
                  <Row
                    label="Profit/Loss"
                    value={`${metrics.profit >= 0 ? "+" : ""}${formatCurrency(metrics.profit)}`}
                    bold
                    color={metrics.profit >= 0 ? "text-brand-600" : "text-red-600"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-stone-500">{expenses.length} expense(s)</p>
              <button
                onClick={() => router.push(`/expenses/add?cropId=${cropId}&seasonId=${seasonId}`)}
                className="flex items-center gap-1 text-brand-600 font-semibold text-sm bg-brand-50 px-3 py-2 rounded-xl"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {expenses.length === 0 ? (
              <EmptyTab
                icon={<Receipt size={28} />}
                text="No expenses recorded"
                action={() => router.push(`/expenses/add?cropId=${cropId}&seasonId=${seasonId}`)}
              />
            ) : (
              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div key={exp.id} className="card flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[exp.category] || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-700 capitalize text-sm">{exp.category}</p>
                      <p className="text-xs text-stone-400">{formatDate(exp.date)}{exp.note ? ` · ${exp.note}` : ""}</p>
                    </div>
                    <p className="font-bold text-stone-800 text-sm">{formatCurrency(exp.amount)}</p>
                    <button
                      onClick={() => user && deleteExpense(user.uid, exp.id).then(loadData)}
                      className="icon-btn text-stone-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "harvests" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-stone-500">{harvests.length} harvest(s)</p>
              <button
                onClick={() => router.push(`/harvests/add?cropId=${cropId}&seasonId=${seasonId}`)}
                className="flex items-center gap-1 text-brand-600 font-semibold text-sm bg-brand-50 px-3 py-2 rounded-xl"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {harvests.length === 0 ? (
              <EmptyTab
                icon={<Wheat size={28} />}
                text="No harvests recorded"
                action={() => router.push(`/harvests/add?cropId=${cropId}&seasonId=${seasonId}`)}
              />
            ) : (
              <div className="space-y-2">
                {harvests.map((h) => (
                  <div key={h.id} className="card flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Wheat className="text-amber-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-700 text-sm">
                        {h.quantity} {h.unit}
                      </p>
                      <p className="text-xs text-stone-400">{formatDate(h.harvestDate)}{h.note ? ` · ${h.note}` : ""}</p>
                    </div>
                    <button
                      onClick={() => user && deleteHarvest(user.uid, h.id).then(loadData)}
                      className="icon-btn text-stone-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "sales" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-stone-500">{sales.length} sale(s)</p>
              <button
                onClick={() => router.push(`/sales/add?cropId=${cropId}&seasonId=${seasonId}`)}
                className="flex items-center gap-1 text-brand-600 font-semibold text-sm bg-brand-50 px-3 py-2 rounded-xl"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            {sales.length === 0 ? (
              <EmptyTab
                icon={<ShoppingCart size={28} />}
                text="No sales recorded"
                action={() => router.push(`/sales/add?cropId=${cropId}&seasonId=${seasonId}`)}
              />
            ) : (
              <div className="space-y-2">
                {sales.map((s) => (
                  <div key={s.id} className="card flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="text-brand-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-700 text-sm">
                        {s.quantitySold} {s.unit} @ {formatCurrency(s.pricePerUnit)}/{s.unit}
                      </p>
                      <p className="text-xs text-stone-400">
                        {formatDate(s.date)} · {s.buyerType}
                        {s.paymentStatus !== "paid" && (
                          <span className="ml-1 text-amber-600 font-medium">· {s.paymentStatus}</span>
                        )}
                      </p>
                    </div>
                    <p className="font-bold text-brand-600 text-sm">{formatCurrency(s.totalPrice)}</p>
                    <button
                      onClick={() => user && deleteSale(user.uid, s.id).then(loadData)}
                      className="icon-btn text-stone-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Row({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-stone-500">{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${color || "text-stone-700"}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyTab({
  icon,
  text,
  action,
}: {
  icon: React.ReactNode;
  text: string;
  action: () => void;
}) {
  return (
    <div className="empty-state py-10">
      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 mb-3">
        {icon}
      </div>
      <p className="text-stone-400 text-sm mb-3">{text}</p>
      <button onClick={action} className="btn-primary text-sm py-2.5 px-4">
        <Plus size={16} /> Add Record
      </button>
    </div>
  );
}
