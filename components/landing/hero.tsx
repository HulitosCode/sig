"use client";

import Link from "next/link";
import { MoveDown, MoveRight, Phone, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreBadges } from "@/components/store-badges";
import { AppMockup } from "@/components/landing/app-mockup";
import { SUPORTE } from "@/lib/freta";

/** Herói da landing: 2 colunas, CTAs, botões de loja e mockup da app. */
export function Hero() {
  const scrollToFeatures = () => {
    document
      .getElementById("como-funciona")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-14 lg:py-16">
      {/* Subtil brilho da marca ao fundo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_top,rgba(0,255,85,0.18),transparent_65%)]"
      />

      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Conteúdo */}
        <div className="flex flex-col gap-6 text-left">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 border-primary/50 bg-primary/10 text-primary-text"
          >
            <Truck className="size-3.5" />
            Mobilidade feita para Moçambique!
          </Badge>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-primary-text">A TUA CARGA,</span>
              <span className="block">O MOTORISTA CERTO</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Mudanças, mercadorias e fretes com motoristas verificados na sua
              praça — fale directamente por telefone ou WhatsApp, sem
              intermediários.
            </p>
          </div>

          {/* Botões de acção */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4">
            <Button
              size="lg"
              className="group w-full gap-2 sm:w-auto"
              render={<Link href="/encontrar" />}
            >
              Encontrar motorista
              <MoveRight className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group w-full gap-2 sm:w-auto"
              onClick={scrollToFeatures}
            >
              Ver como funciona
              <MoveDown className="transition-transform group-hover:translate-y-1" />
            </Button>
          </div>

          {/* Descarregar a app */}
          <div className="border-t pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Descarrega a nossa aplicação
            </p>
            <StoreBadges />
          </div>

          {/* Confiança + suporte */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary-text" />
              Motoristas verificados
            </span>
            <a
              href={`tel:${SUPORTE.telefoneIntl}`}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Phone className="size-4" />
              {SUPORTE.telefoneFormatado}
            </a>
          </div>
        </div>

        {/* Mockup da aplicação */}
        <AppMockup />
      </div>
    </section>
  );
}
