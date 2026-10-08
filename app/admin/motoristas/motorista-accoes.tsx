"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Ban,
  BadgeCheck,
  CreditCard,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aprovarMotoristaAction,
  bloquearMotoristaAction,
  confirmarPagamentoAction,
  rejeitarMotoristaAction,
  removerMotoristaAction,
} from "@/app/admin/actions";
import {
  SERVICO_LABELS,
  VALOR_MENSALIDADE_MT,
  formatMt,
} from "@/lib/freta";
import { MotoristaForm, type MotoristaValores } from "./motorista-form";
import { DocumentosDialog } from "./documentos-dialog";

/** Linha serializada da tabela (datas em ISO — passáveis ao cliente). */
export type MotoristaLinha = {
  id: number;
  status: string;
  telefone: string;
  whatsapp: string | null;
  praca: string;
  tipoViatura: string;
  modelo: string | null;
  ano: number | null;
  matricula: string;
  cargaMax: string;
  servicos: string[];
  precoKm: string | null;
  observacoes: string | null;
  createdAt: string;
  documentosEnviadosEm: string | null;
  verificadoEm: string | null;
  rejeicaoMotivo: string | null;
  biFrenteUrl: string | null;
  biVersoUrl: string | null;
  fotoFrenteUrl: string | null;
  fotoEsquerdaUrl: string | null;
  fotoDireitaUrl: string | null;
  fotoTraseiraUrl: string | null;
  user: { name: string; email: string };
  ultimoPagamento: {
    valor: number;
    status: string;
    pagoEm: string | null;
    validoAte: string | null;
  } | null;
};

// Os Server Components também usam os valores — vêm do módulo partilhado,
// porque exportá-los daqui ("use client") daria uma client reference.
import { STATUS_MOTORISTA } from "./status-motorista";

function formatarData(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type Props = { motorista: MotoristaLinha };
type OpenChange = (open: boolean) => void;

type Dialogo =
  | null
  | "ver"
  | "editar"
  | "remover"
  | "pagamento"
  | "documentos";

/** Acções por linha: menu ⋯ com visualizar, editar, pagamentos e estado. */
export function MotoristaAccoes({ motorista }: Props) {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [isPending, startTransition] = useTransition();

  const fechar: OpenChange = (open) => {
    if (!open) setDialogo(null);
  };

  function executar(fn: () => Promise<{ success?: boolean; message?: string }>) {
    startTransition(async () => {
      const r = await fn();
      if (r.success) toast.success(r.message ?? "Feito.");
      else toast.error(r.message ?? "A acção falhou.");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="size-8" />}
        >
          <MoreHorizontal />
          <span className="sr-only">Acções de {motorista.user.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => setDialogo("ver")}>
            <Eye className="size-4" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogo("documentos")}>
            <BadgeCheck className="size-4" />
            Ver documentos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogo("editar")}>
            <Pencil className="size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogo("pagamento")}>
            <CreditCard className="size-4" />
            Registar pagamento
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {motorista.status !== "ativo" && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => executar(() => aprovarMotoristaAction(motorista.id))}
            >
              <BadgeCheck className="size-4" />
              Aprovar perfil
            </DropdownMenuItem>
          )}
          {motorista.status === "ativo" && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                executar(() => bloquearMotoristaAction(motorista.id, true))
              }
            >
              <Ban className="size-4" />
              Bloquear
            </DropdownMenuItem>
          )}
          {motorista.status === "bloqueado" && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                executar(() => bloquearMotoristaAction(motorista.id, false))
              }
            >
              <Undo2 className="size-4" />
              Desbloquear
            </DropdownMenuItem>
          )}
          {motorista.status !== "pendente" && (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => executar(() => rejeitarMotoristaAction(motorista.id))}
            >
              <Undo2 className="size-4" />
              Devolver a pendente
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDialogo("remover")}
          >
            <Trash2 className="size-4" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <VerMotoristaDialog
        open={dialogo === "ver"}
        onOpenChange={fechar}
        motorista={motorista}
        onEditar={() => setDialogo("editar")}
      />
      <DocumentosDialog
        motorista={motorista}
        open={dialogo === "documentos"}
        onOpenChange={fechar}
      />
      <EditarMotoristaDialog
        open={dialogo === "editar"}
        onOpenChange={fechar}
        motorista={motorista}
      />
      <PagamentoDialog
        motoristaId={motorista.id}
        open={dialogo === "pagamento"}
        onOpenChange={fechar}
      />
      <RemoverMotoristaDialog
        open={dialogo === "remover"}
        onOpenChange={fechar}
        motorista={motorista}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Visualizar
// ---------------------------------------------------------------------------

function Info({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

function VerMotoristaDialog({
  open,
  onOpenChange,
  motorista,
  onEditar,
}: Props & { open: boolean; onOpenChange: OpenChange; onEditar: () => void }) {
  const st = STATUS_MOTORISTA[motorista.status] ?? STATUS_MOTORISTA.pendente;
  const pg = motorista.ultimoPagamento;
  const pago =
    pg?.status === "confirmado" &&
    pg.validoAte != null &&
    new Date(pg.validoAte) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{motorista.user.name}</DialogTitle>
          <DialogDescription>{motorista.user.email}</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
          <Info rotulo="Estado">
            <Badge className={st.classe}>{st.label}</Badge>
          </Info>
          <Info rotulo="Praça">{motorista.praca}</Info>
          <Info rotulo="Telefone">
            <a
              href={`tel:${motorista.telefone.replace(/\s/g, "")}`}
              className="text-primary-text hover:underline"
            >
              {motorista.telefone}
            </a>
          </Info>
          <Info rotulo="WhatsApp">
            {motorista.whatsapp ? (
              <a
                href={`https://wa.me/258${motorista.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-text hover:underline"
              >
                {motorista.whatsapp}
              </a>
            ) : (
              "—"
            )}
          </Info>
          <Info rotulo="Viatura">
            {motorista.tipoViatura} · {motorista.matricula}
          </Info>
          <Info rotulo="Capacidade">{motorista.cargaMax}</Info>
          <Info rotulo="Preço/km">{motorista.precoKm || "—"}</Info>
          <Info rotulo="Mensalidade">
            {pago ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-primary/15 dark:text-primary">
                Paga até {formatarData(pg?.validoAte ?? null)}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
              >
                Por pagar
              </Badge>
            )}
          </Info>

          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Serviços
            </dt>
            <dd className="mt-1.5 flex flex-wrap gap-1">
              {motorista.servicos.map((s) => (
                <Badge key={s} variant="secondary">
                  {SERVICO_LABELS[s] ?? s}
                </Badge>
              ))}
            </dd>
          </div>

          {motorista.observacoes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Observações
              </dt>
              <dd className="mt-0.5">{motorista.observacoes}</dd>
            </div>
          )}

          <div className="sm:col-span-2 text-xs text-muted-foreground">
            Registado em {formatarData(motorista.createdAt)}
            {pg?.pagoEm ? ` · Último pagamento ${formatarData(pg.pagoEm)}` : ""}
          </div>
        </dl>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEditar();
            }}
          >
            <Pencil className="size-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Editar
// ---------------------------------------------------------------------------

function EditarMotoristaDialog({
  open,
  onOpenChange,
  motorista,
}: Props & { open: boolean; onOpenChange: OpenChange }) {
  const valores: MotoristaValores = {
    nome: motorista.user.name,
    email: motorista.user.email,
    telefone: motorista.telefone,
    whatsapp: motorista.whatsapp ?? "",
    praca: motorista.praca,
    tipoViatura: motorista.tipoViatura,
    matricula: motorista.matricula,
    cargaMax: motorista.cargaMax,
    servicos: motorista.servicos,
    precoKm: motorista.precoKm ?? "",
    observacoes: motorista.observacoes ?? "",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar motorista</DialogTitle>
          <DialogDescription>
            Dados do perfil de {motorista.user.name}.
          </DialogDescription>
        </DialogHeader>
        <MotoristaForm
          mode="editar"
          motoristaId={motorista.id}
          valores={valores}
          onConcluido={() => onOpenChange(false)}
          onCancelar={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Pagamento
// ---------------------------------------------------------------------------

function PagamentoDialog({
  motoristaId,
  open,
  onOpenChange,
}: {
  motoristaId: number;
  open: boolean;
  onOpenChange: OpenChange;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const resultado = await confirmarPagamentoAction({}, formData);
        if (resultado.success) {
          toast.success(resultado.message ?? "Pagamento registado.");
          onOpenChange(false);
        } else {
          toast.error(resultado.message ?? "Não foi possível registar o pagamento.");
        }
      } catch {
        toast.error("Erro de ligação. Tente novamente.");
      }
    });
  }

  const periodos = [1, 3, 6, 12];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar pagamento</DialogTitle>
          <DialogDescription>
            Registe a mensalidade de {formatMt(VALOR_MENSALIDADE_MT)} MT recebida
            (M-Pesa / e-Mola).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="motoristaId" value={motoristaId} />
          <div className="space-y-1.5">
            <Select name="meses" defaultValue="1">
              <SelectTrigger className="w-full" aria-label="Período pago">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((meses) => (
                  <SelectItem key={meses} value={String(meses)}>
                    {meses} {meses === 1 ? "mês" : "meses"} —{" "}
                    {formatMt(VALOR_MENSALIDADE_MT * meses)} MT
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Remover
// ---------------------------------------------------------------------------

function RemoverMotoristaDialog({
  open,
  onOpenChange,
  motorista,
}: Props & { open: boolean; onOpenChange: OpenChange }) {
  const [isPending, startTransition] = useTransition();

  function remover() {
    startTransition(async () => {
      const r = await removerMotoristaAction(motorista.id);
      if (r.success) {
        toast.success(r.message ?? "Motorista removido.");
        onOpenChange(false);
      } else {
        toast.error(r.message ?? "Não foi possível remover.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remover motorista?</DialogTitle>
          <DialogDescription>
            {motorista.user.name} ({motorista.user.email}) e a conta associada
            serão removidos. Os pedidos ficam sem motorista atribuído.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={remover}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
