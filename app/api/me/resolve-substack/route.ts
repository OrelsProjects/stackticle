import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateProfileUrl } from "@/lib/substack-profile";

const Body = z.object({ url: z.string().min(1).max(2048) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const profile = await validateProfileUrl(parsed.data.url);
  if (!profile) {
    return NextResponse.json(
      { error: "Couldn't resolve a Substack profile from that URL." },
      { status: 422 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      substackUserId: profile.id,
      substackHandle: profile.handle,
    },
  });

  return NextResponse.json({
    substackUserId: profile.id,
    substackHandle: profile.handle,
    name: profile.name,
  });
}
