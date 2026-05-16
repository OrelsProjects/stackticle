import Link from "next/link";
import { signOut } from "@/lib/auth";
import type { Publication } from "@/generated/client";
import { PublicationSwitcher } from "./publication-switcher";
import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-primary to-primary" />
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
            <div className="h-7 w-7 rounded-full bg-card border border-border" />
          )}
          <form action={doSignOut}>
            <Button
              clean
              type="submit"
              className="text-xs text-foreground-2 hover:text-foreground"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
