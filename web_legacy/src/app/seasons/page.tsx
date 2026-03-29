"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getSeasons, createSeason, deleteSeason } from "@/lib/firestore";
import { TopBar } from "@/components/TopBar";
import { formatDate, todayISO } from "@/lib/utils";
import type { Season } from "@/types";
import {
  Plus,
  CalendarRange,
  ChevronRight,
  Trash2,
  Loader2,
  X,
  Leaf,
} from "lucide-react";

export default function SeasonsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (user) loadSeasons();
  }, [user]);

  async function loadSeasons() {
    if (!user) return;
    setLoading(true);
    const data = await getSeasons(user.uid);
    setSeasons(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    await createSeason(user.uid, {
      name: name.trim(),
      startDate,
      endDate: endDate || startDate,
      currency: "RWF",
    });
    setName("");
    setStartDate(todayISO());
    setEndDate("");
    setShowForm(false);
    setSaving(false);
    loadSeasons();
  }

  async function handleDelete(seasonId: string) {
    if (!user) return;
    if (!confirm("Delete this season and all its data?")) return;
    await deleteSeason(user.uid, seasonId);
    loadSeasons();
  }

  return (
    <>
      <TopBar
        title="Seasons"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm
                       bg-brand-50 px-3 py-2 rounded-xl hover:bg-brand-100 transition-colors"
          >
            <Plus size={18} />
            New
          </button>
        }
      />

      <div className="page-container">
        {/* Create Season Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-800">New Season</h2>
                <button onClick={() => setShowForm(false)} className="icon-btn">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Season Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 2026 Season A"
                    className="input-field"
                    required
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input-field"
                      min={startDate}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-2" disabled={saving}>
                  {saving ? <Loader2 size={20} className="animate-spin" /> : "Create Season"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Season List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={32} />
          </div>
        ) : seasons.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <CalendarRange className="text-brand-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-stone-700 mb-1">No seasons yet</h3>
            <p className="text-stone-400 text-sm mb-6 max-w-xs">
              Create your first growing season to start tracking crops and profits.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={18} />
              Create First Season
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="card-hover flex items-center gap-4 cursor-pointer"
                onClick={() => router.push(`/seasons/${season.id}`)}
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Leaf className="text-brand-500" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 truncate">
                    {season.name}
                  </h3>
                  <p className="text-sm text-stone-400">
                    {formatDate(season.startDate)}
                    {season.endDate && season.endDate !== season.startDate
                      ? ` — ${formatDate(season.endDate)}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(season.id);
                    }}
                    className="icon-btn text-stone-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-stone-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
