"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { DefinicoesContaDialog } from "@/components/conta/definicoes-conta-dialog";

type MenuUser = { name: string; email: string; role: string };

function iniciais(nome: string) {
  return nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: { user: MenuUser }) {
  const router = useRouter();
  const [definicoesAbertas, setDefinicoesAbertas] = useState(false);

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  const isAdmin = user.role === "admin";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" className="gap-2" />}
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary-text">
            {iniciais(user.name)}
          </span>
          <span className="max-w-24 truncate">{user.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          {/* Menu.GroupLabel exige um Group ancestral (Base UI). */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">
              {user.name}
            </DropdownMenuLabel>
            <div className="flex items-center gap-1.5 px-2 pb-1.5">
              <Badge
                variant="outline"
                className={
                  isAdmin
                    ? "border-primary/50 bg-primary/10 text-primary-text"
                    : "text-muted-foreground"
                }
              >
                {isAdmin
                  ? "Administrador"
                  : user.role === "cliente"
                    ? "Cliente"
                    : "Motorista"}
              </Badge>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              A minha conta
            </DropdownMenuLabel>
            <DropdownMenuItem render={<Link href="/motorista" />}>
              <LayoutDashboard className="size-4" />
              Painel do motorista
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                <ShieldCheck className="size-4" />
                Painel admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem render={<Link href="/encontrar" />}>
              <Search className="size-4" />
              Encontrar motorista
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDefinicoesAbertas(true)}>
              <Settings className="size-4" />
              Definições da conta
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="size-4" />
            Terminar sessão
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DefinicoesContaDialog
        key={user.name}
        open={definicoesAbertas}
        onOpenChange={setDefinicoesAbertas}
        user={user}
      />
    </>
  );
}
