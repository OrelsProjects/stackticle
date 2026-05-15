"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { clear as clearSelection } from "@/store/selection-slice";
import { enqueue as enqueueUndo } from "@/store/undo-slice";
import { postsToCsv, downloadCsv } from "@/features/export/csv";
import type { PostRow } from "./posts-table";
import type { PublicationLite } from "./posts-view";

const UNDO_MS = 10_000;

export function FloatingActionBar({
  publication,
  selectedIds,
  visiblePosts,
}: {
  publication: PublicationLite;
  selectedIds: number[];
  visiblePosts: PostRow[];
}) {
  const dispatch = useAppDispatch();
  const count = selectedIds.length;

  // Esc to clear selection.
  useEffect(() => {
    if (count === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch(clearSelection());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count, dispatch]);

  if (count === 0) return null;

  function onDelete() {
    const expiresAt = Date.now() + UNDO_MS;
    dispatch(
      enqueueUndo({
        id: crypto.randomUUID(),
        publicationId: publication.id,
        newsletterUrl: publication.baseUrl,
        postIds: [...selectedIds],
        expiresAt,
      }),
    );
    dispatch(clearSelection());
  }

  function onExportCsv() {
    const selectedSet = new Set(selectedIds);
    const rows = visiblePosts.filter((p) => selectedSet.has(p.substackId));
    downloadCsv(`${publication.subdomain}-selection.csv`, postsToCsv(rows));
  }

  return (
    <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-border bg-bg-2/95 backdrop-blur px-2 py-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6),0_0_0_1px_color-mix(in_oklch,var(--accent)_20%,transparent)]">
        <div className="px-3 py-1 rounded-lg bg-accent/10 text-accent font-mono text-xs">
          {count} selected
        </div>
        <div className="w-px h-5 bg-border mx-1" />
        <BarBtn label="Tag" disabled title="Coming soon — not in extension API" />
        <BarBtn label="Export CSV" onClick={onExportCsv} />
        <BarBtn label="Move" disabled title="Coming soon — not in extension API" />
        <div className="w-px h-5 bg-border mx-1" />
        <BarBtn label="Delete" onClick={onDelete} danger />
      </div>
    </div>
  );
}

function BarBtn({
  label,
  onClick,
  disabled,
  danger,
  title,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        "rounded-lg px-3 py-1.5 text-sm transition " +
        (disabled
          ? "text-muted-2 cursor-not-allowed"
          : danger
            ? "text-danger hover:bg-danger/10"
            : "text-text-2 hover:text-text hover:bg-surface-2")
      }
    >
      {label}
    </button>
  );
}
