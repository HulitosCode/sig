import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DashboardContent,
  DashboardToolbar,
} from "@/components/app-sidebar";
import { ClienteSidebar } from "./cliente-sidebar";
import { ThemeMenu } from "@/components/theme-menu";
import { UserMenu } from "@/components/user-menu";

export const metadata: Metadata = {
  title: "Painel do cliente",
};

// Rota autenticada: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/cliente");

  // Só clientes (e admin) entram aqui — um motorista é levado ao seu
  // próprio painel. Defesa em profundidade (o proxy.ts já redireciona).
  const role = user.role ?? "motorista";
  if (role !== "cliente" && role !== "admin") {
    redirect("/motorista");
  }

  return (
    <SidebarProvider>
      <ClienteSidebar />
      <div className="relative flex w-full min-w-0 flex-1 flex-col bg-background">
        <DashboardToolbar titulo="Painel do cliente">
          <ThemeMenu />
          <Separator orientation="vertical" className="h-5" />
          <UserMenu
            user={{
              name: user.name,
              email: user.email,
              role: user.role ?? "motorista",
            }}
          />
        </DashboardToolbar>
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
