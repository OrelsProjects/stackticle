"use client";

import { useMemo } from "react";
import { PostStatus } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggle, set as setSelection } from "@/store/selection-slice";
import { monthGroupKey, shortDate, compactNumber } from "@/lib/format";

export interface PostRow {
  id: string;
  substackId: number;
  title: string;
  coverImage: string | null;
  postDate: string | null;
  triggerAt: string | null;
  stats: Record<string, number> | null;
}

export function PostsTable({
  status,
  posts,
}: {
  status: PostStatus;
  posts: PostRow[];
}) {
  const dispatch = useAppDispatch();
  const selection = useAppSelector((s) => s.selection.ids);
  const selectedSet = useMemo(() => new Set(selection), [selection]);

  const groups = useMemo(() => {
    const map = new Map<string, PostRow[]>();
    for (const p of posts) {
      const key = monthGroupKey(p.postDate ?? p.triggerAt ?? null);
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [posts]);

  const allVisibleIds = useMemo(() => posts.map((p) => p.substackId), [posts]);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedSet.has(id));

  function toggleAll() {
    if (allSelected) dispatch(setSelection([]));
    else dispatch(setSelection(allVisibleIds));
  }

  function toggleGroup(rows: PostRow[]) {
    const ids = rows.map((r) => r.substackId);
    const allOn = ids.every((id) => selectedSet.has(id));
    if (allOn) {
      dispatch(setSelection(selection.filter((id) => !ids.includes(id))));
    } else {
      dispatch(setSelection(Array.from(new Set([...selection, ...ids]))));
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-bg-2 px-6 py-16 text-center">
        <p className="text-sm text-text-2">
          No {status} posts yet. Hit <span className="font-mono">Sync</span> to refresh from Substack.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-bg-2 overflow-hidden">
      <div className="grid grid-cols-[40px_1fr_120px_100px_100px] items-center border-b border-border bg-surface px-4 py-2.5 text-[11px] font-mono uppercase tracking-[0.06em] text-muted">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-3.5 w-3.5 accent-[color:var(--accent)]"
          />
        </div>
        <div>Title</div>
        <div>{status === PostStatus.scheduled ? "Scheduled" : "Date"}</div>
        <div className="text-right">Views</div>
        <div className="text-right">Opens</div>
      </div>

      {groups.map(([month, rows]) => (
        <div key={month}>
          <button
            type="button"
            onClick={() => toggleGroup(rows)}
            className="w-full text-left flex items-center justify-between px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.08em] text-accent bg-surface-2/40 border-b border-border hover:bg-surface-2"
          >
            <span>{month}</span>
            <span className="text-muted">{rows.length}</span>
          </button>
          {rows.map((p) => {
            const isSelected = selectedSet.has(p.substackId);
            return (
              <div
                key={p.id}
                onClick={() => dispatch(toggle(p.substackId))}
                className={
                  "grid grid-cols-[40px_1fr_120px_100px_100px] items-center px-4 py-3 cursor-pointer border-b border-border last:border-b-0 transition " +
                  (isSelected ? "bg-accent/[0.06]" : "hover:bg-surface-2/40")
                }
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => dispatch(toggle(p.substackId))}
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 accent-[color:var(--accent)]"
                  />
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={
                      "h-10 w-10 shrink-0 rounded-md bg-cover bg-center bg-surface-2 " +
                      (isSelected ? "ring-1 ring-accent/40" : "")
                    }
                    style={
                      p.coverImage
                        ? { backgroundImage: `url(${p.coverImage})` }
                        : undefined
                    }
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm text-text">{p.title}</div>
                  </div>
                </div>
                <div className="text-sm text-text-2 font-mono text-xs">
                  {shortDate(p.postDate ?? p.triggerAt)}
                </div>
                <div className="text-right text-sm font-mono text-xs text-text-2">
                  {compactNumber(p.stats?.views ?? null)}
                </div>
                <div className="text-right text-sm font-mono text-xs text-text-2">
                  {compactNumber(p.stats?.opens ?? null)}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
