"use client";

import AppShell from "@/components/public/AppShell";
import FishCard from "@/components/public/FishCard";

const categories = ["All", "Saltwater", "Freshwater", "Marine"];
const recentFishes = [
  { id: 1, name: "Bangus", category: "Marine", slug: "bangus", cover_image_url: "" },
  { id: 2, name: "Black Spotted Barb", category: "Freshwater", slug: "black-spotted-barb", cover_image_url: "" },
];

export default function HistoryPage() {
  return (
    <AppShell title="History" subtitle="Recent Identified">
      {/* Categories Horizontal Scroll */}
      <section className="-mx-5 px-5 md:mx-0 md:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              className={`whitespace-nowrap rounded-[20px] px-5 py-2 text-sm font-semibold transition-all ${
                idx === 0
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-500 shadow-sm border border-slate-50 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recentFishes.map((fish) => (
            <FishCard key={fish.id} fish={fish as any} href={`/fish/${fish.slug}`} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}