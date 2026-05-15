import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  countPostsByStatus,
  getPosts,
  getPublicationForUser,
  getPublicationsForUser,
} from "@/lib/posts";
import { AppHeader } from "@/components/dashboard/app-header";
import { PostsView } from "@/components/dashboard/posts-view";
import { PostStatus } from "@prisma/client";
import { publicationBaseUrl } from "@/lib/publication-url";

const VALID = new Set<PostStatus>([
  PostStatus.published,
  PostStatus.scheduled,
  PostStatus.drafts,
]);

export default async function PublicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicationId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { publicationId } = await params;
  const { tab } = await searchParams;

  const pub = await getPublicationForUser(session.user.id, publicationId);
  if (!pub) notFound();

  const status: PostStatus =
    tab && VALID.has(tab as PostStatus) ? (tab as PostStatus) : PostStatus.published;

  const [publications, counts, posts] = await Promise.all([
    getPublicationsForUser(session.user.id),
    countPostsByStatus(pub.id),
    getPosts(pub.id, status),
  ]);

  return (
    <>
      <AppHeader
        publications={publications}
        currentPublicationId={pub.id}
        user={session.user}
      />
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        <PostsView
          publication={{
            id: pub.id,
            name: pub.name,
            subdomain: pub.subdomain,
            customDomain: pub.customDomain,
            baseUrl: publicationBaseUrl({
              subdomain: pub.subdomain,
              customDomain: pub.customDomain,
            }),
            lastSyncedAt: pub.lastSyncedAt?.toISOString() ?? null,
          }}
          status={status}
          counts={counts}
          posts={posts.map((p) => ({
            id: p.id,
            substackId: p.substackId,
            title: p.title ?? p.draftTitle ?? "Untitled",
            coverImage: p.coverImage,
            postDate: p.postDate?.toISOString() ?? null,
            triggerAt: p.triggerAt?.toISOString() ?? null,
            stats: (p.stats as Record<string, number> | null) ?? null,
          }))}
        />
      </main>
    </>
  );
}
