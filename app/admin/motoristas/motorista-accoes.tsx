"use client";

import { useActionState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  aprovarMotoristaAction,
  rejeitarMotoristaAction,
  bloquearMotoristaAction,
  removerMotoristaAction,
  confirmarPagamentoAction,
} from "@/app/admin/actions";

type Props = {
  motoristaId: number;
  status: string;
};

export function MotoristaAccoes({ motoristaId, status }: Props) {
  const [isPending, startTransition] = useTransition();

  function executar(fn: () => Promise<{ success?: boolean; message?: string }>) {
    startTransition(async () => {
      await fn();
    });
  }

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {status !== "ativo" && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => executar(() => aprovarMotoristaAction(motoristaId))}
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Aprovar
        </Button>
      )}
      {status === "ativo" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => executar(() => bloquearMotoristaAction(motoristaId, true))}
        >
          Bloquear
        </Button>
      )}
      {status === "bloqueado" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => executar(() => bloquearMotoristaAction(motoristaId, false))}
        >
          Desbloquear
        </Button>
      )}
      {status !== "pendente" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => executar(() => rejeitarMotoristaAction(motoristaId))}
        >
          Rejeitar
        </Button>
      )}
      <PagamentoDialog motoristaId={motoristaId} />
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        disabled={isPending}
        onClick={() => {
          if (confirm("Remover este motorista e todos os seus dados?")) {
            executar(() => removerMotoristaAction(motoristaId));
          }
        }}
      >
        Remover
      </Button>
    </div>
  );
}

export function PagamentoDialog({ motoristaId }: { motoristaId: number }) {
  const [state, formAction, isPending] = useActionState(
    confirmarPagamentoAction,
    {}
  );

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="secondary" />}>
        Pagamento
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar pagamento</DialogTitle>
          <DialogDescription>
            Registe a mensalidade de 120 MT recebida (M-Pesa / e-Mola).
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="motoristaId" value={motoristaId} />
          <div className="space-y-2">
            <Label htmlFor="meses">Período pago</Label>
            <Select name="meses" defaultValue="1">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 mês — 120 MT</SelectItem>
                <SelectItem value="3">3 meses — 360 MT</SelectItem>
                <SelectItem value="6">6 meses — 720 MT</SelectItem>
                <SelectItem value="12">12 meses — 1.440 MT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state?.message && (
            <p
              className={`text-sm ${state.success ? "text-green-600" : "text-destructive"}`}
              role="alert"
            >
              {state.message}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
