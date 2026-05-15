"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostStatus } from "@/generated/client";
import { PostsTable, type PostRow } from "./posts-table";
import { FloatingActionBar } from "./floating-action-bar";
import { UndoToasts } from "./undo-toasts";
import { useAppDispatch, useAppSelector } from "@/store";
import { clear as clearSelection } from "@/store/selection-slice";
import { SyncBar } from "./sync-bar";

export interface PublicationLite {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  baseUrl: string;
  lastSyncedAt: string | null;
}

const TABS: { key: PostStatus; label: string }[] = [
  { key: PostStatus.published, label: "Published" },
  { key: PostStatus.drafts, label: "Drafts" },
  { key: PostStatus.scheduled, label: "Scheduled" },
];

export function PostsView({
  publication,
  status,
  counts,
  posts,
}: {
  publication: PublicationLite;
  status: PostStatus;
  counts: Record<PostStatus, number>;
  posts: PostRow[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const selection = useAppSelector((s) => s.selection.ids);

  // Drop selection when switching tabs.
  function setTab(next: PostStatus) {
    const usp = new URLSearchParams(params);
    usp.set("tab", next);
    dispatch(clearSelection());
    router.push(`/dashboard/${publication.id}?${usp.toString()}`);
  }

  const visibleSubstackIds = useMemo(() => posts.map((p) => p.substackId), [posts]);
  const selectedInView = useMemo(
    () => selection.filter((id) => visibleSubstackIds.includes(id)),
    [selection, visibleSubstackIds],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{publication.name}</h1>
          <p className="text-sm text-text-2">
            {publication.customDomain ?? `${publication.subdomain}.substack.com`}
          </p>
        </div>
        <SyncBar publication={publication} />
      </header>

      <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "rounded-full px-3 py-1.5 text-sm transition " +
              (status === t.key
                ? "bg-surface-3 text-text"
                : "text-text-2 hover:text-text")
            }
          >
            {t.label}
            <span className="ml-1.5 font-mono text-[11px] text-muted">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <PostsTable status={status} posts={posts} />

      <FloatingActionBar
        publication={publication}
        selectedIds={selectedInView}
        visiblePosts={posts}
      />
      <UndoToasts />
    </div>
  );
}
