import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="flex-1 grid place-items-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          For Substack writers with more than a handful of posts
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          The batch-actions toolbar
          <br />
          <span className="text-accent">Substack forgot.</span>
        </h1>
        <p className="text-text-2">
          Sign in to sync your archive from the StackTicle Chrome extension.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink shadow-[0_8px_24px_-16px_var(--accent)] hover:brightness-110"
        >
          Sign in with Google
        </Link>
      </div>
    </main>
  );
}
