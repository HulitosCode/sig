import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PerfilForm, type PerfilValores } from "./perfil-form";
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
    label: "Activo",
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

  if (!motorista) {
    return (
      <div className="mx-auto w-full max-w-3xl py-16 text-center">
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

  const st = STATUS[motorista.status] ?? STATUS.pendente;

  const valores: PerfilValores = {
    nome: user.name,
    telefone: motorista.telefone,
    whatsapp: motorista.whatsapp ?? "",
    praca: motorista.praca,
    tipoViatura: motorista.tipoViatura,
    matricula: motorista.matricula,
    cargaMax: motorista.cargaMax,
    servicos: motorista.servicos,
    precoKm: motorista.precoKm ?? "",
    observacoes: motorista.observacoes ?? "",
    fotoUrl: motorista.fotoUrl ?? "",
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">O meu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Estes dados aparecem nos resultados de pesquisa dos clientes.
          </p>
        </div>
        <Badge className={st.classe}>{st.label}</Badge>
      </div>

      {motorista.status === "pendente" && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p>
            O perfil fica visível após verificação presencial na praça e
            confirmação da mensalidade de{" "}
            <strong>{VALOR_MENSALIDADE_MT} MT/mês</strong> pela administração.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do perfil</CardTitle>
          <CardDescription>
            Contacto, viatura, praça e serviços que oferece.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerfilForm valores={valores} />
        </CardContent>
      </Card>
    </div>
  );
}
