"use client";

import { useState } from "react";
import {
  addFishImage,
  deleteFishImage,
  setFishCover,
  uploadImage,
} from "@/lib/api";
import { FishImageRow } from "@/types/fish";

type FishGalleryManagerProps = {
  fishId: number;
  initialImages: FishImageRow[];
  onGalleryChange?: (payload: {
    images: FishImageRow[];
    coverImageUrl: string | null;
  }) => void;
};

export default function FishGalleryManager({
  fishId,
  initialImages,
  onGalleryChange,
}: FishGalleryManagerProps) {
  const [images, setImages] = useState<FishImageRow[]>(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [makeCover, setMakeCover] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emitChange = (nextImages: FishImageRow[]) => {
    const coverImage = nextImages.find((img) => img.is_cover) || null;
    onGalleryChange?.({
      images: nextImages,
      coverImageUrl: coverImage?.image_url || null,
    });
  };

  const handleUploadAndAttach = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const uploaded = await uploadImage(selectedFile);
      const result = await addFishImage(fishId, {
        image_url: uploaded.public_url,
        alt_text: altText,
        is_cover: makeCover,
      });

      const newImage = (result as { data: FishImageRow }).data;
      const nextImages = makeCover
        ? images.map((img) => ({ ...img, is_cover: false })).concat([{ ...newImage, is_cover: true }])
        : [...images, newImage];

      setImages(nextImages);
      emitChange(nextImages);
      setAltText("");
      setMakeCover(false);
      setSuccess("Image uploaded and added to gallery");
      e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = async (imageId: number) => {
    try {
      setError("");
      setSuccess("");
      await setFishCover(imageId);
      const nextImages = images.map((img) => ({
        ...img,
        is_cover: img.id === imageId,
      }));
      setImages(nextImages);
      emitChange(nextImages);
      setSuccess("Cover image updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Set cover failed");
    }
  };

  const handleDelete = async (imageId: number) => {
    const confirmed = window.confirm("Delete this image?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      const deletingCover = images.find((img) => img.id === imageId)?.is_cover;
      let nextImages = images.filter((img) => img.id !== imageId);
      await deleteFishImage(imageId);

      if (deletingCover && nextImages.length > 0) {
        nextImages = nextImages.map((img, index) => ({
          ...img,
          is_cover: index === 0,
        }));
      }

      setImages(nextImages);
      emitChange(nextImages);
      setSuccess("Image deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Image Gallery</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Alt Text
          </label>
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            placeholder="Fish side view"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={makeCover}
              onChange={(e) => setMakeCover(e.target.checked)}
            />
            Set uploaded image as cover
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleUploadAndAttach}
            className="block w-full text-sm text-slate-600"
          />
          {uploading ? (
            <p className="mt-2 text-sm text-blue-600">Uploading image...</p>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.length === 0 ? (
          <p className="text-sm text-slate-500">No gallery images yet.</p>
        ) : (
          images.map((img) => (
            <div key={img.id} className="rounded-2xl border border-slate-200 p-3">
              <img
                src={img.image_url}
                alt={img.alt_text || "Fish image"}
                className="h-40 w-full rounded-xl object-cover"
              />

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  {img.is_cover ? "Cover Image" : "Gallery Image"}
                </span>
                {img.is_cover ? (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                    Cover
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-sm text-slate-700">{img.alt_text || "-"}</p>

              <div className="mt-3 flex gap-2">
                {!img.is_cover ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(img.id)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  >
                    Set Cover
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
