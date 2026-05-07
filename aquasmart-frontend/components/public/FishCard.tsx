"use client";

import Link from "next/link";
import { FishSpeciesRow } from "@/types/fish";

type FishCardProps = {
  fish: FishSpeciesRow;
  href: string;
};

export default function FishCard({ fish, href }: FishCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[24px] bg-white p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      {/* รูปภาพปลา (ด้านบน) */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100">
        {fish.cover_image_url ? (
          <img 
            src={fish.cover_image_url} 
            alt={fish.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
            No Image
          </div>
        )}
        
        {/* ป้าย Tag เล็กๆ ทับบนรูปภาพ (ถ้าอยากให้เหมือนเป๊ะ) หรือจะไว้ด้านล่างก็ได้ */}
      </div>

      {/* รายละเอียด (ด้านล่าง) */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <h3 className="line-clamp-1 text-sm font-bold text-slate-900 group-hover:text-blue-600">
          {fish.name}
        </h3>
        
        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center rounded-lg bg-[#F4FBFF] px-2.5 py-1 text-[10px] font-bold text-blue-600">
            {fish.category || "General"}
          </span>
        </div>
      </div>
    </Link>
  );
}