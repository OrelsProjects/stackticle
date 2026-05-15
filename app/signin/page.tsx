import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  async function action() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <main className="flex-1 grid place-items-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-2 p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-1">
          <div className="mx-auto h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-accent-2" />
          <h1 className="text-xl font-semibold tracking-tight">Sign in to StackTicle</h1>
          <p className="text-sm text-text-2">Google sign-in only.</p>
        </div>
        <form action={action}>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink shadow-[0_8px_24px_-16px_var(--accent)] hover:brightness-110"
          >
            Continue with Google
          </button>
        </form>
        <p className="text-xs text-muted text-center">
          We only store the data your Substack archive needs to render this dashboard.
        </p>
      </div>
    </main>
  );
}
