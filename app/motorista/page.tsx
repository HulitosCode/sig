import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import {
  Clock,
  Star,
  Inbox,
  CreditCard,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { SERVICO_LABELS, VALOR_MENSALIDADE_MT } from "@/lib/freta";
import { DisponibilidadeControl } from "./disponibilidade-control";

// Rota autenticada: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export const metadata: Metadata = {
  title: "Painel do motorista",
};

const STATUS_LABEL: Record<string, { label: string; classe: string }> = {
  pendente: {
    label: "Aguarda verificação",
    classe: "bg-yellow-100 text-yellow-800",
  },
  ativo: { label: "Activo", classe: "bg-green-100 text-green-800" },
  bloqueado: { label: "Bloqueado", classe: "bg-red-100 text-red-800" },
};

export default async function MotoristaPage() {
  await connection(); // sessão/dados em tempo real

  const user = await requireUser("/motorista");

  const motorista = await prisma.motorista.findUnique({
    where: { userId: user.id },
    include: {
      pagamentos: { orderBy: { criadoEm: "desc" }, take: 12 },
      avaliacoes: {
        orderBy: { criadoEm: "desc" },
        take: 20,
      },
    },
  });

  if (!motorista) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Complete o seu perfil</h1>
        <p className="mt-2 text-muted-foreground">
          Ainda não tem perfil de motorista. Crie-o para começar a receber
          pedidos na sua praça.
        </p>
        <Button render={<Link href="/registo" />} className="mt-6">
          Criar perfil de motorista
        </Button>
      </div>
    );
  }

  // Pedidos da praça do motorista (os mais recentes) — inclui os que ele
  // contactou directamente.
  const pedidos = await prisma.pedido.findMany({
    where: {
      OR: [{ praca: motorista.praca }, { motoristaId: motorista.id }],
    },
    orderBy: { criadoEm: "desc" },
    take: 30,
  });

  const ultimoPagamento = motorista.pagamentos[0] ?? null;
  const mensalidadePaga =
    ultimoPagamento?.status === "confirmado" &&
    ultimoPagamento.validoAte != null &&
    ultimoPagamento.validoAte > new Date();

  const notas = motorista.avaliacoes.map((a) => a.nota);
  const media = notas.length
    ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10
    : 0;

  const status = STATUS_LABEL[motorista.status] ?? STATUS_LABEL.pendente;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">O meu painel</h1>
          <p className="text-sm text-muted-foreground">
            {motorista.tipoViatura} · {motorista.cargaMax} · {motorista.matricula}
          </p>
        </div>
        <Badge className={status.classe}>{status.label}</Badge>
      </div>

      {/* Estado */}
      {motorista.status !== "ativo" && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">
              O seu perfil ainda não está visível para os clientes.
            </p>
            <p className="mt-1">
              {motorista.status === "pendente"
                ? "A equipa FRETA vai verificar os seus dados presencialmente na praça e confirmar o pagamento da mensalidade (120 MT/mês)."
                : "Contacte a administração para desbloquear o seu perfil."}
            </p>
          </div>
        </div>
      )}

      {/* Disponibilidade + mensalidade */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary-text" /> O meu estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DisponibilidadeControl atual={motorista.disponibilidade} />
            <p className="mt-3 text-sm text-muted-foreground">
              Os clientes vêem o seu estado nos resultados de pesquisa.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-primary-text" /> Mensalidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-medium">{VALOR_MENSALIDADE_MT} MT/mês</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              {mensalidadePaga ? (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle2 className="size-4" /> Paga até{" "}
                  {ultimoPagamento?.validoAte?.toLocaleDateString("pt-PT")}
                </span>
              ) : (
                <span className="text-yellow-700">Por confirmar</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              O pagamento é feito por M-Pesa/e-Mola e confirmado pela
              administração.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">O meu perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Praça</span>
              <p className="flex items-center gap-1 font-medium">
                <MapPin className="size-3.5" /> {motorista.praca}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Contacto</span>
              <p className="font-medium">{motorista.telefone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Preço/km</span>
              <p className="font-medium">{motorista.precoKm || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Avaliação</span>
              <p className="flex items-center gap-1 font-medium">
                {media > 0 ? (
                  <>
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    {media.toFixed(1)} ({notas.length})
                  </>
                ) : (
                  "Sem avaliações"
                )}
              </p>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Serviços</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {motorista.servicos.map((s) => (
                <Badge key={s} variant="secondary">
                  {SERVICO_LABELS[s] ?? s}
                </Badge>
              ))}
            </div>
          </div>
          {motorista.observacoes && (
            <p className="text-muted-foreground">{motorista.observacoes}</p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de pedidos recebidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox className="size-4 text-primary-text" /> Pedidos recebidos (
            {pedidos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não recebeu pedidos na sua zona. Mantenha-se{" "}
              <strong>disponível</strong> para aparecer nas pesquisas dos
              clientes.
            </p>
          ) : (
            pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="rounded-lg border p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {SERVICO_LABELS[pedido.tipoCarga] ?? pedido.tipoCarga}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pedido.criadoEm.toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    {" · "}
                    {pedido.criadoEm.toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {pedido.origem} → {pedido.destino}
                  {pedido.veiculoSugerido && ` · ${pedido.veiculoSugerido}`}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {pedido.contacto ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1"
                        render={
                          <a href={`tel:+258${pedido.contacto.replace(/[^\d]/g, "")}`} />
                        }
                      >
                        <Phone className="size-3" /> Ligar ao cliente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1"
                        render={
                          <a
                            href={`https://wa.me/258${pedido.contacto.replace(/[^\d]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <MessageCircle className="size-3" /> WhatsApp
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Cliente não deixou contacto
                    </span>
                  )}
                  {pedido.motoristaId === motorista.id && (
                    <Badge variant="outline" className="text-xs">
                      Contactado por si
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Avaliações recebidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="size-4 text-primary-text" /> Avaliações (
            {motorista.avaliacoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {motorista.avaliacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não recebeu avaliações.
            </p>
          ) : (
            motorista.avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-3.5 ${
                        n <= avaliacao.nota
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {avaliacao.criadoEm.toLocaleDateString("pt-PT")}
                  </span>
                </div>
                {avaliacao.comentario && (
                  <p className="mt-1 text-muted-foreground">
                    {avaliacao.comentario}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-center text-sm text-muted-foreground">
        Dúvidas? Contacte a administração da FRETA.
      </p>
    </div>
  );
}
