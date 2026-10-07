import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Hammer,
  Home,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Truck,
  UserRound,
  Wallet,
  MoveRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hero } from "@/components/landing/hero";
import {
  PRACAS,
  SERVICOS,
  SUPORTE,
  VALOR_CADASTRO_MT,
  VALOR_MENSALIDADE_MT,
  formatMt,
} from "@/lib/freta";

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
    descricao:
      "Mudança de casa, mercadoria, móveis, material de construção ou outro frete.",
  },
  {
    titulo: "Onde está a carga?",
    descricao:
      "Indique a origem, o destino e o tipo de viatura necessária.",
  },
  {
    titulo: "Escolha o motorista certo",
    descricao:
      "Veja motoristas disponíveis na zona, com contactos directos por telefone ou WhatsApp.",
  },
];

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary-text" />
      <span>{children}</span>
    </li>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <Hero />

      {/* Serviços */}
      <section className="py-8 sm:py-10">
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
                    <span className="text-sm font-medium">
                      {servico.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-20 py-10 sm:py-14">
        <div className="text-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/50 bg-primary/10 text-primary-text"
          >
            <Search className="size-3.5" />
            Simples e directo
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Como funciona
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Três passos para o frete sair do ponto A ao ponto B.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {passos.map((passo, i) => (
            <Card key={passo.titulo}>
              <CardContent className="p-6">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
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

      {/* Plataforma: descrição + visual */}
      <section id="plataforma" className="scroll-mt-20 py-10 sm:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <Badge
              variant="outline"
              className="gap-1.5 border-primary/50 bg-primary/10 text-primary-text"
            >
              <Truck className="size-3.5" />A plataforma FRETA
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
              Tudo o que precisa, num só lugar
            </h2>
            <p className="mt-3 text-muted-foreground">
              O FRETA liga quem precisa de transportar a quem tem viatura e
              vontade de trabalhar — com perfis verificados e contacto directo
              entre as partes.
            </p>
            <ul className="mt-5 space-y-3 text-sm sm:text-base">
              <Check>
                <strong>Verificação presencial</strong> — cada motorista é
                confirmado pela nossa equipa na praça.
              </Check>
              <Check>
                <strong>Contacto directo</strong> — telefone e WhatsApp sem
                intermediários nem comissões escondidas.
              </Check>
              <Check>
                <strong>Funciona como aplicação</strong> — instale no telemóvel
                directamente do browser, sem contas de loja.
              </Check>
              <Check>
                <strong>Avaliações reais</strong> — veja as notas de outros
                clientes antes de escolher.
              </Check>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/encontrar" />}>
                <Search className="size-4" />
                Pesquisar motoristas
              </Button>
              <Button variant="outline" render={<Link href="/sobre" />}>
                Saber mais
              </Button>
            </div>
          </div>

          {/* Painel de praças (visual) */}
          <Card className="relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(0,255,85,0.12),transparent_60%)]"
            />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4 text-primary-text" />
                Praças cobertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PRACAS.map((praca, i) => (
                  <span
                    key={praca}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary-text ${
                      i < 3
                        ? "border-primary/50 bg-primary/10 font-medium text-primary-text"
                        : "text-muted-foreground"
                    }`}
                  >
                    {praca}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4 text-center">
                <div>
                  <p className="text-lg font-bold">{PRACAS.length}+</p>
                  <p className="text-xs text-muted-foreground">praças</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{SERVICOS.length}</p>
                  <p className="text-xs text-muted-foreground">serviços</p>
                </div>
                <div>
                  <p className="text-lg font-bold">24/7</p>
                  <p className="text-xs text-muted-foreground">
                    pedidos abertos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FRETA para clientes / FRETA para motoristas */}
      <section className="py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Clientes */}
          <Card className="flex flex-col">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary-text">
                <UserRound className="size-5" />
              </span>
              <CardTitle className="text-xl">FRETA para clientes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Precisa de mudar de casa, levar mercadoria ou mover móveis?
                Encontre quem lhe faça o trabalho hoje mesmo.
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5">
              <ul className="space-y-2.5 text-sm">
                <Check>Pesquise por praça e tipo de carga.</Check>
                <Check>
                  Veja viatura, capacidade e avaliações de cada motorista.
                </Check>
                <Check>
                  Fale directo por telefone ou WhatsApp — sem marcações.
                </Check>
                <Check>
                  <strong>Grátis</strong>: pedir transporte não tem custos.
                </Check>
              </ul>
              <div className="mt-auto">
                <Button
                  className="w-full gap-2"
                  render={<Link href="/encontrar" />}
                >
                  Encontrar motorista
                  <MoveRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Motoristas */}
          <Card className="relative flex flex-col overflow-hidden border-primary/50">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,255,85,0.12),transparent_60%)]"
            />
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary-text">
                <Truck className="size-5" />
              </span>
              <CardTitle className="text-xl">
                FRETA para motoristas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tem viatura? Receba pedidos de transporte na sua zona e
                gere o seu perfil num painel simples.
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-5">
              <ul className="space-y-2.5 text-sm">
                <Check>
                  Perfil <strong>verificado</strong> que gera confiança.
                </Check>
                <Check>
                  Pedidos da sua praça reunidos num só painel.
                </Check>
                <Check>
                  Defina viatura, serviços e preço de referência.
                </Check>
                <Check>
                  Pagamento mensal por M-Pesa / e-Mola.
                </Check>
              </ul>
              <div className="mt-auto space-y-3">
                <p className="rounded-lg border bg-muted/40 px-3 py-2 text-center text-sm">
                  Cadastro de{" "}
                  <strong className="text-primary-text">
                    {formatMt(VALOR_CADASTRO_MT)} MT
                  </strong>{" "}
                  + plano mensal de{" "}
                  <strong className="text-primary-text">
                    {formatMt(VALOR_MENSALIDADE_MT)} MT
                  </strong>
                </p>
                <Button
                  className="w-full gap-2"
                  render={<Link href="/registo" />}
                >
                  Criar conta de motorista
                  <MoveRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-20 py-10 sm:py-14">
        <div className="text-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/50 bg-primary/10 text-primary-text"
          >
            <Wallet className="size-3.5" />
            Planos e preços
          </Badge>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Preços simples e transparentes
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Pedir transporte é grátis. Para motoristas: um cadastro único e um
            plano mensal — sem comissões por viagem.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-4 lg:grid-cols-3">
          {/* Clientes */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Para clientes</CardTitle>
              <p className="text-3xl font-bold">
                Grátis
              </p>
              <p className="text-sm text-muted-foreground">
                Pedir transporte não tem custos.
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="space-y-2 text-sm">
                <Check>Pesquisa ilimitada de motoristas</Check>
                <Check>Contactos directos e gratuitos</Check>
                <Check>Sem necessidade de conta</Check>
                <Check>Avalie o serviço recebido</Check>
              </ul>
              <Button
                variant="outline"
                className="mt-auto w-full"
                render={<Link href="/encontrar" />}
              >
                Encontrar motorista
              </Button>
            </CardContent>
          </Card>

          {/* Cadastro */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">
                Cadastro do motorista
              </CardTitle>
              <p className="text-3xl font-bold">
                {formatMt(VALOR_CADASTRO_MT)} MT
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  único
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Criação e verificação do perfil na plataforma.
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="space-y-2 text-sm">
                <Check>Conta e perfil público</Check>
                <Check>Verificação presencial na praça</Check>
                <Check>Aparece nas pesquisas dos clientes</Check>
                <Check>Painel com pedidos e avaliações</Check>
              </ul>
              <Button
                variant="outline"
                className="mt-auto w-full"
                render={<Link href="/registo" />}
              >
                Criar conta
              </Button>
            </CardContent>
          </Card>

          {/* Plano mensal (destaque) */}
          <Card className="relative flex flex-col border-primary/60 shadow-lg ring-1 ring-primary/30">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Mais escolhido
            </Badge>
            <CardHeader>
              <CardTitle className="text-base">Plano mensal</CardTitle>
              <p className="text-3xl font-bold">
                {formatMt(VALOR_MENSALIDADE_MT)} MT
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  /mês
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Para motoristas activos na plataforma.
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="space-y-2 text-sm">
                <Check>Pedidos ilimitados da sua praça</Check>
                <Check>Activo nas pesquisas o mês todo</Check>
                <Check>Disponibilidade em tempo real</Check>
                <Check>Suporte prioritário por WhatsApp</Check>
              </ul>
              <Button
                className="mt-auto w-full gap-2"
                render={<Link href="/registo" />}
              >
                Começar agora
                <MoveRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
          Pagamentos por M-Pesa / e-Mola, confirmados pela administração. Sem
          comissões por viagem. Precisa de ajuda?{" "}
          <a
            href={`tel:${SUPORTE.telefoneIntl}`}
            className="font-medium text-primary-text hover:underline"
          >
            {SUPORTE.telefoneFormatado}
          </a>
        </p>
      </section>

      {/* Suporte / CTA final */}
      <section className="py-10 sm:py-14">
        <div className="relative overflow-hidden rounded-2xl border bg-muted/40 p-8 text-center sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,85,0.14),transparent_65%)]"
          />
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Fale com a equipa FRETA
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Dúvidas sobre o plano, o cadastro ou um pedido? Suporte directo por
            telefone e WhatsApp.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gap-2"
              render={<a href={`tel:${SUPORTE.telefoneIntl}`} />}
            >
              <Phone className="size-4" />
              {SUPORTE.telefoneFormatado}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              render={
                <a
                  href={SUPORTE.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary-text" />
              Motoristas verificados
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              Avaliações reais
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary-text" />
              Pedidos a qualquer hora
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
