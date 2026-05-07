"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/public/AppShell";
import FishCard from "@/components/public/FishCard";
import { getPublicFishList } from "@/lib/api";
import { FishSpeciesRow } from "@/types/fish";

const toSlug = (value: string) =>
  value.toLowerCase().trim().replace(/_/g, " ").replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-|-$/g, "");

export default function PublicFishCatalogPage() {
  const [rows, setRows] = useState<FishSpeciesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setQ(new URLSearchParams(window.location.search).get("q") || "");
  }, []);

  useEffect(() => {
    const loadFish = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicFishList(q.trim() || undefined);
        setRows(res.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => loadFish(), 400); // Debounce
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <AppShell title="Directory" subtitle="Search fish species">
      {/* Search Input */}
      <section className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">🔍</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name..."
          className="h-14 w-full rounded-[24px] border border-white bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </section>

      {/* Results */}
      <section>
        {error ? (
           <div className="rounded-[24px] bg-red-50 p-4 text-sm text-red-600">{error}</div>
        ) : loading ? (
           <div className="py-10 text-center text-sm text-slate-400">Loading data...</div>
        ) : rows.length === 0 ? (
           <div className="py-10 text-center text-slate-400">
             <span className="text-3xl block mb-2">🐠</span>
             <p className="text-sm font-medium">No fish found.</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((fish) => (
              <FishCard key={fish.id} fish={fish} href={`/fish/${fish.slug || toSlug(fish.name)}`} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}