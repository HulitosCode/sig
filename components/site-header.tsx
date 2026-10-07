import Link from "next/link";
import { Suspense } from "react";
import { Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-4" />
          </span>
          <span className="text-lg tracking-tight">FRETA</span>
        </Link>

        {/* A sessão lê headers() — dentro de Suspense para não bloquear o
            prerender estático do shell (PPR no Next.js 16). */}
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
    </header>
  );
}

async function UserNav() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" render={<Link href="/encontrar" />} className="hidden sm:inline-flex">
        Encontrar motorista
      </Button>
      {user ? (
        <UserMenu user={{ name: user.name, email: user.email, role: user.role ?? "motorista" }} />
      ) : (
        <>
          <Button variant="ghost" render={<Link href="/entrar" />}>
            Entrar
          </Button>
          <Button render={<Link href="/registo" />}>
            <UserRound className="size-4" />
            <span className="hidden sm:inline">Sou motorista</span>
            <span className="sm:hidden">Registar</span>
          </Button>
        </>
      )}
    </nav>
  );
}
