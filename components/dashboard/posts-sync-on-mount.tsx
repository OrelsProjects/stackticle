"use client";

import { useEffect, useRef } from "react";
import { useSyncPosts } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";

const STALE_AFTER_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Triggers a posts sync the first time a publication page is mounted, or when
 * the stored data is older than STALE_AFTER_MS. Renders nothing — the sync
 * status comes through the global sync-slice and is shown by <SyncBar />.
 */
export function PostsSyncOnMount({
  publicationId,
  newsletterUrl,
  lastSyncedAt,
}: {
  publicationId: string;
  newsletterUrl: string;
  lastSyncedAt: string | null;
}) {
  const sync = useSyncPosts();
  const phase = useAppSelector((s) => s.sync.phase);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (phase === "fetching-posts" || phase === "saving") return;

    const stale =
      !lastSyncedAt ||
      Date.now() - new Date(lastSyncedAt).getTime() > STALE_AFTER_MS;
    if (!stale) return;

    fired.current = true;
    void sync.run({ publicationId, newsletterUrl });
  }, [publicationId, newsletterUrl, lastSyncedAt, phase, sync]);

  return null;
}
