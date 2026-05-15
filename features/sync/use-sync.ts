"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useExtension } from "@/features/extension/use-extension";
import type { ExtensionPost, Publication, PostsResponse } from "@/features/extension/types";
import { useAppDispatch } from "@/store";
import { start, progress, success, fail } from "@/store/sync-slice";

function publicationBaseUrl(p: Pick<Publication, "subdomain" | "custom_domain">) {
  if (p.custom_domain) return `https://${p.custom_domain}`;
  return `https://${p.subdomain}.substack.com`;
}

async function fetchAll(
  fetcher: (offset: number, limit: number) => Promise<PostsResponse>,
  pageSize = 50,
): Promise<ExtensionPost[]> {
  const out: ExtensionPost[] = [];
  let offset = 0;
  // Safety cap: stop after 40 pages (2,000 posts).
  for (let i = 0; i < 40; i++) {
    const res = await fetcher(offset, pageSize);
    out.push(...res.posts);
    if (res.posts.length < pageSize) break;
    offset += pageSize;
    if (res.isCapped) break;
  }
  return out;
}

export interface UseSync {
  run: (substackUserId: number, substackHandle: string) => Promise<void>;
}

export function useSync(): UseSync {
  const ext = useExtension();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const run = useCallback(
    async (substackUserId: number, substackHandle: string) => {
      try {
        dispatch(start({ phase: "fetching-publications", message: "Looking up your publications…" }));
        const pubsResp = await ext.getUserPublications(substackUserId, substackHandle);
        const pubs = (pubsResp.publicationUsers ?? []).map((pu) => pu.publication);

        if (pubs.length === 0) {
          throw new Error("No publications found for this Substack account.");
        }

        dispatch(start({ phase: "fetching-posts", message: "Fetching posts…" }));

        const payload: {
          publications: Array<{
            substackId: number;
            name: string;
            subdomain: string;
            customDomain: string | null;
            logoUrl: string | null;
            isPrimary: boolean;
            paymentsState: string | null;
            posts: {
              published: ExtensionPost[];
              scheduled: ExtensionPost[];
              drafts: ExtensionPost[];
            };
          }>;
        } = { publications: [] };

        let done = 0;
        for (const p of pubs) {
          const baseUrl = publicationBaseUrl(p);
          const [published, scheduled, drafts] = await Promise.all([
            fetchAll((offset, limit) => ext.fetchPublishedPosts(baseUrl, offset, limit)),
            fetchAll((offset, limit) => ext.fetchScheduledPosts(baseUrl, offset, limit)),
            fetchAll((offset, limit) => ext.fetchDraftPosts(baseUrl, offset, limit)),
          ]);

          payload.publications.push({
            substackId: p.id,
            name: p.name,
            subdomain: p.subdomain,
            customDomain: p.custom_domain ?? null,
            logoUrl: p.logo_url ?? null,
            isPrimary: p.is_primary,
            paymentsState: p.payments_state ?? null,
            posts: { published, scheduled, drafts },
          });

          done++;
          dispatch(progress({ done, total: pubs.length }));
        }

        dispatch(start({ phase: "saving", message: "Saving…" }));
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Sync failed (${res.status})`);
        }

        // Also persist the Substack identity for next time.
        await fetch("/api/me/substack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ substackUserId, substackHandle }),
        }).catch(() => undefined);

        dispatch(success());
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sync failed";
        dispatch(fail(message));
      }
    },
    [ext, dispatch, router],
  );

  return { run };
}
