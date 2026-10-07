import Link from "next/link";
import { Mail, MessageCircle, Phone, Truck } from "lucide-react";
import { InstallPwa } from "@/components/pwa/install-pwa";
import { CurrentYear } from "@/components/current-year";
import { StoreBadges } from "@/components/store-badges";
import { SUPORTE } from "@/lib/freta";

const colunas: { titulo: string; links: { href: string; label: string }[] }[] = [
  {
    titulo: "Produto",
    links: [
      { href: "/encontrar", label: "Encontrar motorista" },
      { href: "/#planos", label: "Planos e preços" },
      { href: "/#como-funciona", label: "Como funciona" },
      { href: "/#plataforma", label: "A plataforma" },
    ],
  },
  {
    titulo: "Conta",
    links: [
      { href: "/entrar", label: "Entrar" },
      { href: "/registo", label: "Criar conta de motorista" },
      { href: "/motorista", label: "Painel do motorista" },
    ],
  },
  {
    titulo: "Empresa",
    links: [
      { href: "/sobre", label: "Sobre" },
      { href: "/contacto", label: "Contacto" },
      { href: "/termos", label: "Termos de uso" },
      { href: "/privacidade", label: "Privacidade" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Marca + lojas */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Truck className="size-4" />
            </span>
            <span className="text-lg tracking-tight">FRETA</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            A tua carga. O motorista certo. Transporte e fretes em Moçambique.
          </p>
          <StoreBadges />
        </div>

        {/* Navegação */}
        {colunas.map((coluna) => (
          <nav key={coluna.titulo} aria-label={coluna.titulo}>
            <h3 className="text-sm font-semibold">{coluna.titulo}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {coluna.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Suporte */}
        <div>
          <h3 className="text-sm font-semibold">Suporte</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={`tel:${SUPORTE.telefoneIntl}`}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary-text"
              >
                <Phone className="size-4 shrink-0" />
                {SUPORTE.telefoneFormatado}
              </a>
            </li>
            <li>
              <a
                href={SUPORTE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary-text"
              >
                <MessageCircle className="size-4 shrink-0" />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="mailto:info@freta.co.mz"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary-text"
              >
                <Mail className="size-4 shrink-0" />
                info@freta.co.mz
              </a>
            </li>
          </ul>
          <div className="mt-3">
            <InstallPwa variant="link" />
          </div>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        &copy; <CurrentYear /> FRETA. Todos os direitos reservados. Feito em
        Moçambique.
      </div>
    </footer>
  );
}
