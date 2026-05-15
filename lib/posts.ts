import "server-only";
import { prisma } from "./prisma";
import { PostStatus } from "@prisma/client";

export async function getPublicationsForUser(userId: string) {
  return prisma.publication.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
  });
}

export async function getPublicationForUser(userId: string, publicationId: string) {
  return prisma.publication.findFirst({
    where: { id: publicationId, userId },
  });
}

export async function getPosts(
  publicationId: string,
  status: PostStatus,
  opts: { take?: number; skip?: number } = {},
) {
  const orderBy =
    status === PostStatus.drafts
      ? [{ updatedAt: "desc" as const }]
      : [{ postDate: "desc" as const }];

  return prisma.post.findMany({
    where: { publicationId, status },
    orderBy,
    take: opts.take ?? 200,
    skip: opts.skip,
  });
}

export async function countPostsByStatus(publicationId: string) {
  const rows = await prisma.post.groupBy({
    by: ["status"],
    where: { publicationId },
    _count: { _all: true },
  });
  const out: Record<PostStatus, number> = {
    published: 0,
    scheduled: 0,
    drafts: 0,
  };
  for (const r of rows) out[r.status] = r._count._all;
  return out;
}
