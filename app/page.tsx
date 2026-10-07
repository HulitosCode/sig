import Link from "next/link";
import {
  Truck,
  Package,
  Home,
  Hammer,
  Star,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICOS } from "@/lib/freta";

const iconeServico: Record<string, React.ElementType> = {
  mudanca: Home,
  mercadoria: Package,
  moveis: Home,
  construcao: Hammer,
  pesada: Truck,
  outro: Package,
};

const passos = [
  {
    titulo: "O que pretende transportar?",
    descricao: "Mudança de casa, mercadoria, móveis, material de construção ou outro frete.",
  },
  {
    titulo: "Onde está a carga?",
    descricao: "Indique a origem, o destino e o tipo de viatura necessária.",
  },
  {
    titulo: "Escolha o motorista certo",
    descricao: "Veja motoristas disponíveis na zona, com contactos directos por telefone ou WhatsApp.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        {/* Subtil brilho da marca ao fundo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,rgba(0,255,85,0.16),transparent_65%)]"
        />
        <Badge variant="outline" className="gap-1.5 border-primary/50 bg-primary/10 text-primary-text">
          <Truck className="size-3.5" />
          Mudanças, cargas e transporte num só lugar
        </Badge>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Precisa transportar{" "}
          <span className="text-primary-text">alguma coisa</span>?
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Encontre motoristas disponíveis perto de si para mudanças, mercadorias
          e fretes. A tua carga. O motorista certo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/encontrar" />}>
            Encontrar motorista
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/registo" />}>
            Sou motorista — registar
          </Button>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-8">
        <h2 className="text-center text-2xl font-semibold">
          O que pretende transportar?
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SERVICOS.map((servico) => {
            const Icone = iconeServico[servico.value] ?? Package;
            return (
              <Link
                key={servico.value}
                href={`/encontrar?tipo=${servico.value}`}
                className="group"
              >
                <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-primary/5">
                  <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                    <Icone className="size-6 text-primary-text" />
                    <span className="text-sm font-medium">{servico.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-12">
        <h2 className="text-center text-2xl font-semibold">Como funciona</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {passos.map((passo, i) => (
            <Card key={passo.titulo}>
              <CardContent className="p-6">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{passo.titulo}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {passo.descricao}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Exemplo de resultado */}
      <section className="py-8">
        <h2 className="text-center text-2xl font-semibold">
          Encontre o motorista certo
        </h2>
        <div className="mx-auto mt-6 max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary-text">
                  CM
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">Carlos M.</span>
                    <Badge
                      variant="outline"
                      className="gap-1 border-primary/50 bg-primary/15 text-primary-text"
                    >
                      <span className="size-1.5 rounded-full bg-primary-text" />
                      Disponível agora
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Toyota Dyna · 2 toneladas
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5" /> Zimpeto
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      4.8
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                      <Phone className="size-3.5" /> Ligar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Para motoristas */}
      <section className="py-12">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <ShieldCheck className="size-8" />
            <div>
              <h2 className="text-xl font-semibold">É motorista?</h2>
              <p className="mt-1 max-w-xl text-primary-foreground/80">
                Crie o seu perfil, seja verificado pelo admin e receba pedidos
                de frete na sua praça por apenas 120 MT/mês.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/80"
              render={<Link href="/registo" />}
            >
              Criar perfil de motorista
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
