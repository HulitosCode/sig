import type { Metadata } from "next";
import { connection } from "next/server";
import {
  BadgeCheck,
  Clock,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VerificacaoBotao } from "@/app/motorista/verificacao-modal";
import { paraVerificacaoValores } from "@/app/motorista/verificacao-valores";
import { VALOR_MENSALIDADE_MT } from "@/lib/freta";

// Rota autenticada: sempre dinâmica (sessão + dados em tempo real).
export const instant = false;

export const metadata: Metadata = {
  title: "O meu perfil",
};

const STATUS: Record<string, { label: string; classe: string }> = {
  pendente: {
    label: "Aguarda verificação",
    classe:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  ativo: {
    label: "Verificado",
    classe: "bg-green-100 text-green-800 dark:bg-primary/15 dark:text-primary",
  },
  bloqueado: {
    label: "Bloqueado",
    classe: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
};

export default async function PerfilPage() {
  await connection(); // sessão/dados em tempo real

  const user = await requireUser("/motorista/perfil");
  const motorista = await prisma.motorista.findUnique({
    where: { userId: user.id },
  });

  const st = STATUS[motorista?.status ?? "pendente"] ?? STATUS.pendente;
  const valores = paraVerificacaoValores(user, motorista);
  const verificado = motorista?.status === "ativo";

  const docs = motorista
    ? [
        Boolean(motorista.biFrenteUrl && motorista.biVersoUrl),
        Boolean(
          motorista.fotoFrenteUrl &&
            motorista.fotoEsquerdaUrl &&
            motorista.fotoDireitaUrl &&
            motorista.fotoTraseiraUrl
        ),
      ]
    : [false, false];
  const biCompleto = docs[0];
  const fotosCompletas = docs[1];
  const enviado = Boolean(motorista?.documentosEnviadosEm);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">O meu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Estes dados aparecem nos resultados de pesquisa dos clientes.
          </p>
        </div>
        <Badge className={st.classe}>
          {verificado && <BadgeCheck className="mr-1 size-3.5" />}
          {st.label}
        </Badge>
      </div>

      {verificado && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary-text" />
          <p>
            O seu perfil está <strong>verificado</strong> e visível para os
            clientes com o selo da FRETA.
          </p>
        </div>
      )}

      {!verificado && motorista?.status === "bloqueado" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p>
            O seu perfil está bloqueado. Contacte a administração
            {motorista.rejeicaoMotivo ? ` — motivo: ${motorista.rejeicaoMotivo}` : ""}.
          </p>
        </div>
      )}

      {!verificado && motorista?.status !== "bloqueado" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">
              {enviado
                ? "Documentos enviados — aguarda validação da administração."
                : "Envie o BI e as fotos do veículo para o perfil ficar visível."}
            </p>
            <p>
              O cadastro é <strong>grátis</strong>. A mensalidade de{" "}
              <strong>{VALOR_MENSALIDADE_MT} MT/mês</strong> é confirmada pela
              administração.
            </p>
            {motorista?.rejeicaoMotivo && (
              <p className="font-medium">
                Motivo da última rejeição: {motorista.rejeicaoMotivo}
              </p>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Dados e documentos</CardTitle>
            <CardDescription>
              Contacto, viatura, BI e fotos do carro.
            </CardDescription>
          </div>
          <VerificacaoBotao
            valores={valores}
            verificado={verificado}
            variant="outline"
          >
            <FileText className="size-4" />
            Abrir formulário
          </VerificacaoBotao>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-md border p-3">
            {biCompleto ? (
              <BadgeCheck className="size-4 shrink-0 text-primary-text" />
            ) : (
              <FileText className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span>
              Documento de identidade (BI){" "}
              <strong>{biCompleto ? "completo" : "em falta"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md border p-3">
            {fotosCompletas ? (
              <BadgeCheck className="size-4 shrink-0 text-primary-text" />
            ) : (
              <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span>
              Fotos do veículo{" "}
              <strong>{fotosCompletas ? "completas" : "em falta"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md border p-3 sm:col-span-2">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <span>
              {enviado
                ? `Submetido em ${motorista?.documentosEnviadosEm?.toLocaleDateString("pt-PT")}`
                : "Ainda não submetido para verificação"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
