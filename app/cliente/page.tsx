import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { MessageCircle, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { DriverCard } from "@/components/driver-card";
import type { MotoristaResultado } from "@/app/encontrar/actions";

// Rota autenticada: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export const metadata: Metadata = {
  title: "Painel do cliente",
};

// Campos do motorista usados nos cartões (select mínimo partilhado).
const selectMotorista = {
  id: true,
  status: true,
  fotoUrl: true,
  praca: true,
  tipoViatura: true,
  matricula: true,
  cargaMax: true,
  precoKm: true,
  telefone: true,
  whatsapp: true,
  disponibilidade: true,
  servicos: true,
  user: { select: { name: true } },
} as const;

type MotoristaLinha = {
  id: number;
  status: string;
  fotoUrl: string | null;
  praca: string;
  tipoViatura: string;
  matricula: string;
  cargaMax: string;
  precoKm: string | null;
  telefone: string;
  whatsapp: string | null;
  disponibilidade: string;
  servicos: string[];
  user: { name: string };
};

function paraResultado(
  m: MotoristaLinha,
  notas: Map<number, { media: number; total: number }>
): MotoristaResultado {
  const nota = notas.get(m.id);
  return {
    id: m.id,
    nome: m.user.name,
    fotoUrl: m.fotoUrl,
    praca: m.praca,
    tipoViatura: m.tipoViatura,
    matricula: m.matricula,
    cargaMax: m.cargaMax,
    precoKm: m.precoKm,
    telefone: m.telefone,
    whatsapp: m.whatsapp,
    disponibilidade: m.disponibilidade,
    status: m.status,
    servicos: m.servicos,
    notaMedia: nota?.media ?? 0,
    totalAvaliacoes: nota?.total ?? 0,
    naMinhaZona: false,
  };
}

function formatContacto(data: Date): string {
  return new Intl.DateTimeFormat("pt-MZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(data);
}

export default async function ClientePage() {
  await connection(); // sessão/dados em tempo real

  const user = await requireUser("/cliente");

  const [disponiveis, contactos] = await Promise.all([
    // Motoristas activos não-indisponíveis ("já estão disponíveis").
    prisma.motorista.findMany({
      where: { status: "ativo", disponibilidade: { not: "indisponivel" } },
      select: selectMotorista,
    }),
    // Motoristas com quem este cliente já entrou em contacto
    // (registado pelo recordContactAction ao clicar Ligar/WhatsApp).
    prisma.contacto.findMany({
      where: { clienteId: user.id },
      select: {
        canal: true,
        atualizadoEm: true,
        motorista: { select: selectMotorista },
      },
      orderBy: { atualizadoEm: "desc" },
      take: 50,
    }),
  ]);

  // Média de avaliações de todos os motoristas listados (uma consulta).
  const ids = [
    ...new Set([
      ...disponiveis.map((m) => m.id),
      ...contactos.map((c) => c.motorista.id),
    ]),
  ];
  const avaliacoes = ids.length
    ? await prisma.avaliacao.groupBy({
        by: ["motoristaId"],
        where: { motoristaId: { in: ids } },
        _avg: { nota: true },
        _count: { nota: true },
      })
    : [];
  const notas = new Map(
    avaliacoes.map((a) => [
      a.motoristaId,
      {
        media: Math.round((a._avg.nota ?? 0) * 10) / 10,
        total: a._count.nota,
      },
    ])
  );

  // Disponíveis: primeiro os "disponivel", depois melhor avaliados.
  const resultadosDisponiveis = disponiveis
    .map((m) => paraResultado(m, notas))
    .sort((a, b) => {
      const dispA = a.disponibilidade === "disponivel" ? 0 : 1;
      const dispB = b.disponibilidade === "disponivel" ? 0 : 1;
      if (dispA !== dispB) return dispA - dispB;
      return b.notaMedia - a.notaMedia;
    });

  // Contactados: mantém a ordem do histórico (mais recente primeiro).
  const resultadosContactados = contactos.map((c) => ({
    canal: c.canal,
    atualizadoEm: c.atualizadoEm,
    motorista: paraResultado(c.motorista, notas),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            Olá, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Veja os motoristas disponíveis e com quem já falou.
          </p>
        </div>
        <Button render={<Link href="/encontrar" />}>
          <Search className="size-4" /> Encontrar motorista
        </Button>
      </div>

      <section id="contactados" className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="size-5 text-primary-text" />
          Com quem já entrou em contacto
          <span className="text-sm font-normal text-muted-foreground">
            ({resultadosContactados.length})
          </span>
        </h2>

        {resultadosContactados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Ainda não contactou nenhum motorista. Quando ligar ou mandar
                mensagem a um motorista, ele fica guardado aqui.
              </p>
              <Button variant="outline" render={<Link href="/encontrar" />}>
                Procurar motoristas
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {resultadosContactados.map((c) => (
              <div key={c.motorista.id} className="space-y-1">
                <DriverCard motorista={c.motorista} pedidoId={null} />
                <p className="px-1 text-xs text-muted-foreground">
                  Contactado por{" "}
                  {c.canal === "whatsapp" ? "WhatsApp" : "telefone"} ·{" "}
                  {formatContacto(c.atualizadoEm)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="disponiveis" className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Users className="size-5 text-primary-text" />
          Motoristas disponíveis
          <span className="text-sm font-normal text-muted-foreground">
            ({resultadosDisponiveis.length})
          </span>
        </h2>

        {resultadosDisponiveis.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              De momento não há motoristas disponíveis. Tente mais tarde.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {resultadosDisponiveis.map((motorista) => (
              <DriverCard
                key={motorista.id}
                motorista={motorista}
                pedidoId={null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
