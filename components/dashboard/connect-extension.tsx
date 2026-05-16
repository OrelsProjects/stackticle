"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSync } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";
import { useExtension } from "@/features/extension/use-extension";
import { Button } from "@/components/ui/button";
import { EASE_SMOOTH } from "@/components/ui/animate-in";

export function ConnectExtension() {
  const sync = useSync();
  const ext = useExtension();
  const syncState = useAppSelector((s) => s.sync);

  const busy =
    syncState.phase === "fetching-publications" ||
    syncState.phase === "fetching-posts" ||
    syncState.phase === "saving";

  const installed = typeof window !== "undefined" ? ext.isInstalled() : true;

  function onClick() {
    void sync.run();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_SMOOTH }}
      className="w-full max-w-lg rounded-2xl border border-border bg-background p-8 space-y-6"
    >
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-primary">
          Step 1
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Connect your Substack</h2>
        <p className="text-sm text-foreground-2">
          The StackTicle Chrome extension already knows who you are from your Substack session.
          Hit sync and we&rsquo;ll pull your publications.
        </p>
      </motion.div>

      <AnimatePresence>
        {!installed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-md border border-destruction/40 bg-destruction/10 px-3 py-2 text-xs text-destruction">
              The StackTicle Chrome extension is not detected. Install it and reload this page.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <Button
          clean
          type="button"
          onClick={onClick}
          disabled={busy || !installed}
          className="w-full gap-2 bg-primary px-4 py-2.5 text-primary-ink shadow-[0_8px_24px_-16px_var(--primary)] hover:brightness-110"
        >
          {busy ? (syncState.message ?? "Syncing…") : "Sync"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {syncState.phase === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs text-destruction"
          >
            {syncState.error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
