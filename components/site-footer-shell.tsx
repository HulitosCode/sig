"use client";

import { usePathname } from "next/navigation";

/**
 * Na área administrativa o footer público não aparece — o dashboard tem
 * sidebar + toolbar próprias, como no SiteHeaderShell das áreas privadas.
 */
export function SiteFooterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (admin) return null;
  return children;
}
