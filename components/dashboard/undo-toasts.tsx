"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { dismiss } from "@/store/undo-slice";
import { useExtension } from "@/features/extension/use-extension";

export function UndoToasts() {
  const pending = useAppSelector((s) => s.undo.pending);
  const dispatch = useAppDispatch();
  const ext = useExtension();
  const router = useRouter();
  const firing = useRef<Set<string>>(new Set());
  const [, setTick] = useState(0);

  // Re-render once per second so the countdown is visible.
  useEffect(() => {
    if (pending.length === 0) return;
    const i = window.setInterval(() => setTick((n) => n + 1), 250);
    return () => window.clearInterval(i);
  }, [pending.length]);

  // Fire the delete when each toast expires.
  useEffect(() => {
    const now = Date.now();
    for (const p of pending) {
      if (firing.current.has(p.id)) continue;
      if (p.expiresAt > now) continue;
      firing.current.add(p.id);
      (async () => {
        try {
          await ext.deleteArticleMany(p.newsletterUrl, p.postIds);
          await fetch("/api/posts/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              publicationId: p.publicationId,
              substackPostIds: p.postIds,
            }),
          });
          router.refresh();
        } catch {
          // swallow — UI will show stale row until next sync.
        } finally {
          dispatch(dismiss(p.id));
          firing.current.delete(p.id);
        }
      })();
    }
  });

  if (pending.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 flex flex-col items-center gap-2 pointer-events-none px-4">
      {pending.map((p) => {
        const remaining = Math.max(0, Math.ceil((p.expiresAt - Date.now()) / 1000));
        return (
          <div
            key={p.id}
            className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-bg-2 px-4 py-2.5 shadow-2xl"
          >
            <span className="text-sm">
              Moved <b>{p.postIds.length}</b> {p.postIds.length === 1 ? "post" : "posts"} to trash
            </span>
            <span className="font-mono text-[11px] text-muted">{remaining}s</span>
            <div className="w-px h-4 bg-border" />
            <button
              type="button"
              onClick={() => dispatch(dismiss(p.id))}
              className="text-sm text-accent hover:brightness-110"
            >
              Undo
            </button>
          </div>
        );
      })}
    </div>
  );
}
