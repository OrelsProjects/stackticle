import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SyncUserPayload } from "@/lib/sync-schema";
import { revalidatePath } from "next/cache";

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

  const parsed = SyncUserPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const { profile, publications } = parsed.data;
  const syncedAt = new Date(parsed.data.syncedAt);
  const now = Number.isNaN(syncedAt.getTime()) ? new Date() : syncedAt;


  try {
    // Persist Substack identity on the user.
    await prisma.user.update({
      where: { id: userId },
      data: {
        substackUserId: profile.id,
        substackHandle: profile.handle,
        substackName: profile.name,
        substackPhotoUrl: profile.photoUrl ?? null,
      },
    });

    // Upsert each publication. Guard against ownership conflicts.
    const stored: { id: string; substackId: number }[] = [];
    for (const entry of publications) {
      const pub = entry.publication;
      const existing = await prisma.publication.findUnique({
        where: { substackId: pub.id },
      });
      if (existing && existing.userId !== userId) {
        return NextResponse.json(
          {
            error: `Publication ${pub.id} is already linked to another StackTicle account.`,
          },
          { status: 409 },
        );
      }
      const saved = await prisma.publication.upsert({
        where: { substackId: pub.id },
        create: {
          substackId: pub.id,
          userId,
          name: pub.name,
          subdomain: pub.subdomain,
          customDomain: pub.custom_domain ?? null,
          logoUrl: pub.logo_url ?? null,
          isPrimary: entry.isPrimary,
          paymentsState: pub.payments_state ?? null,
          lastSyncedAt: now,
        },
        update: {
          name: pub.name,
          subdomain: pub.subdomain,
          customDomain: pub.custom_domain ?? null,
          logoUrl: pub.logo_url ?? null,
          isPrimary: entry.isPrimary,
          paymentsState: pub.payments_state ?? null,
          // lastSyncedAt is bumped by the posts-sync route; not touched here.
        },
      });
      stored.push({ id: saved.id, substackId: saved.substackId });
    }

    // Remove publications the user previously had but that are no longer in the
    // sync payload (left the publication, lost access, etc.).
    await prisma.publication.deleteMany({
      where: {
        userId,
        substackId: { notIn: stored.map((s) => s.substackId) },
      },
    });

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ ok: true, publications: stored });
  } catch (error) {
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }
}
