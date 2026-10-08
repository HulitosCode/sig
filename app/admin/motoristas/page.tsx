import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MotoristaAccoes,
  STATUS_MOTORISTA,
  type MotoristaLinha,
} from "./motorista-accoes";
import { CriarMotoristaDialog } from "./criar-motorista-dialog";
import { SERVICO_LABELS, SUPORTE } from "@/lib/freta";
import { MessageCircle, Phone } from "lucide-react";

// Rota de admin: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export const metadata: Metadata = {
  title: "Motoristas",
};

export default async function AdminMotoristasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; docs?: string }>;
}) {
  const { status, docs } = await searchParams;
  await connection(); // dados em tempo real

  // docs=1 → apenas quem enviou documentos e aguarda validação.
  const aguardamVerificacao = docs === "1";

  const motoristas = await prisma.motorista.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(aguardamVerificacao
        ? { status: "pendente", documentosEnviadosEm: { not: null } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      pagamentos: {
        orderBy: { criadoEm: "desc" },
        take: 1,
      },
    },
    take: 200,
  });

  const linhas: MotoristaLinha[] = motoristas.map((m) => {
    const pg = m.pagamentos[0];
    return {
      id: m.id,
      status: m.status,
      telefone: m.telefone,
      whatsapp: m.whatsapp,
      praca: m.praca,
      tipoViatura: m.tipoViatura,
      modelo: m.modelo,
      ano: m.ano,
      matricula: m.matricula,
      cargaMax: m.cargaMax,
      servicos: m.servicos,
      precoKm: m.precoKm,
      observacoes: m.observacoes,
      createdAt: m.createdAt.toISOString(),
      documentosEnviadosEm: m.documentosEnviadosEm?.toISOString() ?? null,
      verificadoEm: m.verificadoEm?.toISOString() ?? null,
      rejeicaoMotivo: m.rejeicaoMotivo,
      biFrenteUrl: m.biFrenteUrl,
      biVersoUrl: m.biVersoUrl,
      fotoFrenteUrl: m.fotoFrenteUrl,
      fotoEsquerdaUrl: m.fotoEsquerdaUrl,
      fotoDireitaUrl: m.fotoDireitaUrl,
      fotoTraseiraUrl: m.fotoTraseiraUrl,
      user: m.user,
      ultimoPagamento: pg
        ? {
            valor: pg.valor,
            status: pg.status,
            pagoEm: pg.pagoEm?.toISOString() ?? null,
            validoAte: pg.validoAte?.toISOString() ?? null,
          }
        : null,
    };
  });

  const filtros = [
    { valor: "", label: "Todos" },
    { valor: "pendente", label: "Pendentes" },
    { valor: "ativo", label: "Verificados" },
    { valor: "bloqueado", label: "Bloqueados" },
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho + criar */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Motoristas</h1>
          <p className="text-sm text-muted-foreground">
            {linhas.length} {linhas.length === 1 ? "perfil" : "perfis"} ·
            verificação, mensalidades e contactos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${SUPORTE.telefoneIntl}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Phone className="size-3.5" />
            <span className="hidden sm:inline">{SUPORTE.telefoneFormatado}</span>
          </a>
          <a
            href={SUPORTE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MessageCircle className="size-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <CriarMotoristaDialog />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filtros.map((filtro) => (
          <Link
            key={filtro.valor}
            href={
              filtro.valor
                ? `/admin/motoristas?status=${filtro.valor}`
                : "/admin/motoristas"
            }
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !aguardamVerificacao && (status ?? "") === filtro.valor
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {filtro.label}
          </Link>
        ))}
        <Link
          href="/admin/motoristas?docs=1"
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            aguardamVerificacao
              ? "border-primary bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Aguardam verificação
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motorista</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Veículo
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Praça
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Serviços
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Mensalidade
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Verificação
                  </TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Sem motoristas para este filtro.
                    </TableCell>
                  </TableRow>
                )}
                {linhas.map((m) => {
                  const pg = m.ultimoPagamento;
                  const pago =
                    pg?.status === "confirmado" &&
                    pg.validoAte != null &&
                    new Date(pg.validoAte) > new Date();
                  const st =
                    STATUS_MOTORISTA[m.status] ?? STATUS_MOTORISTA.pendente;

                  const verificacao =
                    m.status === "ativo"
                      ? {
                          label: "Verificado",
                          classe:
                            "bg-green-100 text-green-800 dark:bg-primary/15 dark:text-primary",
                        }
                      : m.rejeicaoMotivo
                        ? {
                            label: "Rejeitado",
                            classe:
                              "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
                          }
                        : m.documentosEnviadosEm
                          ? {
                              label: "Em análise",
                              classe:
                                "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
                            }
                          : {
                              label: "Por enviar",
                              classe:
                                "border text-muted-foreground",
                            };

                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{m.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.user.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {m.telefone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">{m.tipoViatura}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.matricula} · {m.cargaMax}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {m.praca}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {m.servicos.slice(0, 3).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-xs"
                            >
                              {SERVICO_LABELS[s] ?? s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {pago ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-primary/15 dark:text-primary">
                            Paga até{" "}
                            {new Date(pg!.validoAte!).toLocaleDateString(
                              "pt-PT",
                              { day: "2-digit", month: "2-digit" }
                            )}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
                          >
                            Por pagar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={st.classe}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={verificacao.classe}
                        >
                          {verificacao.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <MotoristaAccoes motorista={m} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
