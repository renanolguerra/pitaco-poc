import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TrialBanner from "@/components/layout/TrialBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { empresa: true },
  });

  if (!user) redirect("/login");

  // First access: if userType not set, redirect to onboarding
  if (!user.userType) redirect("/onboarding");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Espaçador para a top bar fixa no mobile */}
        <div className="h-14 flex-shrink-0 md:hidden" />
        {/* TrialBanner apenas para empresas */}
        {user.userType === "EMPRESA" && <TrialBanner user={user} />}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
