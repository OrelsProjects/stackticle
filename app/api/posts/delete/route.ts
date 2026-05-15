import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeletePayload } from "@/lib/sync-schema";
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

  const parsed = DeletePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { publicationId, substackPostIds } = parsed.data;

  const pub = await prisma.publication.findUnique({
    where: { id: publicationId },
    select: { id: true, userId: true },
  });
  if (!pub || pub.userId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const result = await prisma.post.deleteMany({
    where: {
      publicationId: pub.id,
      substackId: { in: substackPostIds },
    },
  });

  revalidatePath(`/dashboard/${pub.id}`, "layout");
  return NextResponse.json({ ok: true, deleted: result.count });
}
