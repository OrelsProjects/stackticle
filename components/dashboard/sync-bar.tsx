"use client";

import { useSyncPosts } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";
import type { PublicationLite } from "./posts-view";

export function SyncBar({ publication }: { publication: PublicationLite }) {
  const sync = useSyncPosts();
  const syncState = useAppSelector((s) => s.sync);

  const busy =
    syncState.phase === "fetching-publications" ||
    syncState.phase === "fetching-posts" ||
    syncState.phase === "saving";

  const last = publication.lastSyncedAt
    ? new Date(publication.lastSyncedAt).toLocaleString()
    : "never";

  function onSync() {
    void sync.run({
      publicationId: publication.id,
      newsletterUrl: publication.baseUrl,
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-muted">
        last sync · {last}
      </span>
      <button
        type="button"
        onClick={onSync}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:border-border-2 disabled:opacity-50"
      >
        {busy ? (syncState.message ?? "Syncing…") : "Sync posts"}
      </button>
    </div>
  );
}
