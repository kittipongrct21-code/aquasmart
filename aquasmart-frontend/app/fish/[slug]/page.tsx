"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "@/components/public/AppShell";
import { InfoCard, InfoRow } from "@/components/public/InfoCard";
import { getPublicFishById, getPublicFishList } from "@/lib/api";
import { FishDetailResponse } from "@/types/fish";

type DetailTab = "general" | "farmer" | "ornamental";

const tabs: { key: DetailTab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "farmer", label: "Farmer" },
  { key: "ornamental", label: "Ornamental" },
];

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/_/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");

export default function PublicFishDetailBySlugPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<DetailTab>("general");
  const [detail, setDetail] = useState<FishDetailResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const numericId = Number(slug);
        if (!Number.isNaN(numericId)) {
          const byId = await getPublicFishById(numericId);
          setDetail(byId);
          return;
        }

        const listRes = await getPublicFishList();
        const match = (listRes.data || []).find((row) => toSlug(row.slug || row.name) === slug);
        if (!match) {
          setError("Fish not found.");
          setDetail(null);
          return;
        }

        const byId = await getPublicFishById(match.id);
        setDetail(byId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load fish detail");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const cover = useMemo(() => {
    if (!detail) return "";
    const { fish, images = [] } = detail;
    return fish.cover_image_url || images.find((img) => img.is_cover)?.image_url || "";
  }, [detail]);

  if (loading) {
    return (
      <AppShell title="Fish Detail" subtitle="Loading detail">
        <div className="rounded-2xl border border-slate-100 bg-white p-3 text-sm text-slate-500 shadow-sm">
          Loading fish detail...
        </div>
      </AppShell>
    );
  }

  if (error || !detail) {
    return (
      <AppShell title="Fish Detail" subtitle="Data not available">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 shadow-sm">
          {error || "Fish not found."}
        </div>
      </AppShell>
    );
  }

  const { fish, farmer_info, ornamental_info } = detail;

  return (
    <AppShell title={fish.name} subtitle={fish.short_description || "Not specified"}>
      <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        {cover ? (
          <img
            src={cover}
            alt={fish.name}
            className="h-48 w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
            No cover image
          </div>
        )}
        <div className="mt-3">
          <Link href="/fish" className="text-xs text-blue-600">
            ← Back to search
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex h-9 items-center justify-center rounded-xl px-2 text-xs font-medium ${
                tab === item.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {tab === "general" ? (
        <InfoCard title="General Information">
          <InfoRow label="Type" value={fish.type} />
          <InfoRow label="Category" value={fish.category} />
          <InfoRow label="Habitat" value={fish.habitat} />
          <InfoRow label="Origin" value={fish.origin} />
          <InfoRow label="How to Identify" value={fish.identify_text} />
          <InfoRow label="Average Lifespan" value={fish.average_lifespan} />
          <InfoRow label="Adult Size" value={fish.adult_size} />
        </InfoCard>
      ) : null}

      {tab === "farmer" ? (
        <InfoCard title="Farmer Information">
          <InfoRow label="How to Raise" value={farmer_info?.how_to_raise} />
          <InfoRow label="Pond Type" value={farmer_info?.pond_type} />
          <InfoRow label="Pond Size" value={farmer_info?.pond_size} />
          <InfoRow label="Population per Pond" value={farmer_info?.population_per_pond} />
          <InfoRow label="Water Temperature" value={farmer_info?.water_temp} />
          <InfoRow label="pH" value={farmer_info?.ph} />
          <InfoRow label="Water Preparation" value={farmer_info?.water_prep} />
          <InfoRow label="Source Type" value={farmer_info?.source_type} />
          <InfoRow label="Source Size" value={farmer_info?.source_size} />
          <InfoRow label="System Type" value={farmer_info?.system_type} />
          <InfoRow label="Compatible Species" value={farmer_info?.compatible_species} />
          <InfoRow label="Incompatible Species" value={farmer_info?.incompatible_species} />
          <InfoRow label="Growth Rate" value={farmer_info?.growth_rate} />
          <InfoRow label="Survival Rate" value={farmer_info?.survival_rate} />
          <InfoRow label="Common Diseases" value={farmer_info?.common_diseases} />
          <InfoRow label="Disease Prevention" value={farmer_info?.disease_prevention} />
          <InfoRow label="Recommended Food" value={farmer_info?.recommended_food} />
          <InfoRow label="Not Recommended Food" value={farmer_info?.not_recommended_food} />
          <InfoRow label="Feeding Amount" value={farmer_info?.feeding_amount} />
          <InfoRow label="Feeding Frequency" value={farmer_info?.feeding_frequency} />
          <InfoRow label="Notes" value={farmer_info?.notes} />
        </InfoCard>
      ) : null}

      {tab === "ornamental" ? (
        <InfoCard title="Ornamental Information">
          <InfoRow label="Environment" value={ornamental_info?.environment} />
          <InfoRow label="Population" value={ornamental_info?.population} />
          <InfoRow label="Water Temperature" value={ornamental_info?.water_temp} />
          <InfoRow label="pH" value={ornamental_info?.ph} />
          <InfoRow label="Preparation" value={ornamental_info?.preparation} />
          <InfoRow label="Source Type" value={ornamental_info?.source_type} />
          <InfoRow label="Source Size" value={ornamental_info?.source_size} />
          <InfoRow label="System Type" value={ornamental_info?.system_type} />
          <InfoRow label="Compatible Species" value={ornamental_info?.compatible_species} />
          <InfoRow label="Incompatible Species" value={ornamental_info?.incompatible_species} />
          <InfoRow label="Growth Rate" value={ornamental_info?.growth_rate} />
          <InfoRow label="Survival Rate" value={ornamental_info?.survival_rate} />
          <InfoRow label="Common Diseases" value={ornamental_info?.common_diseases} />
          <InfoRow label="Disease Prevention" value={ornamental_info?.disease_prevention} />
          <InfoRow label="Recommended Food" value={ornamental_info?.recommended_food} />
          <InfoRow label="Not Recommended Food" value={ornamental_info?.not_recommended_food} />
          <InfoRow label="Feeding Amount" value={ornamental_info?.feeding_amount} />
          <InfoRow label="Feeding Frequency" value={ornamental_info?.feeding_frequency} />
          <InfoRow label="Notes" value={ornamental_info?.notes} />
        </InfoCard>
      ) : null}
    </AppShell>
  );
}
