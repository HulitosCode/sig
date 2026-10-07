"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/encontrar", label: "Encontrar" },
  { href: "/#planos", label: "Planos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

function isActive(href: string, pathname: string) {
  if (href.startsWith("/#")) return pathname === "/";
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Links de navegação principais — usados no header (desktop) e no menu
 * mobile. `vertical` alterna o estilo para a lista do Sheet.
 */
export function NavLinks({
  className,
  vertical = false,
  onItemClick,
}: {
  className?: string;
  vertical?: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        vertical
          ? "flex flex-col items-stretch gap-1"
          : "flex items-center gap-1",
        className
      )}
    >
      {links.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              vertical && "py-2.5",
              active
                ? "bg-primary/15 text-primary-text"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
