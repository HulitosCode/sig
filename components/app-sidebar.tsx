"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, Phone, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SUPORTE } from "@/lib/freta";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Contador opcional mostrado à direita do item. */
  badge?: number;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

/**
 * Sidebar das áreas autenticadas (admin e motorista), gerada com o
 * componente shadcn `Sidebar` (modo icon, com tooltips ao colapsar).
 * Os contactos de suporte ficam no rodapé.
 */
export function AppSidebar({
  sections,
  area,
}: {
  sections: NavSection[];
  area: string;
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const expandida = state === "expanded";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Link
            href="/"
            title="Voltar ao site"
            className="flex min-w-0 items-center gap-2 rounded-md px-1 py-0.5 font-bold hover:text-primary-text"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="size-4" />
            </span>
            {expandida && (
              <span className="tracking-tight">FRETA</span>
            )}
          </Link>
          {expandida && (
            <Badge
              variant="outline"
              className="ml-auto border-primary/50 bg-primary/10 text-primary-text"
            >
              {area}
            </Badge>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  // Âncoras (#secção) nunca ficam "activas" — não há forma
                  // de saber a posição de scroll no servidor.
                  const active =
                    !item.href.includes("#") && pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {expandida &&
                        typeof item.badge === "number" &&
                        item.badge > 0 && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div
          className={cn(
            "flex flex-col gap-1 px-2 pb-2",
            !expandida && "items-center px-0"
          )}
        >
          {expandida && (
            <span className="px-2 pb-0.5 text-xs font-medium text-muted-foreground">
              Suporte
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full justify-start gap-2", !expandida && "size-8 justify-center px-0")}
            title={`Ligar: ${SUPORTE.telefoneFormatado}`}
            render={<a href={`tel:${SUPORTE.telefoneIntl}`} />}
          >
            <Phone className="size-3.5" />
            {expandida && SUPORTE.telefoneFormatado}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn("w-full justify-start gap-2", !expandida && "size-8 justify-center px-0")}
            title="Falar por WhatsApp"
            render={
              <a
                href={SUPORTE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle className="size-3.5" />
            {expandida && "WhatsApp"}
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/**
 * Barra de ferramentas das áreas autenticadas (SidebarTrigger + título +
 * acções da conta). Usa `<div>` em vez de SidebarInset para não criar
 * `<main>` aninhado (o layout raiz já envolve tudo num `<main>`).
 */
export function DashboardToolbar({
  titulo,
  children,
}: {
  titulo: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur md:px-4">
      <SidebarTrigger />
      <span className="text-sm font-medium text-muted-foreground">
        {titulo}
      </span>
      <div className="ml-auto flex items-center gap-1.5">{children}</div>
    </div>
  );
}

/** Área de conteúdo das áreas autenticadas. */
export function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
      {children}
    </div>
  );
}
