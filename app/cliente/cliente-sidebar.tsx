"use client";

import { LayoutDashboard, MessageCircle, Search, Users } from "lucide-react";
import { AppSidebar, type NavSection } from "@/components/app-sidebar";

/**
 * Sidebar do cliente — definida em cliente porque os ícones (componentes)
 * não podem ser passados do layout de servidor para o AppSidebar.
 */
export function ClienteSidebar() {
  const seccoes: NavSection[] = [
    {
      label: "Painel",
      items: [
        { href: "/cliente", label: "Visão geral", icon: LayoutDashboard },
      ],
    },
    {
      label: "Motoristas",
      items: [
        {
          href: "/cliente#disponiveis",
          label: "Disponíveis agora",
          icon: Users,
        },
        {
          href: "/cliente#contactados",
          label: "Já contactados",
          icon: MessageCircle,
        },
      ],
    },
    {
      label: "Pesquisa",
      items: [
        { href: "/encontrar", label: "Encontrar motorista", icon: Search },
      ],
    },
  ];

  return <AppSidebar sections={seccoes} area="Cliente" />;
}
