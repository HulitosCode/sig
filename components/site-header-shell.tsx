"use client";

import { usePathname } from "next/navigation";

/**
 * Nas áreas autenticadas (admin/motorista) o header público desaparece —
 * a sidebar assume o topo da página, como num dashboard SaaS.
 */
export function SiteHeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const privada =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/motorista" ||
    pathname.startsWith("/motorista/");

  if (privada) return null;
  return children;
}
