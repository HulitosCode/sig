import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Inbox } from "lucide-react";
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
import { PedidoAccoes, type PedidoLinha } from "./pedido-accoes";
import { SERVICO_LABELS } from "@/lib/freta";
import type { Prisma } from "@/lib/generated/prisma/client";

// Rota de admin: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export const metadata: Metadata = {
  title: "Pedidos",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;
  await connection(); // dados em tempo real

  const filtros = [
    { valor: "", label: "Todos" },
    { valor: "hoje", label: "Hoje" },
    { valor: "7d", label: "7 dias" },
    { valor: "30d", label: "30 dias" },
  ];

  // Janela temporal do filtro.
  let criadoEm: Prisma.PedidoWhereInput["criadoEm"] | undefined;
  const agora = new Date();
  if (periodo === "hoje") {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    criadoEm = { gte: inicio };
  } else if (periodo === "7d") {
    criadoEm = { gte: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000) };
  } else if (periodo === "30d") {
    criadoEm = { gte: new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000) };
  }

  const pedidos = await prisma.pedido.findMany({
    where: criadoEm ? { criadoEm } : undefined,
    orderBy: { criadoEm: "desc" },
    include: {
      motorista: {
        select: { telefone: true, user: { select: { name: true } } },
      },
    },
    take: 200,
  });

  const linhas: PedidoLinha[] = pedidos.map((p) => ({
    id: p.id,
    tipoCarga: p.tipoCarga,
    praca: p.praca,
    origem: p.origem,
    destino: p.destino,
    veiculoSugerido: p.veiculoSugerido,
    contacto: p.contacto,
    criadoEm: p.criadoEm.toISOString(),
    motorista: p.motorista
      ? { name: p.motorista.user.name, telefone: p.motorista.telefone }
      : null,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {linhas.length} {linhas.length === 1 ? "pedido" : "pedidos"} ·
            pedidos de transporte criados pelos clientes.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filtros.map((filtro) => (
          <Link
            key={filtro.valor}
            href={
              filtro.valor ? `/admin/pedidos?periodo=${filtro.valor}` : "/admin/pedidos"
            }
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              (periodo ?? "") === filtro.valor
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {filtro.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Cliente
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Motorista
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhas.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <Inbox className="mx-auto mb-2 size-6 opacity-60" />
                      Sem pedidos neste período.
                    </TableCell>
                  </TableRow>
                )}
                {linhas.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">#{p.id}</div>
                      <Badge variant="secondary" className="text-xs">
                        {SERVICO_LABELS[p.tipoCarga] ?? p.tipoCarga}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {p.origem} → {p.destino}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.praca}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.contacto ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.motorista ? (
                        <div className="text-sm">{p.motorista.name}</div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
                        >
                          Por atribuir
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(p.criadoEm).toLocaleString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <PedidoAccoes pedido={p} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
