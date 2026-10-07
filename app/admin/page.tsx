import { connection } from "next/server";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, Inbox, Banknote, MapPin } from "lucide-react";

// Rota de admin: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export default async function AdminHomePage() {
  await connection(); // dados em tempo real — nunca prerenderizar

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const trintaDias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalMotoristas, activos, pendentes, pagamentosMes, pedidosRecentes] =
    await Promise.all([
      prisma.motorista.count(),
      prisma.motorista.count({ where: { status: "ativo" } }),
      prisma.motorista.count({ where: { status: "pendente" } }),
      prisma.pagamento.aggregate({
        where: { status: "confirmado", pagoEm: { gte: inicioMes } },
        _sum: { valor: true },
        _count: { id: true },
      }),
      prisma.pedido.findMany({
        where: { criadoEm: { gte: trintaDias } },
        select: { praca: true },
      }),
    ]);

  // Procura por região (últimos 30 dias).
  const porRegiao = new Map<string, number>();
  for (const p of pedidosRecentes) {
    porRegiao.set(p.praca, (porRegiao.get(p.praca) ?? 0) + 1);
  }
  const regioesOrdenadas = [...porRegiao.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const stats = [
    {
      titulo: "Motoristas activos",
      valor: activos,
      icone: Truck,
    },
    {
      titulo: "Aguardam verificação",
      valor: pendentes,
      icone: Clock,
    },
    {
      titulo: "Pedidos (30 dias)",
      valor: pedidosRecentes.length,
      icone: Inbox,
    },
    {
      titulo: `Receita de ${agora.toLocaleDateString("pt-PT", { month: "long" })}`,
      valor: `${pagamentosMes._sum.valor ?? 0} MT`,
      icone: Banknote,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.titulo}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.titulo}
              </CardTitle>
              <stat.icone className="size-4 text-primary-text" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.valor}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary-text" /> Procura por região
              (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regioesOrdenadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem pedidos nos últimos 30 dias.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Praça</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regioesOrdenadas.map(([praca, total]) => (
                    <TableRow key={praca}>
                      <TableCell>{praca}</TableCell>
                      <TableCell className="text-right">{total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total de motoristas</span>
              <Badge variant="secondary">{totalMotoristas}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pagamentos este mês</span>
              <Badge variant="secondary">{pagamentosMes._count.id}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Mensalidade unitária
              </span>
              <Badge variant="secondary">120 MT</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
