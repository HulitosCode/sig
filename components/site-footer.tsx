import Link from "next/link";
import { InstallPwa } from "@/components/pwa/install-pwa";
import { CurrentYear } from "@/components/current-year";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">FRETA</p>
          <p>A tua carga. O motorista certo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <InstallPwa variant="link" />
          <Link href="/encontrar" className="text-muted-foreground hover:text-primary-text">
            Encontrar motorista
          </Link>
          <Link href="/sobre" className="text-muted-foreground hover:text-primary-text">
            Sobre
          </Link>
          <Link href="/contacto" className="text-muted-foreground hover:text-primary-text">
            Contacto
          </Link>
          <Link href="/termos" className="text-muted-foreground hover:text-primary-text">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="text-muted-foreground hover:text-primary-text">
            Privacidade
          </Link>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        &copy; <CurrentYear /> FRETA. Todos os direitos reservados. Feito em Moçambique.
      </div>
    </footer>
  );
}
