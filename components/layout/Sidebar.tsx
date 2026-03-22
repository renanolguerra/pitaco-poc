"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "@prisma/client";

interface SidebarProps {
  user: User & { empresa?: { nome: string; logoUrl?: string | null } | null };
}

export default function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false);
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

  const navLinks = (onLinkClick?: () => void) => (
    <nav className="flex-1 p-2 space-y-1">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
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
  );

  const footer = (
    <div className="p-4 border-t border-sidebar-border">
      <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-xs text-destructive hover:underline"
      >
        Sair
      </button>
    </div>
  );

  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex w-56 border-r border-sidebar-border bg-sidebar h-full flex-col flex-shrink-0">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="font-bold text-lg text-sidebar-foreground">
            Pitaco
          </Link>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {isEmpresa ? user.empresa?.nome : (user.username ?? user.name)}
          </div>
        </div>
        {navLinks()}
        {footer}
      </aside>

      {/* ─── Mobile top bar (fixed) ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="text-sidebar-foreground p-1 text-2xl leading-none"
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <Link href="/" className="font-bold text-lg text-sidebar-foreground">
          Pitaco
        </Link>
      </div>

      {/* ─── Mobile backdrop ─── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── Mobile drawer ─── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div>
            <span className="font-bold text-lg text-sidebar-foreground">Pitaco</span>
            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
              {isEmpresa ? user.empresa?.nome : (user.username ?? user.name)}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground text-xl hover:text-foreground"
          >
            ✕
          </button>
        </div>
        {navLinks(() => setOpen(false))}
        {footer}
      </aside>
    </>
  );
}
