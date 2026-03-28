"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getSeasons,
  getCropsBySeason,
  getExpensesBySeason,
  getHarvestsBySeason,
  getSalesBySeason,
} from "@/lib/firestore";
import { computeSeasonMetrics } from "@/lib/computations";
import { TopBar } from "@/components/TopBar";
import { formatCurrency } from "@/lib/utils";
import type { Season, SeasonMetrics } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Sprout,
  Receipt,
  Banknote,
  Award,
  Loader2,
  ChevronDown,
  CalendarRange,
  BarChart3,
  PieChart,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  seed: "#22c55e",
  fertilizer: "#8b5cf6",
  pesticide: "#f97316",
  labor: "#3b82f6",
  transport: "#ef4444",
  equipment: "#6366f1",
  irrigation: "#06b6d4",
  other: "#a3a3a3",
};

const CATEGORY_LABELS: Record<string, string> = {
  seed: "🌱 Seed",
  fertilizer: "🧪 Fertilizer",
  pesticide: "🛡️ Pesticide",
  labor: "👷 Labor",
  transport: "🚛 Transport",
  equipment: "🔧 Equipment",
  irrigation: "💧 Irrigation",
  other: "📦 Other",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [metrics, setMetrics] = useState<SeasonMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (user) loadSeasons();
  }, [user]);

  useEffect(() => {
    if (user && selectedSeason) loadMetrics();
  }, [user, selectedSeason]);

  async function loadSeasons() {
    if (!user) return;
    const data = await getSeasons(user.uid);
    setSeasons(data);
    if (data.length > 0) {
      setSelectedSeason(data[0].id);
    } else {
      setLoading(false);
    }
  }

  async function loadMetrics() {
    if (!user || !selectedSeason) return;
    setLoading(true);
    const [crops, expenses, harvests, sales] = await Promise.all([
      getCropsBySeason(user.uid, selectedSeason),
      getExpensesBySeason(user.uid, selectedSeason),
      getHarvestsBySeason(user.uid, selectedSeason),
      getSalesBySeason(user.uid, selectedSeason),
    ]);
    const m = computeSeasonMetrics(crops, expenses, harvests, sales);
    setMetrics(m);
    setLoading(false);
  }

  const currentSeason = seasons.find((s) => s.id === selectedSeason);

  return (
    <>
      <TopBar
        title="Dashboard"
        action={
          seasons.length > 0 ? (
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1 text-sm font-medium text-brand-600 bg-brand-50 px-3 py-2 rounded-xl"
            >
              <CalendarRange size={15} />
              {currentSeason?.name || "Select"}
              <ChevronDown size={14} />
            </button>
          ) : null
        }
      />

      <div className="page-container">
        {/* Season Picker Dropdown */}
        {showPicker && (
          <div className="mb-4 card p-2 space-y-1">
            {seasons.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSeason(s.id);
                  setShowPicker(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  s.id === selectedSeason
                    ? "bg-brand-50 text-brand-700"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : seasons.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mb-4">
              <BarChart3 className="text-brand-400" size={36} />
            </div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">
              Welcome to FarmTrack!
            </h3>
            <p className="text-stone-400 text-sm mb-6 max-w-xs leading-relaxed">
              Create your first season to start tracking crops, expenses, and profits.
            </p>
            <button
              onClick={() => router.push("/seasons")}
              className="btn-primary"
            >
              <CalendarRange size={18} />
              Create a Season
            </button>
          </div>
        ) : !metrics ? null : (
          <>
            {/* Main Profit/Loss Card */}
            <div
              className={`rounded-2xl p-5 mb-4 ${
                metrics.totalProfit >= 0
                  ? "bg-gradient-to-br from-brand-500 to-brand-700"
                  : "bg-gradient-to-br from-red-500 to-red-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {metrics.totalProfit >= 0 ? (
                  <TrendingUp className="text-white/80" size={20} />
                ) : (
                  <TrendingDown className="text-white/80" size={20} />
                )}
                <span className="text-white/80 text-sm font-medium">
                  Season {metrics.totalProfit >= 0 ? "Profit" : "Loss"}
                </span>
              </div>
              <p className="text-3xl font-extrabold text-white mb-4">
                {metrics.totalProfit >= 0 ? "+" : ""}
                {formatCurrency(metrics.totalProfit)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/70 text-xs font-medium">Total Expenses</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(metrics.totalExpenses)}
                  </p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-white/70 text-xs font-medium">Total Revenue</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(metrics.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="stat-card">
                <Sprout size={18} className="mx-auto text-brand-500 mb-1" />
                <p className="text-xs text-stone-400">Crops</p>
                <p className="text-lg font-bold text-stone-700">{metrics.cropCount}</p>
              </div>
              <div className="stat-card">
                <Award size={18} className="mx-auto text-amber-500 mb-1" />
                <p className="text-xs text-stone-400">Top Crop</p>
                <p className="text-sm font-bold text-stone-700 truncate">
                  {metrics.topCrop || "—"}
                </p>
              </div>
              <div className="stat-card">
                <Receipt size={18} className="mx-auto text-red-400 mb-1" />
                <p className="text-xs text-stone-400">Top Cost</p>
                <p className="text-sm font-bold text-stone-700 capitalize truncate">
                  {metrics.biggestCostCategory || "—"}
                </p>
              </div>
            </div>

            {/* Expense Breakdown */}
            {Object.keys(metrics.categoryBreakdown).length > 0 && (
              <div className="card mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart size={18} className="text-stone-400" />
                  <h3 className="font-bold text-stone-700">Expense Breakdown</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(metrics.categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amount]) => {
                      const pct =
                        metrics.totalExpenses > 0
                          ? (amount / metrics.totalExpenses) * 100
                          : 0;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-stone-600">
                              {CATEGORY_LABELS[cat] || cat}
                            </span>
                            <span className="text-sm font-bold text-stone-700">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: CATEGORY_COLORS[cat] || "#a3a3a3",
                              }}
                            />
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">{pct.toFixed(0)}%</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Crop Profit/Loss Comparison */}
            {Object.keys(metrics.cropMetrics).length > 0 && (
              <div className="card mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={18} className="text-stone-400" />
                  <h3 className="font-bold text-stone-700">Crop Performance</h3>
                </div>
                <div className="space-y-3">
                  {Object.values(metrics.cropMetrics)
                    .sort((a, b) => b.profit - a.profit)
                    .map((cm) => {
                      const maxVal = Math.max(
                        ...Object.values(metrics.cropMetrics).map((c) =>
                          Math.max(c.totalExpenses, c.totalRevenue, 1)
                        )
                      );
                      const expPct = (cm.totalExpenses / maxVal) * 100;
                      const revPct = (cm.totalRevenue / maxVal) * 100;

                      return (
                        <div key={cm.cropName} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-stone-700">
                              {cm.cropName}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                cm.profit >= 0 ? "text-brand-600" : "text-red-600"
                              }`}
                            >
                              {cm.profit >= 0 ? "+" : ""}
                              {formatCurrency(cm.profit)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400 w-14">Cost</span>
                              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-red-400 transition-all duration-500"
                                  style={{ width: `${expPct}%` }}
                                />
                              </div>
                              <span className="text-xs text-stone-500 w-20 text-right">
                                {formatCurrency(cm.totalExpenses)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400 w-14">Revenue</span>
                              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                                  style={{ width: `${revPct}%` }}
                                />
                              </div>
                              <span className="text-xs text-stone-500 w-20 text-right">
                                {formatCurrency(cm.totalRevenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Revenue vs Expenses Simple Bar Chart */}
            {metrics.totalExpenses > 0 || metrics.totalRevenue > 0 ? (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote size={18} className="text-stone-400" />
                  <h3 className="font-bold text-stone-700">Season Overview</h3>
                </div>
                <div className="flex items-end justify-center gap-8 h-40">
                  <BarItem
                    label="Expenses"
                    value={metrics.totalExpenses}
                    maxVal={Math.max(metrics.totalExpenses, metrics.totalRevenue, 1)}
                    color="bg-red-400"
                  />
                  <BarItem
                    label="Revenue"
                    value={metrics.totalRevenue}
                    maxVal={Math.max(metrics.totalExpenses, metrics.totalRevenue, 1)}
                    color="bg-brand-500"
                  />
                  <BarItem
                    label={metrics.totalProfit >= 0 ? "Profit" : "Loss"}
                    value={Math.abs(metrics.totalProfit)}
                    maxVal={Math.max(metrics.totalExpenses, metrics.totalRevenue, 1)}
                    color={metrics.totalProfit >= 0 ? "bg-brand-600" : "bg-red-600"}
                  />
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function BarItem({
  label,
  value,
  maxVal,
  color,
}: {
  label: string;
  value: number;
  maxVal: number;
  color: string;
}) {
  const heightPct = maxVal > 0 ? Math.max((value / maxVal) * 100, 4) : 4;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-xs font-bold text-stone-600">
        {value.toLocaleString()}
      </span>
      <div className="w-full max-w-[48px] bg-stone-100 rounded-t-lg h-28 relative overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ${color}`}
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <span className="text-xs text-stone-500 font-medium">{label}</span>
    </div>
  );
}
