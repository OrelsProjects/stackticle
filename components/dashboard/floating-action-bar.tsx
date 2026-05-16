"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/store";
import { clear as clearSelection } from "@/store/selection-slice";
import { enqueue as enqueueUndo } from "@/store/undo-slice";
import { postsToCsv, downloadCsv } from "@/features/export/csv";
import type { PostRow } from "./posts-table";
import type { PublicationLite } from "./posts-view";
import { Button } from "@/components/ui/button";

const UNDO_MS = 5_000;

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
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 480, damping: 36 }}
            className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-border bg-background/95 backdrop-blur px-2 py-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6),0_0_0_1px_color-mix(in_oklch,var(--primary)_20%,transparent)]"
          >
            <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono text-xs">
              {count} selected
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* <BarBtn label="Tag" disabled title="Coming soon — not in extension API" /> */}
            <BarBtn label="Export CSV" onClick={onExportCsv} />
            {/* <BarBtn label="Move" disabled title="Coming soon — not in extension API" /> */}
            <div className="w-px h-5 bg-border mx-1" />
            <BarBtn label="Delete" onClick={onDelete} danger />
          </motion.div>
        )}
      </AnimatePresence>
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
    <Button
      clean
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        "rounded-lg px-3 py-1.5 " +
        (disabled
          ? "text-muted-foreground cursor-not-allowed"
          : danger
            ? "text-destruction hover:bg-destruction/10"
            : "text-muted-foreground hover:text-primary hover:bg-card")
      }
    >
      {label}
    </Button>
  );
}
