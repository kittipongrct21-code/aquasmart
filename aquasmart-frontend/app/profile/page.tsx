"use client";

import AppShell from "@/components/public/AppShell";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Public profile preview">
      <section className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl">
          ☺
        </div>
        <h2 className="mt-3 text-sm font-semibold text-slate-900">AquaSmart User</h2>
        <p className="mt-1 text-xs text-slate-500">No login required for this preview.</p>
        <button
          type="button"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white"
        >
          Change account (static)
        </button>
      </section>
    </AppShell>
  );
}
