const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}

export async function uploadImage(file: File): Promise<{
  message: string;
  bucket: string;
  path: string;
  public_url: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/admin/upload-image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }

  return res.json();
}

export async function getPublicFishList(q?: string) {
  const search = q ? `?q=${encodeURIComponent(q)}` : "";
  return apiFetch<{ data: import("@/types/fish").FishSpeciesRow[] }>(
    `/fish${search}`
  );
}

export async function getPublicFishById(fishId: number) {
  return apiFetch<import("@/types/fish").FishDetailResponse>(`/fish/${fishId}`);
}

export async function predictFish(
  file: File
): Promise<import("@/types/fish").PredictFishResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Fish prediction failed");
  }

  return res.json();
}

export async function getAdminFishList(params?: {
  q?: string;
  status?: string;
  category?: string;
  fish_type?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.q) searchParams.set("q", params.q);
  if (params?.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params?.category) searchParams.set("category", params.category);
  if (params?.fish_type) searchParams.set("fish_type", params.fish_type);

  const query = searchParams.toString();
  return apiFetch<{ data: import("@/types/fish").FishSpeciesRow[] }>(
    `/admin/fish${query ? `?${query}` : ""}`
  );
}

export async function getAdminFishById(fishId: number) {
  return apiFetch<import("@/types/fish").FishDetailResponse>(
    `/admin/fish/${fishId}`
  );
}

export async function createFish(payload: import("@/types/fish").FishPayload) {
  return apiFetch(`/admin/fish`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateFish(
  fishId: number,
  payload: import("@/types/fish").FishPayload
) {
  return apiFetch(`/admin/fish/${fishId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleFishStatus(fishId: number) {
  return apiFetch<{ message: string; data: import("@/types/fish").FishSpeciesRow }>(
    `/admin/fish/${fishId}/status`,
    {
      method: "PATCH",
    }
  );
}

export async function deleteFish(fishId: number) {
  return apiFetch<{ message: string }>(`/admin/fish/${fishId}`, {
    method: "DELETE",
  });
}

export async function addFishImage(
  fishId: number,
  payload: {
    image_url: string;
    alt_text?: string;
    is_cover?: boolean;
  }
) {
  return apiFetch(`/admin/fish/${fishId}/images`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getFishImages(fishId: number) {
  return apiFetch<{ data: import("@/types/fish").FishImageRow[] }>(
    `/admin/fish/${fishId}/images`
  );
}

export async function setFishCover(imageId: number) {
  return apiFetch(`/admin/fish/images/${imageId}/cover`, {
    method: "PUT",
  });
}

export async function deleteFishImage(imageId: number) {
  return apiFetch(`/admin/fish/images/${imageId}`, {
    method: "DELETE",
  });
}

export { API_BASE_URL };
