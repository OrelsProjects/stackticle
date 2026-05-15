import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyncPayload, type ExtensionPostT, type PublicationPayloadT } from "@/lib/sync-schema";
import { PostStatus, PostType, Prisma } from "@prisma/client";
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

async function upsertPublication(userId: string, pub: PublicationPayloadT) {
  const existing = await prisma.publication.findUnique({
    where: { substackId: pub.substackId },
  });
  if (existing && existing.userId !== userId) {
    throw new Error(`Publication ${pub.substackId} is owned by another account`);
  }
  return prisma.publication.upsert({
    where: { substackId: pub.substackId },
    create: {
      substackId: pub.substackId,
      userId,
      name: pub.name,
      subdomain: pub.subdomain,
      customDomain: pub.customDomain ?? null,
      logoUrl: pub.logoUrl ?? null,
      isPrimary: pub.isPrimary,
      paymentsState: pub.paymentsState ?? null,
      lastSyncedAt: new Date(),
    },
    update: {
      name: pub.name,
      subdomain: pub.subdomain,
      customDomain: pub.customDomain ?? null,
      logoUrl: pub.logoUrl ?? null,
      isPrimary: pub.isPrimary,
      paymentsState: pub.paymentsState ?? null,
      lastSyncedAt: new Date(),
    },
  });
}

async function replacePosts(
  publicationId: string,
  status: PostStatus,
  rows: ExtensionPostT[],
) {
  const mapped = rows.map((r) => mapPost(r, status));
  const incomingIds = new Set(mapped.map((m) => m.substackId));

  // Delete rows for this status that no longer exist on Substack.
  await prisma.post.deleteMany({
    where: {
      publicationId,
      status,
      substackId: { notIn: Array.from(incomingIds) },
    },
  });

  // Upsert each (batched serially — most users have <500 posts).
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

  const parsed = SyncPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const synced: { publicationId: string; counts: Record<PostStatus, number> }[] = [];

  for (const pub of parsed.data.publications) {
    const sync = await prisma.syncLog.create({
      data: { publicationId: "", status: "ok" },
    });

    try {
      const dbPub = await upsertPublication(userId, pub);
      await prisma.syncLog.update({
        where: { id: sync.id },
        data: { publicationId: dbPub.id },
      });

      await replacePosts(dbPub.id, PostStatus.published, pub.posts.published);
      await replacePosts(dbPub.id, PostStatus.scheduled, pub.posts.scheduled);
      await replacePosts(dbPub.id, PostStatus.drafts, pub.posts.drafts);

      await prisma.syncLog.update({
        where: { id: sync.id },
        data: { status: "ok", finishedAt: new Date() },
      });

      synced.push({
        publicationId: dbPub.id,
        counts: {
          published: pub.posts.published.length,
          scheduled: pub.posts.scheduled.length,
          drafts: pub.posts.drafts.length,
        },
      });
    } catch (err) {
      await prisma.syncLog.update({
        where: { id: sync.id },
        data: {
          status: "error",
          error: err instanceof Error ? err.message : String(err),
          finishedAt: new Date(),
        },
      });
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "sync failed" },
        { status: 500 },
      );
    }
  }

  revalidatePath("/dashboard", "layout");
  return NextResponse.json({ ok: true, synced });
}
