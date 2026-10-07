"use client";

import { Inbox, LayoutDashboard, Star, UserRound } from "lucide-react";
import { AppSidebar, type NavSection } from "@/components/app-sidebar";

/**
 * Sidebar do motorista — definida em cliente porque os ícones (componentes)
 * não podem ser passados do layout de servidor para o AppSidebar.
 */
export function MotoristaSidebar() {
  const seccoes: NavSection[] = [
    {
      label: "Painel",
      items: [
        { href: "/motorista", label: "Visão geral", icon: LayoutDashboard },
      ],
    },
    {
      label: "A minha actividade",
      items: [
        {
          href: "/motorista#pedidos",
          label: "Pedidos recebidos",
          icon: Inbox,
        },
        { href: "/motorista#avaliacoes", label: "Avaliações", icon: Star },
      ],
    },
    {
      label: "Conta",
      items: [
        {
          href: "/motorista/perfil",
          label: "O meu perfil",
          icon: UserRound,
        },
      ],
    },
  ];

  return <AppSidebar sections={seccoes} area="Motorista" />;
}
