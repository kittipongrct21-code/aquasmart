"use client";

import { ReactNode } from "react";

export function textOrNotSpecified(value?: string | null) {
  return value || "Not specified";
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 hover:bg-slate-100/50 transition-colors">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1 sm:mb-0 w-1/3">{label}</p>
      <p className="text-base text-slate-900 font-medium sm:w-2/3 sm:text-right">{textOrNotSpecified(value)}</p>
    </div>
  );
}
