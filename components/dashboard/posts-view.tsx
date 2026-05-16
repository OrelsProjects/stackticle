"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PostStatus } from "@/generated/client";
import { PostsTable, type PostRow } from "./posts-table";
import { FloatingActionBar } from "./floating-action-bar";
import { UndoToasts } from "./undo-toasts";
import { useAppDispatch, useAppSelector } from "@/store";
import { clear as clearSelection } from "@/store/selection-slice";
import { SyncBar } from "./sync-bar";
import { Button } from "@/components/ui/button";
import { EASE_SMOOTH } from "@/components/ui/animate-in";

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
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<PostStatus>(status);
  const isNavigating = useAppSelector((s) => s.nav.isNavigating);

  // Drop selection when switching tabs.
  function setTab(next: PostStatus) {
    const usp = new URLSearchParams(params);
    usp.set("tab", next);
    dispatch(clearSelection());
    setActiveTab(next);
    startTransition(() => {
      router.push(`/dashboard/${publication.id}?${usp.toString()}`);
    });
  }

  const pendingDeleteIds = useAppSelector((s) =>
    s.undo.pending.flatMap((p) => p.postIds),
  );
  const pendingDeleteSet = useMemo(
    () => new Set(pendingDeleteIds),
    [pendingDeleteIds],
  );

  const visiblePosts = useMemo(
    () => posts.filter((p) => !pendingDeleteSet.has(p.substackId)),
    [posts, pendingDeleteSet],
  );

  const visibleSubstackIds = useMemo(() => visiblePosts.map((p) => p.substackId), [visiblePosts]);
  const selectedInView = useMemo(
    () => selection.filter((id) => visibleSubstackIds.includes(id)),
    [selection, visibleSubstackIds],
  );

  return (
    <div className="space-y-6">
      <motion.header
        className="flex flex-wrap items-end justify-between gap-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{publication.name}</h1>
          <p className="text-sm text-muted-foreground">
            {publication.customDomain ?? `${publication.subdomain}.substack.com`}
          </p>
        </div>
        <SyncBar publication={publication} />
      </motion.header>

      <motion.div
        className="flex items-center gap-1 rounded-full border border-border bg-card p-1 w-fit"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH, delay: 0.08 }}
      >
        {TABS.map((t) => (
          <Button
            clean
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              "rounded-full px-3 py-1.5 " +
              (activeTab === t.key
                ? "bg-muted-foreground/15"
                : "text-muted-foreground")
            }
          >
            {t.label}
            <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{counts[t.key]}</span>
          </Button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH, delay: 0.16 }}
      >
        <PostsTable status={activeTab} posts={visiblePosts} isLoading={isPending || isNavigating} />
      </motion.div>

      <FloatingActionBar
        publication={publication}
        selectedIds={selectedInView}
        visiblePosts={visiblePosts}
      />
      <UndoToasts />
    </div>
  );
}
