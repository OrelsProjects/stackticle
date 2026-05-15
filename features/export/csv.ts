import type { PostRow } from "@/components/dashboard/posts-table";

function csvEscape(v: unknown) {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const HEADERS = [
  "substack_id",
  "title",
  "post_date",
  "trigger_at",
  "views",
  "opens",
  "clicks",
  "likes",
  "comments",
];

export function postsToCsv(posts: PostRow[]) {
  const lines = [HEADERS.join(",")];
  for (const p of posts) {
    lines.push(
      [
        p.substackId,
        csvEscape(p.title),
        p.postDate ?? "",
        p.triggerAt ?? "",
        p.stats?.views ?? "",
        p.stats?.opens ?? "",
        p.stats?.clicks ?? "",
        p.stats?.likes ?? "",
        p.stats?.comments ?? "",
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
