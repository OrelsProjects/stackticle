"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSyncPosts } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";
import type { PublicationLite } from "./posts-view";
import { Button } from "@/components/ui/button";
import { EASE_SMOOTH } from "@/components/ui/animate-in";

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
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: EASE_SMOOTH, delay: 0.1 }}
    >
      <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-muted-foreground">
        last sync · {last}
      </span>
      <Button
        clean
        type="button"
        onClick={onSync}
        disabled={busy}
        className="relative gap-2 border border-border bg-card px-3 py-1.5 hover:border-border-2 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={busy ? "syncing" : "idle"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: EASE_SMOOTH }}
          >
            {busy ? (syncState.message ?? "Syncing…") : "Sync posts"}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
