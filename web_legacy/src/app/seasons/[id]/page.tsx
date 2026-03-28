"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getSeason,
  getCropsBySeason,
  createCropCycle,
  deleteCrop,
  getExpensesBySeason,
  getHarvestsBySeason,
  getSalesBySeason,
} from "@/lib/firestore";
import { computeCropMetrics } from "@/lib/computations";
import { TopBar } from "@/components/TopBar";
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";
import type { Season, CropCycle, Expense, Harvest, Sale } from "@/types";
import {
  Plus,
  Sprout,
  ChevronRight,
  Trash2,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

const STATUS_BADGES: Record<string, string> = {
  planted: "badge-planted",
  harvested: "badge-harvested",
  closed: "badge-closed",
};

export default function SeasonDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const seasonId = params.id as string;

  const [season, setSeason] = useState<Season | null>(null);
  const [crops, setCrops] = useState<CropCycle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [cropName, setCropName] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [plantingDate, setPlantingDate] = useState(todayISO());
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("");
  const [unit, setUnit] = useState("kg");

  useEffect(() => {
    if (user) loadData();
  }, [user, seasonId]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    const [s, c, e, h, sa] = await Promise.all([
      getSeason(user.uid, seasonId),
      getCropsBySeason(user.uid, seasonId),
      getExpensesBySeason(user.uid, seasonId),
      getHarvestsBySeason(user.uid, seasonId),
      getSalesBySeason(user.uid, seasonId),
    ]);
    setSeason(s);
    setCrops(c);
    setExpenses(e);
    setHarvests(h);
    setSales(sa);
    setLoading(false);
  }

  async function handleCreateCrop(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !cropName.trim()) return;
    setSaving(true);
    await createCropCycle(user.uid, {
      seasonId,
      cropName: cropName.trim(),
      fieldName: fieldName.trim() || "Main Field",
      plantingDate,
      expectedHarvestDate: expectedHarvestDate || plantingDate,
      unit,
      status: "planted",
    });
    setCropName("");
    setFieldName("");
    setPlantingDate(todayISO());
    setExpectedHarvestDate("");
    setShowForm(false);
    setSaving(false);
    loadData();
  }

  async function handleDeleteCrop(cropId: string) {
    if (!user) return;
    if (!confirm("Delete this crop and all its records?")) return;
    await deleteCrop(user.uid, cropId);
    loadData();
  }

  function getCropMetrics(cropId: string) {
    const cropExpenses = expenses.filter((e) => e.cropCycleId === cropId);
    const cropHarvests = harvests.filter((h) => h.cropCycleId === cropId);
    const cropSales = sales.filter((s) => s.cropCycleId === cropId);
    return computeCropMetrics(cropExpenses, cropHarvests, cropSales);
  }

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRev = sales.reduce((s, e) => s + e.totalPrice, 0);
  const totalProfit = totalRev - totalExp;

  if (loading) {
    return (
      <>
        <TopBar title="Season" showBack />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={32} />
        </div>
      </>
    );
  }

  if (!season) {
    return (
      <>
        <TopBar title="Not Found" showBack />
        <div className="page-container empty-state">
          <p className="text-stone-500">Season not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title={season.name}
        showBack
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm
                       bg-brand-50 px-3 py-2 rounded-xl hover:bg-brand-100 transition-colors"
          >
            <Plus size={18} />
            Add Crop
          </button>
        }
      />

      <div className="page-container">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stat-card">
            <DollarSign size={18} className="mx-auto text-stone-400 mb-1" />
            <p className="text-xs text-stone-400 font-medium">Expenses</p>
            <p className="text-sm font-bold text-stone-700">{formatCurrency(totalExp)}</p>
          </div>
          <div className="stat-card">
            <TrendingUp size={18} className="mx-auto text-brand-500 mb-1" />
            <p className="text-xs text-stone-400 font-medium">Revenue</p>
            <p className="text-sm font-bold text-brand-600">{formatCurrency(totalRev)}</p>
          </div>
          <div className="stat-card">
            {totalProfit >= 0 ? (
              <TrendingUp size={18} className="mx-auto text-brand-500 mb-1" />
            ) : (
              <TrendingDown size={18} className="mx-auto text-red-500 mb-1" />
            )}
            <p className="text-xs text-stone-400 font-medium">Profit</p>
            <p className={`text-sm font-bold ${totalProfit >= 0 ? "text-brand-600" : "text-red-600"}`}>
              {formatCurrency(totalProfit)}
            </p>
          </div>
        </div>

        {/* Create Crop Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">Add Crop</h2>
                <button onClick={() => setShowForm(false)} className="icon-btn">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCrop} className="space-y-4">
                <div>
                  <label className="label">Crop Name</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Maize, Beans, Rice"
                    className="input-field"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Field / Location</label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="e.g. Field 1, Hillside plot"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Planting Date</label>
                    <input
                      type="date"
                      value={plantingDate}
                      onChange={(e) => setPlantingDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Expected Harvest</label>
                    <input
                      type="date"
                      value={expectedHarvestDate}
                      onChange={(e) => setExpectedHarvestDate(e.target.value)}
                      className="input-field"
                      min={plantingDate}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Unit of Measure</label>
                  <div className="flex gap-2">
                    {["kg", "bags", "tons", "bundles"].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={unit === u ? "chip-active" : "chip-inactive"}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-2" disabled={saving}>
                  {saving ? <Loader2 size={20} className="animate-spin" /> : "Add Crop"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Crop List */}
        <h2 className="section-title">
          Crops ({crops.length})
        </h2>

        {crops.length === 0 ? (
          <div className="empty-state">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-3">
              <Sprout className="text-brand-400" size={28} />
            </div>
            <h3 className="font-semibold text-stone-600 mb-1">No crops yet</h3>
            <p className="text-stone-400 text-sm mb-4">Add your first crop to this season</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2.5 px-4">
              <Plus size={16} />
              Add Crop
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {crops.map((crop) => {
              const m = getCropMetrics(crop.id);
              return (
                <div
                  key={crop.id}
                  className="card-hover cursor-pointer"
                  onClick={() => router.push(`/crops/${crop.id}?seasonId=${seasonId}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sprout className="text-brand-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-stone-800 truncate">
                          {crop.cropName}
                        </h3>
                        <span className={STATUS_BADGES[crop.status]}>
                          {crop.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mb-2">
                        {crop.fieldName} · Planted {formatDate(crop.plantingDate)}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-stone-500">
                          Cost: <b className="text-stone-700">{formatCurrency(m.totalExpenses)}</b>
                        </span>
                        <span className="text-stone-500">
                          Revenue: <b className="text-brand-600">{formatCurrency(m.totalRevenue)}</b>
                        </span>
                        <span className={m.profit >= 0 ? "text-brand-600 font-bold" : "text-red-600 font-bold"}>
                          {m.profit >= 0 ? "+" : ""}
                          {formatCurrency(m.profit)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCrop(crop.id);
                        }}
                        className="icon-btn text-stone-300 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={18} className="text-stone-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
