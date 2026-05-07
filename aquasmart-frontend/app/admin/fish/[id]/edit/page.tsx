"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FishForm from "@/components/admin/FishForm";
import FishGalleryManager from "@/components/admin/FishGalleryManager";
import { getAdminFishById } from "@/lib/api";
import { FishDetailResponse, FishImageRow, FishPayload } from "@/types/fish";

export default function AdminEditFishPage() {
  const params = useParams();
  const fishId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialData, setInitialData] = useState<FishPayload | null>(null);
  const [resImages, setResImages] = useState<FishImageRow[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    const loadFish = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getAdminFishById(fishId);
        const data = res as FishDetailResponse;

        const mapped: FishPayload = {
          general: {
            name: data.fish.name || "",
            slug: data.fish.slug || "",
            short_description: data.fish.short_description || "",
            type: data.fish.type || "",
            category: data.fish.category || "",
            habitat: data.fish.habitat || "",
            origin: data.fish.origin || "",
            identify_text: data.fish.identify_text || "",
            average_lifespan: data.fish.average_lifespan || "",
            adult_size: data.fish.adult_size || "",
            cover_image_url: data.fish.cover_image_url || "",
            is_active: !!data.fish.is_active,
          },
          farmer: {
            how_to_raise: data.farmer_info?.how_to_raise || "",
            pond_type: data.farmer_info?.pond_type || "",
            pond_size: data.farmer_info?.pond_size || "",
            population_per_pond: data.farmer_info?.population_per_pond || "",
            water_temp: data.farmer_info?.water_temp || "",
            ph: data.farmer_info?.ph || "",
            water_prep: data.farmer_info?.water_prep || "",
            source_type: data.farmer_info?.source_type || "",
            source_size: data.farmer_info?.source_size || "",
            system_type: data.farmer_info?.system_type || "",
            compatible_species: data.farmer_info?.compatible_species || "",
            incompatible_species: data.farmer_info?.incompatible_species || "",
            growth_rate: data.farmer_info?.growth_rate || "",
            survival_rate: data.farmer_info?.survival_rate || "",
            common_diseases: data.farmer_info?.common_diseases || "",
            disease_prevention: data.farmer_info?.disease_prevention || "",
            recommended_food: data.farmer_info?.recommended_food || "",
            not_recommended_food: data.farmer_info?.not_recommended_food || "",
            feeding_amount: data.farmer_info?.feeding_amount || "",
            feeding_frequency: data.farmer_info?.feeding_frequency || "",
            notes: data.farmer_info?.notes || "",
          },
          ornamental: {
            environment: data.ornamental_info?.environment || "",
            population: data.ornamental_info?.population || "",
            water_temp: data.ornamental_info?.water_temp || "",
            ph: data.ornamental_info?.ph || "",
            preparation: data.ornamental_info?.preparation || "",
            source_type: data.ornamental_info?.source_type || "",
            source_size: data.ornamental_info?.source_size || "",
            system_type: data.ornamental_info?.system_type || "",
            compatible_species: data.ornamental_info?.compatible_species || "",
            incompatible_species: data.ornamental_info?.incompatible_species || "",
            growth_rate: data.ornamental_info?.growth_rate || "",
            survival_rate: data.ornamental_info?.survival_rate || "",
            common_diseases: data.ornamental_info?.common_diseases || "",
            disease_prevention: data.ornamental_info?.disease_prevention || "",
            recommended_food: data.ornamental_info?.recommended_food || "",
            not_recommended_food: data.ornamental_info?.not_recommended_food || "",
            feeding_frequency: data.ornamental_info?.feeding_frequency || "",
            feeding_amount: data.ornamental_info?.feeding_amount || "",
            notes: data.ornamental_info?.notes || "",
          },
        };

        setInitialData(mapped);
        setResImages(data.images || []);
        setCoverImageUrl(data.fish.cover_image_url || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load fish");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(fishId)) {
      loadFish();
    }
  }, [fishId]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Edit Fish</h1>
          <p className="mt-2 text-sm text-slate-500">
            Update fish information, cover image, and gallery.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm text-slate-500">
            Loading fish data...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>
        ) : initialData ? (
          <div className="space-y-8">
            <FishForm
              mode="edit"
              fishId={fishId}
              initialData={initialData}
              coverImageOverride={coverImageUrl}
              onCoverImageChange={setCoverImageUrl}
            />
            <FishGalleryManager
              fishId={fishId}
              initialImages={resImages}
              onGalleryChange={({ images, coverImageUrl }) => {
                setResImages(images);
                setCoverImageUrl(coverImageUrl || "");
              }}
            />
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-6 shadow-sm text-slate-500">
            Fish not found.
          </div>
        )}
      </div>
    </main>
  );
}
