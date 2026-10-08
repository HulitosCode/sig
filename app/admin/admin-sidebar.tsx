"use client";

import { FileCheck, Inbox, LayoutDashboard, Users } from "lucide-react";
import { AppSidebar, type NavSection } from "@/components/app-sidebar";

/**
 * Sidebar do admin — definida em cliente porque os ícones (componentes)
 * não podem ser passados do layout de servidor para o AppSidebar.
 * O servidor só envia as contagens (números).
 */
export function AdminSidebar({
  pendentes,
  pedidosRecentes,
  verificacoes,
}: {
  pendentes: number;
  pedidosRecentes: number;
  verificacoes: number;
}) {
  const seccoes: NavSection[] = [
    {
      label: "Administração",
      items: [
        { href: "/admin", label: "Painel", icon: LayoutDashboard },
        {
          href: "/admin/motoristas",
          label: "Motoristas",
          icon: Users,
          badge: pendentes,
        },
        {
          href: "/admin/motoristas?docs=1",
          label: "Verificações",
          icon: FileCheck,
          badge: verificacoes,
        },
        {
          href: "/admin/pedidos",
          label: "Pedidos",
          icon: Inbox,
          badge: pedidosRecentes,
        },
      ],
    },
  ];

  return <AppSidebar sections={seccoes} area="Admin" />;
}
