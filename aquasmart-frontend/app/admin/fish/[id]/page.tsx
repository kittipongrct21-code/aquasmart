"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAdminFishById } from "@/lib/api";
import { FishDetailResponse } from "@/types/fish";

const textOrDash = (value?: string | null) => value || "-";

export default function AdminFishDetailPage() {
  const params = useParams();
  const fishId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<FishDetailResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getAdminFishById(fishId);
        setDetail(res as FishDetailResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load fish detail");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(fishId)) {
      load();
    }
  }, [fishId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm text-slate-500">
          Loading fish detail...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-sm text-slate-500">
          Fish not found.
        </div>
      </main>
    );
  }

  const { fish, farmer_info, ornamental_info, images = [] } = detail;
  const cover = fish.cover_image_url || images.find((img) => img.is_cover)?.image_url;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{fish.name}</h1>
              <p className="mt-2 text-sm text-slate-500">Admin fish preview page</p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/fish"
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                Back
              </Link>
              <Link
                href={`/admin/fish/${fish.id}/edit`}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Edit
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            {cover ? (
              <img
                src={cover}
                alt={fish.name}
                className="h-72 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                No cover image
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  fish.is_active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {fish.is_active ? "Active" : "Inactive"}
              </span>
              <span className="text-sm text-slate-500">Slug: {fish.slug}</span>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><p className="text-xs text-slate-500">Type</p><p className="mt-1 text-sm text-slate-900">{textOrDash(fish.type)}</p></div>
                <div><p className="text-xs text-slate-500">Category</p><p className="mt-1 text-sm text-slate-900">{textOrDash(fish.category)}</p></div>
                <div><p className="text-xs text-slate-500">Habitat</p><p className="mt-1 text-sm text-slate-900">{textOrDash(fish.habitat)}</p></div>
                <div><p className="text-xs text-slate-500">Average Lifespan</p><p className="mt-1 text-sm text-slate-900">{textOrDash(fish.average_lifespan)}</p></div>
                <div><p className="text-xs text-slate-500">Adult Size</p><p className="mt-1 text-sm text-slate-900">{textOrDash(fish.adult_size)}</p></div>
              </div>

              <div className="mt-5 grid gap-5">
                <div>
                  <p className="text-xs text-slate-500">Short Description</p>
                  <p className="mt-1 text-sm leading-6 text-slate-900">{textOrDash(fish.short_description)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">How to Identify</p>
                  <p className="mt-1 text-sm leading-6 text-slate-900">{textOrDash(fish.identify_text)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Farmer Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><p className="text-xs text-slate-500">How to Raise</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.how_to_raise)}</p></div>
                <div><p className="text-xs text-slate-500">Pond Type</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.pond_type)}</p></div>
                <div><p className="text-xs text-slate-500">Pond Size</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.pond_size)}</p></div>
                <div><p className="text-xs text-slate-500">Population per Pond</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.population_per_pond)}</p></div>
                <div><p className="text-xs text-slate-500">Water Temp</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.water_temp)}</p></div>
                <div><p className="text-xs text-slate-500">pH</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.ph)}</p></div>
                <div><p className="text-xs text-slate-500">Water Prep</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.water_prep)}</p></div>
                <div><p className="text-xs text-slate-500">Recommended Food</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.recommended_food)}</p></div>
                <div><p className="text-xs text-slate-500">Not Recommended Food</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.not_recommended_food)}</p></div>
                <div><p className="text-xs text-slate-500">Feeding Frequency</p><p className="mt-1 text-sm text-slate-900">{textOrDash(farmer_info?.feeding_frequency)}</p></div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Ornamental Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><p className="text-xs text-slate-500">Environment</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.environment)}</p></div>
                <div><p className="text-xs text-slate-500">Population</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.population)}</p></div>
                <div><p className="text-xs text-slate-500">Water Temp</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.water_temp)}</p></div>
                <div><p className="text-xs text-slate-500">pH</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.ph)}</p></div>
                <div><p className="text-xs text-slate-500">Preparation</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.preparation)}</p></div>
                <div><p className="text-xs text-slate-500">Recommended Food</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.recommended_food)}</p></div>
                <div><p className="text-xs text-slate-500">Feeding Frequency</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.feeding_frequency)}</p></div>
                <div><p className="text-xs text-slate-500">Feeding Amount</p><p className="mt-1 text-sm text-slate-900">{textOrDash(ornamental_info?.feeding_amount)}</p></div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.length === 0 ? (
                  <p className="text-sm text-slate-500">No images</p>
                ) : (
                  images.map((image) => (
                    <div key={image.id} className="rounded-2xl border border-slate-200 p-3">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || fish.name}
                        className="h-40 w-full rounded-xl object-cover"
                      />
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-sm text-slate-700">{image.alt_text || "-"}</p>
                        {image.is_cover ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            Cover
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
