"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExtension } from "@/features/extension/use-extension";
import type { Post, PostsResponse } from "@/features/extension/types";
import { useAppDispatch } from "@/store";
import { start, success, fail } from "@/store/sync-slice";

export interface UseSync {
  run: () => Promise<void>;
}

/**
 * One-button sync: ask the extension for the user's profile + publications,
 * then POST to /api/sync. Posts are NOT fetched here — they're synced on
 * the publication page via useSyncPosts.
 */
export function useSync(): UseSync {
  const ext = useExtension();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const run = useCallback(async () => {
    try {
      dispatch(start({ phase: "fetching-publications", message: "Syncing your account…" }));
      const result = await ext.syncUser();

      dispatch(start({ phase: "saving", message: "Saving…" }));
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Sync failed (${res.status})`);
      }

      dispatch(success());
      router.refresh();
    } catch (err) {
      dispatch(fail(err instanceof Error ? err.message : "Sync failed"));
    }
  }, [ext, dispatch, router]);

  return { run };
}

// --- Per-publication posts sync --------------------------------------------

async function fetchAll(
  fetcher: (offset: number, limit: number) => Promise<PostsResponse>,
  pageSize = 25,
): Promise<Post[]> {
  const out: Post[] = [];
  let offset = 0;
  for (let i = 0; i < 40; i++) {
    const res = await fetcher(offset, pageSize);
    out.push(...res.posts);
    if (res.posts.length < pageSize) break;
    offset += pageSize;
    if (res.isCapped) break;
  }
  return out;
}

export interface UseSyncPosts {
  run: (args: { publicationId: string; newsletterUrl: string }) => Promise<void>;
}

export function useSyncPosts(): UseSyncPosts {
  const ext = useExtension();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const run = useCallback(
    async ({ publicationId, newsletterUrl }: { publicationId: string; newsletterUrl: string }) => {
      try {
        dispatch(start({ phase: "fetching-posts", message: "Fetching posts…" }));
        const [published, scheduled, drafts] = await Promise.all([
          fetchAll((offset, limit) => ext.fetchPublishedPosts(newsletterUrl, offset, limit)),
          fetchAll((offset, limit) => ext.fetchScheduledPosts(newsletterUrl, offset, limit)),
          fetchAll((offset, limit) => ext.fetchDraftPosts(newsletterUrl, offset, limit)),
        ]);

        dispatch(start({ phase: "saving", message: "Saving…" }));
        const res = await fetch("/api/posts/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicationId,
            posts: { published, scheduled, drafts },
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Posts sync failed (${res.status})`);
        }

        dispatch(success());
        router.refresh();
      } catch (err) {
        dispatch(fail(err instanceof Error ? err.message : "Posts sync failed"));
      }
    },
    [ext, dispatch, router],
  );

  return { run };
}
