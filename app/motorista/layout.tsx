import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DashboardContent,
  DashboardToolbar,
} from "@/components/app-sidebar";
import { MotoristaSidebar } from "./motorista-sidebar";
import { ThemeMenu } from "@/components/theme-menu";
import { UserMenu } from "@/components/user-menu";

export const metadata: Metadata = {
  title: "Painel do motorista",
};

// Rota autenticada: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export default async function MotoristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/motorista");

  return (
    <SidebarProvider>
      <MotoristaSidebar />
      <div className="relative flex w-full min-w-0 flex-1 flex-col bg-background">
        <DashboardToolbar titulo="Painel do motorista">
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
