import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  substackUserId: z.number().int().positive(),
  substackHandle: z.string().min(1).max(80),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      substackUserId: parsed.data.substackUserId,
      substackHandle: parsed.data.substackHandle,
    },
  });
  return NextResponse.json({ ok: true });
}
