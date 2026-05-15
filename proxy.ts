import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: Request) {
  const url = new URL(request.url);
  const isProtected =
    url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/");
  if (!isProtected) return NextResponse.next();

  const session = await auth();
  if (!session?.user?.id) {
    const signin = new URL("/signin", url);
    return NextResponse.redirect(signin);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
