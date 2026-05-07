"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFish, updateFish, uploadImage } from "@/lib/api";
import { FishPayload } from "@/types/fish";

type FishFormProps = {
  mode?: "create" | "edit";
  fishId?: number;
  initialData?: FishPayload;
  coverImageOverride?: string;
  onCoverImageChange?: (url: string) => void;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500";
const labelClass = "mb-2 block text-sm font-medium text-slate-700";
const sectionTitleClass = "text-lg font-semibold text-slate-900";
const textareaClass = `${inputClass} resize-y`;

const generalTextareas: Array<{
  key: "short_description" | "identify_text";
  label: string;
  rows?: number;
}> = [
  { key: "short_description", label: "Short Description", rows: 4 },
  { key: "identify_text", label: "How to Identify", rows: 4 },
];

const farmerFields: Array<{
  key: keyof NonNullable<FishPayload["farmer"]>;
  label: string;
  kind?: "input" | "textarea";
  rows?: number;
}> = [
  { key: "how_to_raise", label: "How to Raise", kind: "textarea", rows: 4 },
  { key: "pond_type", label: "Pond Type" },
  { key: "pond_size", label: "Pond Size" },
  { key: "population_per_pond", label: "Population per Pond" },
  { key: "water_temp", label: "Water Temperature" },
  { key: "ph", label: "pH" },
  { key: "water_prep", label: "Water Preparation", kind: "textarea", rows: 4 },
  { key: "source_type", label: "Source Type" },
  { key: "source_size", label: "Source Size" },
  { key: "system_type", label: "System Type" },
  { key: "compatible_species", label: "Compatible Species", kind: "textarea", rows: 3 },
  { key: "incompatible_species", label: "Incompatible Species", kind: "textarea", rows: 3 },
  { key: "growth_rate", label: "Growth Rate" },
  { key: "survival_rate", label: "Survival Rate" },
  { key: "common_diseases", label: "Common Diseases", kind: "textarea", rows: 4 },
  { key: "disease_prevention", label: "Disease Prevention", kind: "textarea", rows: 4 },
  { key: "recommended_food", label: "Recommended Food", kind: "textarea", rows: 4 },
  { key: "not_recommended_food", label: "Not Recommended Food", kind: "textarea", rows: 4 },
  { key: "feeding_amount", label: "Feeding Amount" },
  { key: "feeding_frequency", label: "Feeding Frequency" },
  { key: "notes", label: "Notes", kind: "textarea", rows: 4 },
];

const ornamentalFields: Array<{
  key: keyof NonNullable<FishPayload["ornamental"]>;
  label: string;
  kind?: "input" | "textarea";
  rows?: number;
}> = [
  { key: "environment", label: "Environment", kind: "textarea", rows: 4 },
  { key: "population", label: "Population" },
  { key: "water_temp", label: "Water Temperature" },
  { key: "ph", label: "pH" },
  { key: "preparation", label: "Preparation", kind: "textarea", rows: 4 },
  { key: "source_type", label: "Source Type" },
  { key: "source_size", label: "Source Size" },
  { key: "system_type", label: "System Type" },
  { key: "compatible_species", label: "Compatible Species", kind: "textarea", rows: 3 },
  { key: "incompatible_species", label: "Incompatible Species", kind: "textarea", rows: 3 },
  { key: "growth_rate", label: "Growth Rate" },
  { key: "survival_rate", label: "Survival Rate" },
  { key: "common_diseases", label: "Common Diseases", kind: "textarea", rows: 4 },
  { key: "disease_prevention", label: "Disease Prevention", kind: "textarea", rows: 4 },
  { key: "recommended_food", label: "Recommended Food", kind: "textarea", rows: 4 },
  { key: "not_recommended_food", label: "Not Recommended Food", kind: "textarea", rows: 4 },
  { key: "feeding_amount", label: "Feeding Amount" },
  { key: "feeding_frequency", label: "Feeding Frequency" },
  { key: "notes", label: "Notes", kind: "textarea", rows: 4 },
];

const emptyData: FishPayload = {
  general: {
    name: "",
    slug: "",
    short_description: "",
    type: "",
    category: "",
    habitat: "",
    origin: "",
    identify_text: "",
    average_lifespan: "",
    adult_size: "",
    cover_image_url: "",
    is_active: true,
  },
  farmer: {
    how_to_raise: "",
    pond_type: "",
    pond_size: "",
    population_per_pond: "",
    water_temp: "",
    ph: "",
    water_prep: "",
    source_type: "",
    source_size: "",
    system_type: "",
    compatible_species: "",
    incompatible_species: "",
    growth_rate: "",
    survival_rate: "",
    common_diseases: "",
    disease_prevention: "",
    recommended_food: "",
    not_recommended_food: "",
    feeding_amount: "",
    feeding_frequency: "",
    notes: "",
  },
  ornamental: {
    environment: "",
    population: "",
    water_temp: "",
    ph: "",
    preparation: "",
    source_type: "",
    source_size: "",
    system_type: "",
    compatible_species: "",
    incompatible_species: "",
    growth_rate: "",
    survival_rate: "",
    common_diseases: "",
    disease_prevention: "",
    recommended_food: "",
    not_recommended_food: "",
    feeding_frequency: "",
    feeding_amount: "",
    notes: "",
  },
};

export default function FishForm({
  mode = "create",
  fishId,
  initialData,
  coverImageOverride,
  onCoverImageChange,
}: FishFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FishPayload>(initialData || emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const coverImageUrl = coverImageOverride ?? form.general.cover_image_url ?? "";

  const updateGeneral = (
    key: keyof FishPayload["general"],
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      general: { ...prev.general, [key]: value },
    }));
  };

  const updateFarmer = (
    key: keyof NonNullable<FishPayload["farmer"]>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      farmer: { ...prev.farmer, [key]: value },
    }));
  };

  const updateOrnamental = (
    key: keyof NonNullable<FishPayload["ornamental"]>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      ornamental: { ...prev.ornamental, [key]: value },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError("");
    setSuccess("");

    try {
      setUploadingImage(true);
      const result = await uploadImage(selectedFile);

      setForm((prev) => ({
        ...prev,
        general: {
          ...prev.general,
          cover_image_url: result.public_url,
        },
      }));

      onCoverImageChange?.(result.public_url);
      setSuccess("Image uploaded successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const cleanData = (obj: any): any => {
      if (Array.isArray(obj)) return obj;
      if (obj === null || typeof obj !== "object") {
        return obj === "" ? null : obj;
      }
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value === "") {
          cleaned[key] = null;
        } else if (typeof value === "object" && value !== null) {
          cleaned[key] = cleanData(value);
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    };

    try {
      const payloadData = cleanData({
        ...form,
        general: {
          ...form.general,
          cover_image_url: coverImageUrl,
        },
      });

      // Name and slug must not be null as they are required fields.
      // (The HTML form validation handles this, but we reset here just in case)
      if (!payloadData.general.name) payloadData.general.name = "";
      if (!payloadData.general.slug) payloadData.general.slug = "";

      if (mode === "edit" && fishId) {
        await updateFish(fishId, payloadData);
        setSuccess("Fish updated successfully");
      } else {
        await createFish(payloadData);
        setSuccess("Fish created successfully");
      }

      setTimeout(() => {
        router.push("/admin/fish");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className={sectionTitleClass}>General Information</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.general.name}
              onChange={(e) => updateGeneral("name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              className={inputClass}
              value={form.general.slug}
              onChange={(e) => updateGeneral("slug", e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <input
              className={inputClass}
              value={form.general.type || ""}
              onChange={(e) => updateGeneral("type", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input
              className={inputClass}
              value={form.general.category || ""}
              onChange={(e) => updateGeneral("category", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Habitat</label>
            <input
              className={inputClass}
              value={form.general.habitat || ""}
              onChange={(e) => updateGeneral("habitat", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Origin</label>
            <input
              className={inputClass}
              value={form.general.origin || ""}
              onChange={(e) => updateGeneral("origin", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Average Lifespan</label>
            <input
              className={inputClass}
              value={form.general.average_lifespan || ""}
              onChange={(e) => updateGeneral("average_lifespan", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Adult Size</label>
            <input
              className={inputClass}
              value={form.general.adult_size || ""}
              onChange={(e) => updateGeneral("adult_size", e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Cover Image URL</label>
            <input
              className={inputClass}
              value={coverImageUrl}
              onChange={(e) => {
                updateGeneral("cover_image_url", e.target.value);
                onCoverImageChange?.(e.target.value);
              }}
              placeholder="https://..."
            />

            <div className="mt-3">
              <label className={labelClass}>Upload Cover Image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="block w-full text-sm text-slate-600"
              />
              <p className="mt-2 text-xs text-slate-500">Allowed: JPG, PNG, WEBP</p>
              {uploadingImage ? (
                <p className="mt-2 text-sm text-blue-600">Uploading image...</p>
              ) : null}
            </div>

            {coverImageUrl ? (
              <div className="mt-4">
                <img
                  src={coverImageUrl}
                  alt="Preview"
                  className="h-32 w-48 rounded-xl border border-slate-200 object-cover"
                />
              </div>
            ) : null}
          </div>

          {generalTextareas.map((field) => (
            <div key={field.key} className="md:col-span-2">
              <label className={labelClass}>{field.label}</label>
              <textarea
                className={textareaClass}
                rows={field.rows || 4}
                value={form.general[field.key] || ""}
                onChange={(e) => updateGeneral(field.key, e.target.value)}
              />
            </div>
          ))}
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.general.is_active}
              onChange={(e) => updateGeneral("is_active", e.target.checked)}
            />
            Active
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className={sectionTitleClass}>Farmer Information</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {farmerFields.map((field) => (
            <div
              key={field.key}
              className={field.kind === "textarea" ? "md:col-span-2" : undefined}
            >
              <label className={labelClass}>{field.label}</label>
              {field.kind === "textarea" ? (
                <textarea
                  className={textareaClass}
                  rows={field.rows || 4}
                  value={form.farmer?.[field.key] || ""}
                  onChange={(e) => updateFarmer(field.key, e.target.value)}
                />
              ) : (
                <input
                  className={inputClass}
                  value={form.farmer?.[field.key] || ""}
                  onChange={(e) => updateFarmer(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className={sectionTitleClass}>Ornamental Information</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ornamentalFields.map((field) => (
            <div
              key={field.key}
              className={field.kind === "textarea" ? "md:col-span-2" : undefined}
            >
              <label className={labelClass}>{field.label}</label>
              {field.kind === "textarea" ? (
                <textarea
                  className={textareaClass}
                  rows={field.rows || 4}
                  value={form.ornamental?.[field.key] || ""}
                  onChange={(e) => updateOrnamental(field.key, e.target.value)}
                />
              ) : (
                <input
                  className={inputClass}
                  value={form.ornamental?.[field.key] || ""}
                  onChange={(e) => updateOrnamental(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (mode === "edit" ? "Updating..." : "Saving...") : mode === "edit" ? "Update Fish" : "Save Fish"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/fish")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
