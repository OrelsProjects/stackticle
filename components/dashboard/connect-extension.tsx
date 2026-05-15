"use client";

import { useSync } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";
import { useExtension } from "@/features/extension/use-extension";

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
    <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-2 p-8 space-y-6">
      <div className="space-y-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
          Step 1
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Connect your Substack</h2>
        <p className="text-sm text-text-2">
          The StackTicle Chrome extension already knows who you are from your Substack session.
          Hit sync and we&rsquo;ll pull your publications.
        </p>
      </div>

      {!installed && (
        <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          The StackTicle Chrome extension is not detected. Install it and reload this page.
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={busy || !installed}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink shadow-[0_8px_24px_-16px_var(--accent)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? (syncState.message ?? "Syncing…") : "Sync"}
      </button>

      {syncState.phase === "error" && (
        <div className="text-xs text-danger">{syncState.error}</div>
      )}
    </div>
  );
}
