"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { PostStatus } from "@/generated/client";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggle, set as setSelection } from "@/store/selection-slice";
import { monthGroupKey, shortDate, compactNumber } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EASE_SMOOTH } from "@/components/ui/animate-in";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface PostRow {
  id: string;
  substackId: number;
  title: string;
  coverImage: string | null;
  postDate: string | null;
  triggerAt: string | null;
  stats: Record<string, number> | null;
  substackUrl: string;
}

const SKELETON_ROWS = 8;

const HEADER_CELL_CLASS =
  "text-[11px] font-mono uppercase tracking-[0.06em] text-muted-foreground-foreground h-auto py-2.5 px-4 font-normal";

function PostsTableSkeleton({ status }: { status: PostStatus }) {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader className="bg-card border-b border-border [&_tr]:border-0">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`w-10 ${HEADER_CELL_CLASS}`}>
              <div className="flex items-center justify-center">
                <Skeleton className="h-3.5 w-3.5" />
              </div>
            </TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Title</TableHead>
            <TableHead className={`w-[120px] ${HEADER_CELL_CLASS}`}>
              {status === PostStatus.scheduled ? "Scheduled" : "Date"}
            </TableHead>
            {status !== PostStatus.drafts && (
              <>
                <TableHead
                  className={`w-[100px] text-right ${HEADER_CELL_CLASS}`}
                >
                  Views
                </TableHead>
                <TableHead
                  className={`w-[100px] text-right ${HEADER_CELL_CLASS}`}
                >
                  Opens
                </TableHead>
              </>
            )}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell className="w-10 px-4 py-3">
                <div className="flex items-center justify-center">
                  <Skeleton className="h-3.5 w-3.5" />
                </div>
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
                  <Skeleton
                    className="h-3.5"
                    style={{ width: `${48 + (i % 5) * 10}%` }}
                  />
                </div>
              </TableCell>
              <TableCell className="w-[120px] px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </TableCell>
              {status !== PostStatus.drafts && (
                <>
                  <TableCell className="w-[100px] px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-3 w-10" />
                  </TableCell>
                  <TableCell className="w-[100px] px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-3 w-10" />
                  </TableCell>
                </>
              )}
              <TableCell className="w-10 px-4 py-3" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function postThumbStyle(id: string): React.CSSProperties {
  const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  const hue = (seed * 37) % 360;
  const bg = `oklch(0.32 0.04 ${hue})`;
  const fg = `oklch(0.55 0.06 ${hue})`;
  return {
    background: `repeating-linear-gradient(135deg, ${bg} 0 6px, ${fg} 6px 7px)`,
  };
}

function PostCoverImage({
  id,
  src,
  isSelected,
}: {
  id: string;
  src: string | null;
  isSelected: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      className={
        "h-10 w-10 shrink-0 rounded-md overflow-hidden " +
        (isSelected ? "ring-1 ring-primary/40" : "")
      }
    >
      {showPlaceholder ? (
        <div className="h-full w-full" style={postThumbStyle(id)} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function PostRowMenu({ substackUrl }: { substackUrl: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground-foreground transition hover:bg-card hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem asChild>
          <a
            href={substackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            View in Substack
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground-foreground" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SELECTABLE_STATUSES = new Set<PostStatus>([PostStatus.drafts]);

export function PostsTable({
  status,
  posts,
  isLoading = false,
}: {
  status: PostStatus;
  posts: PostRow[];
  isLoading?: boolean;
}) {
  const selectable = SELECTABLE_STATUSES.has(status);
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
  const allSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedSet.has(id));

  const toggleAll = () => {
    if (allSelected) dispatch(setSelection([]));
    else dispatch(setSelection(allVisibleIds));
  };

  const toggleGroup = (rows: PostRow[]) => {
    const ids = rows.map((r) => r.substackId);
    const allOn = ids.every((id) => selectedSet.has(id));
    if (allOn) {
      dispatch(setSelection(selection.filter((id) => !ids.includes(id))));
    } else {
      dispatch(setSelection(Array.from(new Set([...selection, ...ids]))));
    }
  };

  if (isLoading) return <PostsTableSkeleton status={status} />;

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        className="rounded-xl border border-border bg-background px-6 py-16 text-center"
      >
        <p className="text-sm text-foreground-2">
          No {status} posts yet. Hit <span className="font-mono">Sync</span> to
          refresh from Substack.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <Table>
        <TableHeader className="bg-card [&_tr]:border-b [&_tr]:border-border">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`w-10 ${HEADER_CELL_CLASS}`}>
              <div className="flex items-center justify-center">
                {selectable && (
                  <Checkbox
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5"
                  />
                )}
              </div>
            </TableHead>
            <TableHead className={HEADER_CELL_CLASS}>Title</TableHead>
            <TableHead className={`w-[120px] ${HEADER_CELL_CLASS}`}>
              {status === PostStatus.scheduled ? "Scheduled" : "Date"}
            </TableHead>
            {status !== PostStatus.drafts && (
              <>
                <TableHead
                  className={`w-[100px] text-right ${HEADER_CELL_CLASS}`}
                >
                  Views
                </TableHead>
                <TableHead
                  className={`w-[100px] text-right ${HEADER_CELL_CLASS}`}
                >
                  Opens
                </TableHead>
              </>
            )}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>

        <AnimatePresence initial={false}>
          {groups.map(([month, rows], groupIndex) => (
            <motion.tbody
              key={month}
              className="[&_tr:last-child]:border-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: EASE_SMOOTH,
                delay: Math.min(groupIndex * 0.06, 0.2),
              }}
            >
              <tr className="border-b border-border bg-card/40">
                <td
                  colSpan={status === PostStatus.drafts ? 4 : 6}
                  className="p-0"
                >
                  <Button
                    size="sm"
                    onClick={selectable ? () => toggleGroup(rows) : undefined}
                    disabled={!selectable}
                    className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.08em] text-primary bg-transparent border-0 rounded-none disabled:cursor-default hover:enabled:bg-card px-4"
                  >
                    <span>{month}</span>
                    <span className="text-muted-foreground">{rows.length}</span>
                  </Button>
                </td>
              </tr>
              {rows.map((p, rowIndex) => {
                const isSelected = selectedSet.has(p.substackId);
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(
                        groupIndex * 0.06 + rowIndex * 0.025,
                        0.35,
                      ),
                    }}
                    onClick={
                      selectable
                        ? () => dispatch(toggle(p.substackId))
                        : undefined
                    }
                    className={
                      "group/row border-b border-border transition-colors " +
                      (selectable
                        ? "cursor-pointer " +
                          (isSelected ? "bg-primary/6" : "hover:bg-card/40")
                        : "cursor-default hover:bg-card/40")
                    }
                  >
                    <TableCell className="w-10 px-4 py-3">
                      <div className="flex items-center justify-center">
                        {selectable && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              dispatch(toggle(p.substackId))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="h-3.5 w-3.5"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <PostCoverImage
                          id={p.id}
                          src={p.coverImage}
                          isSelected={isSelected}
                        />
                        <div className="min-w-0">
                          {p.title ? (
                            <div className="truncate text-sm text-foreground">
                              {p.title}
                            </div>
                          ) : (
                            <div className="truncate text-sm italic text-muted-foreground">
                              Article has no title
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px] px-4 py-3 text-foreground-2 font-mono text-xs">
                      {shortDate(p.postDate ?? p.triggerAt)}
                    </TableCell>
                    {status !== PostStatus.drafts && (
                      <>
                        <TableCell className="w-[100px] px-4 py-3 text-right font-mono text-xs text-foreground-2">
                          {compactNumber(p.stats?.views ?? null)}
                        </TableCell>
                        <TableCell className="w-[100px] px-4 py-3 text-right font-mono text-xs text-foreground-2">
                          {compactNumber(p.stats?.opens ?? null)}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="w-10 px-4 py-3">
                      <div className="flex items-center justify-center">
                        <PostRowMenu substackUrl={p.substackUrl} />
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          ))}
        </AnimatePresence>
      </Table>
    </div>
  );
}
