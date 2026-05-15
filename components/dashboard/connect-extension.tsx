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
  const [url, setUrl] = useState("");
  const [validating, setValidating] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const sync = useSync();
  const ext = useExtension();
  const syncState = useAppSelector((s) => s.sync);

  const hasIdentity = Boolean(initial?.substackUserId && initial?.substackHandle);

  const syncing =
    syncState.phase === "fetching-publications" ||
    syncState.phase === "fetching-posts" ||
    syncState.phase === "saving";
  const busy = validating || syncing;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);

    if (hasIdentity && !url.trim()) {
      // Already connected — just sync.
      void sync.run(initial!.substackUserId!, initial!.substackHandle!);
      return;
    }

    setValidating(true);
    try {
      const res = await fetch("/api/me/resolve-substack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Couldn't resolve that Substack URL.");
      }
      const profile = (await res.json()) as {
        substackUserId: number;
        substackHandle: string;
      };
      setValidating(false);
      await sync.run(profile.substackUserId, profile.substackHandle);
    } catch (err) {
      setValidating(false);
      setLocalError(err instanceof Error ? err.message : "Failed to validate URL.");
    }
  }

  const installed = typeof window !== "undefined" ? ext.isInstalled() : true;
  const error = localError ?? (syncState.phase === "error" ? syncState.error : null);

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-2 p-8 space-y-6">
      <div className="space-y-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
          Step 1
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          {hasIdentity ? "Sync your archive" : "Connect your Substack"}
        </h2>
        <p className="text-sm text-text-2">
          {hasIdentity ? (
            <>
              Connected as <span className="font-mono">@{initial!.substackHandle}</span>. Hit
              sync to refresh your archive.
            </>
          ) : (
            <>Paste your Substack profile URL or any post/publication URL. We&rsquo;ll resolve the rest.</>
          )}
        </p>
      </div>

      {!installed && (
        <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          The StackTicle Chrome extension is not detected. Install it and reload this page.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {!hasIdentity && (
          <div className="space-y-1.5">
            <label htmlFor="substackUrl" className="text-xs text-text-2">
              Substack URL
            </label>
            <input
              id="substackUrl"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setLocalError(null);
              }}
              placeholder="https://substack.com/@your-handle"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-border-2"
              required
              disabled={busy}
            />
            <p className="text-[11px] text-muted">
              Examples: <span className="font-mono">substack.com/@yourname</span> ·{" "}
              <span className="font-mono">yourname.substack.com</span> ·{" "}
              <span className="font-mono">yourname.substack.com/p/post-slug</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !installed || (!hasIdentity && url.trim().length === 0)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink shadow-[0_8px_24px_-16px_var(--accent)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating
            ? "Resolving URL…"
            : syncing
              ? (syncState.message ?? "Syncing…")
              : hasIdentity
                ? "Sync now"
                : "Resolve & sync"}
        </button>

        {error && <div className="text-xs text-danger">{error}</div>}
        {syncState.progress && (
          <div className="text-xs text-muted">
            {syncState.progress.done}/{syncState.progress.total} publications synced
          </div>
        )}
      </form>
    </div>
  );
}
