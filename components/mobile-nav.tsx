"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, LayoutDashboard, ShieldCheck, Truck, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLinks } from "@/components/nav-links";
import { CriarContaModal } from "@/components/conta/criar-conta-modal";
import { EntrarModal } from "@/components/conta/entrar-modal";
import { DefinicoesContaDialog } from "@/components/conta/definicoes-conta-dialog";
import { authClient } from "@/lib/auth-client";

type MobileNavUser = { name: string; email: string; role: string } | null;

/** Menu hambúrguer (mobile): navegação + acções de conta. */
export function MobileNav({ user }: { user: MobileNavUser }) {
  const [open, setOpen] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [entrarAberto, setEntrarAberto] = useState(false);
  const [definicoesAbertas, setDefinicoesAbertas] = useState(false);
  const router = useRouter();

  function fechar() {
    setOpen(false);
  }

  async function handleLogout() {
    fechar();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="md:hidden" />}
        >
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col gap-4 overflow-y-auto">
          <SheetHeader className="px-1">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Truck className="size-4" />
              </span>
              FRETA
            </SheetTitle>
          </SheetHeader>

          <NavLinks vertical onItemClick={fechar} />

          <Separator />

          <div className="mt-auto flex flex-col gap-2">
            {user ? (
              <>
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                {user.role !== "cliente" && (
                  <Button
                    variant="outline"
                    render={<Link href="/motorista" />}
                    onClick={fechar}
                  >
                    <LayoutDashboard className="size-4" /> Painel do motorista
                  </Button>
                )}
                {user.role === "cliente" && (
                  <Button
                    variant="outline"
                    render={<Link href="/encontrar" />}
                    onClick={fechar}
                  >
                    <Search className="size-4" /> Encontrar motorista
                  </Button>
                )}
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    render={<Link href="/admin" />}
                    onClick={fechar}
                  >
                    <ShieldCheck className="size-4" /> Painel admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    fechar();
                    setDefinicoesAbertas(true);
                  }}
                >
                  <Settings className="size-4" /> Definições da conta
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="size-4" /> Terminar sessão
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    fechar();
                    setEntrarAberto(true);
                  }}
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => {
                    fechar();
                    setContaAberta(true);
                  }}
                >
                  Criar conta
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Modais fora do Sheet: fechar o menu não os desmonta. */}
      <EntrarModal open={entrarAberto} onOpenChange={setEntrarAberto} />
      <CriarContaModal open={contaAberta} onOpenChange={setContaAberta} />
      {user && (
        <DefinicoesContaDialog
          key={user.name}
          open={definicoesAbertas}
          onOpenChange={setDefinicoesAbertas}
          user={{ name: user.name, email: user.email }}
        />
      )}
    </>
  );
}
