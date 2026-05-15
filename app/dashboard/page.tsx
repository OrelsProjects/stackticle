import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicationsForUser } from "@/lib/posts";
import { AppHeader } from "@/components/dashboard/app-header";
import { ConnectExtension } from "@/components/dashboard/connect-extension";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const publications = await getPublicationsForUser(session.user.id);

  if (publications.length === 0) {
    return (
      <>
        <AppHeader publications={[]} user={session.user} />
        <main className="flex-1 grid place-items-center px-6 py-16">
          <ConnectExtension />
        </main>
      </>
    );
  }

  redirect(`/dashboard/${publications[0].id}`);
}
