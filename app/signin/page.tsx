import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { SignInCard } from "@/components/auth/signin-card";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  async function action() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <main className="flex-1 grid place-items-center px-6">
      <SignInCard action={action} />
    </main>
  );
}
