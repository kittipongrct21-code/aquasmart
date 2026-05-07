"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/public/AppShell";
import { getPublicFishList } from "@/lib/api";
import { FishSpeciesRow } from "@/types/fish";

const fallbackTopFish = ["Tilapia", "Snakehead", "Gourami", "Goldfish", "Catfish"];

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/_/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");

export default function HomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<FishSpeciesRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getPublicFishList();
        setRows(res.data || []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const topRows = useMemo(() => rows.slice(0, 6), [rows]);

  const submitSearch: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    router.push(`/fish${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <AppShell title="AquaSmart ML" subtitle="Fish search engine">
      {/* Search Section */}
      <section className="space-y-4">
        <div className="md:hidden">
          <h2 className="text-2xl font-extrabold text-slate-900">Explore fish species</h2>
          <p className="mt-1 text-sm text-slate-500">Search by name or identify with AI.</p>
        </div>
        
        <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fish name..."
            className="h-14 w-full flex-1 rounded-[24px] border border-white bg-white px-5 text-sm text-slate-900 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/identify")}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[24px] bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition-transform active:scale-95 sm:flex-none"
            >
              📷 <span className="sm:hidden lg:inline">Identify</span>
            </button>
            <button
              type="submit"
              className="flex h-14 flex-1 items-center justify-center rounded-[24px] bg-blue-600 px-8 text-sm font-bold text-white shadow-md shadow-blue-200 transition-transform active:scale-95 sm:flex-none"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Top Searched Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900">Top Searched</h3>
          <Link href="/fish" className="text-xs font-bold text-blue-600">See all</Link>
        </div>

        {loading ? (
          <div className="rounded-[24px] bg-white p-8 text-center text-sm text-slate-400 shadow-sm animate-pulse">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(topRows.length > 0 ? topRows : fallbackTopFish.map((name) => ({ id: name, name, slug: toSlug(name), category: "General" as const }))).map((fish) => (
              <Link
                key={fish.id}
                href={`/fish/${fish.slug || toSlug(fish.name)}`}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-white bg-white p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex aspect-square w-full items-center justify-center rounded-[18px] bg-slate-50 text-3xl transition-colors group-hover:bg-blue-50">
                  🐟
                </div>
                <div className="mt-3 px-1">
                  <p className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600">{fish.name}</p>
                  <span className="mt-1 inline-flex rounded-lg bg-[#F4FBFF] px-2 py-1 text-[10px] font-bold text-blue-600">
                    {fish.category || "General"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}