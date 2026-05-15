import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PostsSyncPayload,
  type ExtensionPostT,
} from "@/lib/sync-schema";
import { PostStatus, PostType, Prisma } from "@/generated/client";
import { revalidatePath } from "next/cache";

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapPost(p: ExtensionPostT, status: PostStatus) {
  return {
    substackId: p.id,
    uuid: p.uuid ?? null,
    type: p.type as PostType,
    status,
    title: p.title,
    draftTitle: p.draft_title,
    postDate: parseDate(p.post_date),
    triggerAt: parseDate(p.trigger_at),
    coverImage: p.cover_image,
    bylines: (p.bylines ?? []) as unknown as Prisma.InputJsonValue,
    stats: (p.stats ?? {}) as unknown as Prisma.InputJsonValue,
    headlineTest: (p.headlineTest ?? null) as unknown as Prisma.InputJsonValue,
  };
}

async function replacePosts(
  publicationId: string,
  status: PostStatus,
  rows: ExtensionPostT[],
) {
  const mapped = rows.map((r) => mapPost(r, status));
  const incomingIds = new Set(mapped.map((m) => m.substackId));

  await prisma.post.deleteMany({
    where: {
      publicationId,
      status,
      substackId: { notIn: Array.from(incomingIds) },
    },
  });

  for (const m of mapped) {
    await prisma.post.upsert({
      where: {
        publicationId_substackId: { publicationId, substackId: m.substackId },
      },
      create: { publicationId, ...m, syncedAt: new Date() },
      update: { ...m, syncedAt: new Date() },
    });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = PostsSyncPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pub = await prisma.publication.findUnique({
    where: { id: parsed.data.publicationId },
    select: { id: true, userId: true },
  });
  if (!pub || pub.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const log = await prisma.syncLog.create({
    data: { publicationId: pub.id, status: "ok" },
  });

  try {
    await replacePosts(pub.id, PostStatus.published, parsed.data.posts.published);
    await replacePosts(pub.id, PostStatus.scheduled, parsed.data.posts.scheduled);
    await replacePosts(pub.id, PostStatus.drafts, parsed.data.posts.drafts);

    await prisma.publication.update({
      where: { id: pub.id },
      data: { lastSyncedAt: new Date() },
    });
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "ok", finishedAt: new Date() },
    });

    revalidatePath(`/dashboard/${pub.id}`, "layout");
    return NextResponse.json({
      ok: true,
      counts: {
        published: parsed.data.posts.published.length,
        scheduled: parsed.data.posts.scheduled.length,
        drafts: parsed.data.posts.drafts.length,
      },
    });
  } catch (err) {
    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        finishedAt: new Date(),
      },
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "posts sync failed" },
      { status: 500 },
    );
  }
}
