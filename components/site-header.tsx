import Link from "next/link";
import { Suspense } from "react";
import { Truck, UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";
import { CriarContaModal } from "@/components/conta/criar-conta-modal";
import { EntrarModal } from "@/components/conta/entrar-modal";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { ThemeMenu } from "@/components/theme-menu";
import { SiteHeaderShell } from "@/components/site-header-shell";

export function SiteHeader() {
  return (
    <SiteHeaderShell>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4">
        {/* Esquerda: menu mobile + marca */}
        <div className="flex items-center gap-1">
          <Suspense fallback={<Skeleton className="size-8 rounded-md" />}>
            <MobileNavSlot />
          </Suspense>
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="size-4" />
            </span>
            <span className="text-lg tracking-tight">FRETA</span>
          </Link>
        </div>

        {/* Centro: navegação principal (desktop) */}
        <NavLinks className="hidden md:flex" />

        {/* Direita: tema + sessão */}
        <div className="flex items-center gap-1.5">
          <ThemeMenu />
          <Suspense
            fallback={
              <div className="flex items-center gap-2" aria-hidden>
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
              </div>
            }
          >
            <UserNav />
          </Suspense>
        </div>
      </div>
      </header>
    </SiteHeaderShell>
  );
}

/** Lê a sessão para o menu mobile (dentro de Suspense — ver UserNav). */
async function MobileNavSlot() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <MobileNav
      user={
        user
          ? { name: user.name, email: user.email, role: user.role ?? "motorista" }
          : null
      }
    />
  );
}

async function UserNav() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <nav className="flex items-center gap-1 sm:gap-2" aria-label="Conta">
      {user ? (
        <UserMenu
          user={{
            name: user.name,
            email: user.email,
            role: user.role ?? "motorista",
          }}
        />
      ) : (
        <>
          <EntrarModal
            trigger="Entrar"
            triggerVariant="ghost"
            triggerClassName="hidden sm:inline-flex"
          />
          <CriarContaModal
            trigger={
              <>
                <UserRound className="size-4" />
                <span>Criar conta</span>
              </>
            }
            triggerClassName="bg-primary text-primary-foreground hover:bg-primary/90"
          />
        </>
      )}
    </nav>
  );
}
