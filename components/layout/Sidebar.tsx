"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "@prisma/client";

interface SidebarProps {
  user: User & { empresa?: { nome: string; logoUrl?: string | null } | null };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isEmpresa = user.userType === "EMPRESA";

  const links = isEmpresa
    ? [
        { href: "/dashboard", label: "📋 Roadmaps", exact: true },
        { href: "/dashboard/feedbacks", label: "📊 Feedbacks" },
        { href: "/dashboard/perfil", label: "🏢 Perfil" },
        { href: "/settings/billing", label: "💳 Plano" },
      ]
    : [
        { href: "/dashboard", label: "🔍 Explorar", exact: true },
        { href: "/dashboard/perfil", label: "👤 Perfil" },
      ];

  return (
    <aside className="w-56 border-r border-sidebar-border bg-sidebar h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="font-bold text-lg text-sidebar-foreground">Pitaco</Link>
        <div className="text-xs text-muted-foreground mt-1 truncate">
          {isEmpresa ? user.empresa?.nome : (user.username ?? user.name)}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs text-destructive hover:underline"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
