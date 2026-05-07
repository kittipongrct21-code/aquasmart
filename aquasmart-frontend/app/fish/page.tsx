"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/public/AppShell";
import FishCard from "@/components/public/FishCard";
import { getPublicFishList } from "@/lib/api";
import { FishSpeciesRow } from "@/types/fish";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/_/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");

export default function PublicFishCatalogPage() {
  const [rows, setRows] = useState<FishSpeciesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const search = new URLSearchParams(window.location.search);
    const initialQuery = search.get("q") || "";
    setQ(initialQuery);
  }, []);

  useEffect(() => {
    const loadFish = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicFishList(q.trim() || undefined);
        setRows(res.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load fish catalog");
      } finally {
        setLoading(false);
      }
    };

    loadFish();
  }, [q, refreshKey]);

  const summaryText = useMemo(() => {
    if (loading) return "Loading catalog...";
    return `${rows.length} fish species found in our directory`;
  }, [loading, rows.length]);

  return (
    <AppShell title="Search Directory" subtitle="Fish Species Catalog">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, type, or origin..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="h-14 w-full sm:w-auto rounded-2xl bg-slate-900 px-8 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Refresh List
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-500">{summaryText}</p>
        </div>
      </section>

      <section className="mt-8">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        ) : null}
        
        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-sm animate-pulse">
            Loading fish data...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-sm">
            <span className="text-4xl block mb-4">🐠</span>
            <p className="text-lg font-medium text-slate-900">No fish found.</p>
            <p className="mt-1">Try adjusting your search keywords.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {rows.map((fish) => (
              <FishCard key={fish.id} fish={fish} href={`/fish/${fish.slug || toSlug(fish.name)}`} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
