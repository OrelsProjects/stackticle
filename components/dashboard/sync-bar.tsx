"use client";

import { useEffect, useState } from "react";
import { useSync } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";
import type { PublicationLite } from "./posts-view";

export function SyncBar({ publication }: { publication: PublicationLite }) {
  const sync = useSync();
  const syncState = useAppSelector((s) => s.sync);
  const [me, setMe] = useState<{ substackUserId: number; substackHandle: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.substackUserId && data?.substackHandle) {
          setMe({
            substackUserId: data.substackUserId,
            substackHandle: data.substackHandle,
          });
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const busy =
    syncState.phase === "fetching-publications" ||
    syncState.phase === "fetching-posts" ||
    syncState.phase === "saving";

  const last = publication.lastSyncedAt
    ? new Date(publication.lastSyncedAt).toLocaleString()
    : "never";

  function onSync() {
    if (!me) return;
    void sync.run(me.substackUserId, me.substackHandle);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-muted">
        last sync · {last}
      </span>
      <button
        type="button"
        onClick={onSync}
        disabled={busy || !me}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:border-border-2 disabled:opacity-50"
      >
        {busy ? syncState.message ?? "Syncing…" : "Sync"}
      </button>
    </div>
  );
}
