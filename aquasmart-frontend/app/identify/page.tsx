"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/public/AppShell";
import { predictFish } from "@/lib/api";
import { FishDetailResponse, FishSpeciesRow, PredictFishResponse } from "@/types/fish";
import { InfoCard, InfoRow } from "@/components/public/InfoCard";

const toSlug = (value: string) => value.toLowerCase().trim().replace(/_/g, " ").replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-|-$/g, "");

// ... (เก็บฟังก์ชัน formatErrorMessage, toPercent, extractFishDetail แบบเดิมไว้ได้เลย ผมขอข้ามเพื่อความกระชับ) ...
function formatErrorMessage(err: unknown) { return err instanceof Error ? err.message : "Failed to identify fish."; }
function toPercent(percent?: number, conf?: number) { return percent ? percent.toFixed(2) : conf ? (conf * 100).toFixed(2) : null; }
function extractFishDetail(res: any) { return res.fish_detail?.fish ? res.fish_detail : res.fish ? { fish: res.fish, farmer_info: null, ornamental_info: null, images: [] } : null; }

export default function FishIdentifyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PredictFishResponse | null>(null);

  const confidence = useMemo(() => toPercent(result?.confidence_percent, result?.confidence), [result]);
  const fishDetail = useMemo(() => (result ? extractFishDetail(result) : null), [result]);
  const predictedClass = result?.predicted_class || fishDetail?.fish?.name || "Unknown";
  const matchedSlug = useMemo(() => fishDetail?.fish?.slug || (result?.predicted_class ? toSlug(result.predicted_class) : ""), [fishDetail, result]);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    setResult(null); setError("");
    if (!file) { setSelectedFile(null); setPreviewUrl(""); return; }
    setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!selectedFile) return setError("Please select an image.");
    try {
      setSubmitting(true); setError("");
      setResult(await predictFish(selectedFile));
    } catch (err) { setError(formatErrorMessage(err)); setResult(null); } 
    finally { setSubmitting(false); }
  };

  return (
    <AppShell title="Identify" subtitle="AI Prediction">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ฝั่งอัปโหลด */}
        <section className="rounded-[28px] border border-white bg-white p-4 shadow-sm">
          <div className="relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50 transition-colors focus-within:border-blue-400 hover:border-blue-400">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                <span className="text-3xl">📷</span>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider">Tap to upload</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
          </div>

          <button
            onClick={(e) => handleSubmit(e as any)}
            disabled={submitting || !selectedFile}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-[20px] bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-200 transition-transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Analyzing..." : "Identify Fish"}
          </button>
          {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
        </section>

        {/* ฝั่งผลลัพธ์ */}
        <section className="space-y-4">
          <InfoCard title="Result">
            {!result ? (
              <p className="text-sm text-slate-400 text-center py-4">Upload an image to see results.</p>
            ) : (
              <div className="space-y-3">
                <InfoRow label="Predicted" value={predictedClass} />
                <InfoRow label="Confidence" value={confidence ? `${confidence}%` : "N/A"} />
                {matchedSlug && (
                  <Link href={`/fish/${matchedSlug}`} className="mt-2 flex h-12 w-full items-center justify-center rounded-[16px] bg-slate-900 text-xs font-bold text-white shadow-sm transition-transform active:scale-95">
                    View Fish Details
                  </Link>
                )}
              </div>
            )}
          </InfoCard>
        </section>
      </div>
    </AppShell>
  );
}