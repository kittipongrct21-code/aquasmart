"use client";

type DeleteFishModalProps = {
  open: boolean;
  fishName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteFishModal({
  open,
  fishName,
  loading = false,
  onClose,
  onConfirm,
}: DeleteFishModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-900">Delete Fish</h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">{fishName}</span>?
        </p>

        <p className="mt-2 text-sm text-red-600">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
