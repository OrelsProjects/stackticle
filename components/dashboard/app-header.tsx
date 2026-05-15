import Link from "next/link";
import { signOut } from "@/lib/auth";
import type { Publication } from "@prisma/client";
import { PublicationSwitcher } from "./publication-switcher";

export function AppHeader({
  publications,
  currentPublicationId,
  user,
}: {
  publications: Publication[];
  currentPublicationId?: string;
  user: { name?: string | null; image?: string | null; email?: string | null };
}) {
  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-accent to-accent-2" />
          <span className="font-semibold tracking-tight">StackTicle</span>
        </Link>
        {publications.length > 0 && (
          <div className="ml-2">
            <PublicationSwitcher
              publications={publications.map((p) => ({
                id: p.id,
                name: p.name,
                subdomain: p.subdomain,
                isPrimary: p.isPrimary,
              }))}
              currentPublicationId={currentPublicationId}
            />
          </div>
        )}
        <div className="ml-auto flex items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? user.email ?? ""}
              className="h-7 w-7 rounded-full border border-border"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-surface-2 border border-border" />
          )}
          <form action={doSignOut}>
            <button
              type="submit"
              className="text-xs text-text-2 hover:text-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
