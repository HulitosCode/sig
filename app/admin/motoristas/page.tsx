import type { Metadata } from "next";
import { connection } from "next/server";
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
import { MotoristaAccoes } from "./motorista-accoes";
import { SERVICO_LABELS } from "@/lib/freta";

// Rota de admin: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export const metadata: Metadata = {
  title: "Motoristas",
};

const STATUS_LABEL: Record<string, { label: string; classe: string }> = {
  pendente: { label: "Pendente", classe: "bg-yellow-100 text-yellow-800" },
  ativo: { label: "Activo", classe: "bg-green-100 text-green-800" },
  bloqueado: { label: "Bloqueado", classe: "bg-red-100 text-red-800" },
};

export default async function AdminMotoristasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  await connection(); // dados em tempo real

  const motoristas = await prisma.motorista.findMany({
    where: status ? { status } : undefined,
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

  const filtros = [
    { valor: "", label: "Todos" },
    { valor: "pendente", label: "Pendentes" },
    { valor: "ativo", label: "Activos" },
    { valor: "bloqueado", label: "Bloqueados" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filtros.map((filtro) => (
          <a
            key={filtro.valor}
            href={filtro.valor ? `/admin/motoristas?status=${filtro.valor}` : "/admin/motoristas"}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? "") === filtro.valor
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {filtro.label}
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motorista</TableHead>
                  <TableHead className="hidden md:table-cell">Veículo</TableHead>
                  <TableHead className="hidden md:table-cell">Praça</TableHead>
                  <TableHead>Serviços</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {motoristas.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Sem motoristas para este filtro.
                    </TableCell>
                  </TableRow>
                )}
                {motoristas.map((m) => {
                  const ultimoPagamento = m.pagamentos[0];
                  const pago =
                    ultimoPagamento?.status === "confirmado" &&
                    ultimoPagamento.validoAte != null &&
                    ultimoPagamento.validoAte > new Date();
                  const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.pendente;

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
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.servicos.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {SERVICO_LABELS[s] ?? s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pago ? (
                          <Badge className="bg-green-100 text-green-800">
                            Paga até{" "}
                            {ultimoPagamento?.validoAte?.toLocaleDateString(
                              "pt-PT",
                              { day: "2-digit", month: "2-digit" }
                            )}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-700">
                            Por pagar
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={st.classe}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <MotoristaAccoes motoristaId={m.id} status={m.status} />
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
