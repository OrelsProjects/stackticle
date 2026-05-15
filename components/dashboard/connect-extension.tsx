"use client";

import { useState } from "react";
import { useSync } from "@/features/sync/use-sync";
import { useAppSelector } from "@/store";
import { useExtension } from "@/features/extension/use-extension";

export function ConnectExtension({
  initial,
}: {
  initial?: { substackUserId: number | null; substackHandle: string | null };
}) {
  const [userId, setUserId] = useState<string>(
    initial?.substackUserId ? String(initial.substackUserId) : "",
  );
  const [handle, setHandle] = useState<string>(initial?.substackHandle ?? "");
  const sync = useSync();
  const ext = useExtension();
  const syncState = useAppSelector((s) => s.sync);

  const busy =
    syncState.phase === "fetching-publications" ||
    syncState.phase === "fetching-posts" ||
    syncState.phase === "saving";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0 || handle.trim().length === 0) return;
    await sync.run(id, handle.trim());
  }

  const installed = typeof window !== "undefined" ? ext.isInstalled() : true;

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-2 p-8 space-y-6">
      <div className="space-y-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
          Step 1
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Connect your Substack</h2>
        <p className="text-sm text-text-2">
          StackTicle reads your archive through the Chrome extension. We need your Substack
          user id and handle to enumerate your publications.
        </p>
      </div>

      {!installed && (
        <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          The StackTicle Chrome extension is not detected. Install it and reload this page.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-text-2">Substack user id</label>
          <input
            type="number"
            inputMode="numeric"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. 12345678"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-2"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-text-2">Substack handle</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. yourname"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-2"
            required
          />
          <p className="text-[11px] text-muted">
            Both are visible at <span className="font-mono">substack.com/api/v1/user/&lt;id&gt;-&lt;handle&gt;/public_profile/self</span>.
          </p>
        </div>

        <button
          type="submit"
          disabled={busy || !installed}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink shadow-[0_8px_24px_-16px_var(--accent)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? syncState.message ?? "Syncing…" : "Sync my archive"}
        </button>

        {syncState.phase === "error" && (
          <div className="text-xs text-danger">{syncState.error}</div>
        )}
        {syncState.progress && (
          <div className="text-xs text-muted">
            {syncState.progress.done}/{syncState.progress.total} publications synced
          </div>
        )}
      </form>
    </div>
  );
}
