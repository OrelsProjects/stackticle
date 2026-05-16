import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HomepageHero } from "@/components/landing/homepage-hero";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="flex-1 grid place-items-center px-6">
      <HomepageHero />
    </main>
  );
}
