"use client";

import { usePathname } from "next/navigation";

/** Rotas das áreas autenticadas (dashboards) — sem footer público. */
const privadas = ["/admin", "/motorista", "/cliente"];

/**
 * Nas áreas autenticadas (admin/motorista/cliente) o footer público não
 * aparece — o dashboard tem sidebar + toolbar próprias, como no
 * SiteHeaderShell das áreas privadas.
 */
export function SiteFooterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboard = privadas.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );

  if (dashboard) return null;
  return children;
}
