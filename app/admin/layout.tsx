import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DashboardContent,
  DashboardToolbar,
} from "@/components/app-sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { ThemeMenu } from "@/components/theme-menu";
import { UserMenu } from "@/components/user-menu";

export const metadata: Metadata = {
  title: "Administração",
};

// Rota de admin: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const agora = new Date();
  const trintaDias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [pendentes, pedidosRecentes, verificacoes] = await Promise.all([
    prisma.motorista.count({ where: { status: "pendente" } }),
    prisma.pedido.count({ where: { criadoEm: { gte: trintaDias } } }),
    // Documentos enviados à espera de validação do admin.
    prisma.motorista.count({
      where: { status: "pendente", documentosEnviadosEm: { not: null } },
    }),
  ]);

  return (
    <SidebarProvider>
      <AdminSidebar
        pendentes={pendentes}
        pedidosRecentes={pedidosRecentes}
        verificacoes={verificacoes}
      />
      <div className="relative flex w-full min-w-0 flex-1 flex-col bg-background">
        <DashboardToolbar titulo="Administração">
          <ThemeMenu />
          <Separator orientation="vertical" className="h-5" />
          <UserMenu
            user={{
              name: admin.name,
              email: admin.email,
              role: admin.role ?? "admin",
            }}
          />
        </DashboardToolbar>
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
