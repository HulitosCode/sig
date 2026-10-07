"use client";

import { useState, useTransition } from "react";
import { Eye, Loader2, MapPin, Phone, Trash2, Truck } from "lucide-react";
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
import { removerPedidoAction } from "@/app/admin/actions";
import { SERVICO_LABELS } from "@/lib/freta";

/** Linha serializada da tabela de pedidos (datas em ISO). */
export type PedidoLinha = {
  id: number;
  tipoCarga: string;
  praca: string;
  origem: string;
  destino: string;
  veiculoSugerido: string | null;
  contacto: string | null;
  criadoEm: string;
  motorista: { name: string; telefone: string } | null;
};

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Acções por linha: visualizar (modal) e excluir (confirmação). */
export function PedidoAccoes({ pedido }: { pedido: PedidoLinha }) {
  const [dialogo, setDialogo] = useState<null | "ver" | "remover">(null);
  const [isPending, startTransition] = useTransition();

  const fechar = (open: boolean) => {
    if (!open) setDialogo(null);
  };

  function remover() {
    startTransition(async () => {
      const r = await removerPedidoAction(pedido.id);
      if (r.success) {
        toast.success(r.message ?? "Pedido removido.");
        setDialogo(null);
      } else {
        toast.error(r.message ?? "Não foi possível remover o pedido.");
      }
    });
  }

  return (
    <>
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setDialogo("ver")}
        >
          <Eye />
          <span className="sr-only">Visualizar pedido #{pedido.id}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={() => setDialogo("remover")}
        >
          <Trash2 />
          <span className="sr-only">Excluir pedido #{pedido.id}</span>
        </Button>
      </div>

      {/* Visualizar */}
      <Dialog open={dialogo === "ver"} onOpenChange={fechar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pedido #{pedido.id}</DialogTitle>
            <DialogDescription>
              {SERVICO_LABELS[pedido.tipoCarga] ?? pedido.tipoCarga} ·{" "}
              {formatarDataHora(pedido.criadoEm)}
            </DialogDescription>
          </DialogHeader>

          <dl className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rota
                </dt>
                <dd>
                  {pedido.origem} → {pedido.destino}
                  <span className="text-muted-foreground">
                    {" "}
                    ({pedido.praca})
                  </span>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cliente
                </dt>
                <dd>
                  {pedido.contacto ? (
                    <a
                      href={`tel:${pedido.contacto.replace(/\s/g, "")}`}
                      className="text-primary-text hover:underline"
                    >
                      {pedido.contacto}
                    </a>
                  ) : (
                    "Contacto não fornecido"
                  )}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Motorista
                </dt>
                <dd>
                  {pedido.motorista ? (
                    <>
                      {pedido.motorista.name}
                      <span className="text-muted-foreground">
                        {" "}
                        · {pedido.motorista.telefone}
                      </span>
                    </>
                  ) : (
                    <Badge variant="outline">Ainda sem motorista</Badge>
                  )}
                </dd>
              </div>
            </div>

            {pedido.veiculoSugerido && (
              <div className="text-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Veículo sugerido
                </dt>
                <dd>{pedido.veiculoSugerido}</dd>
              </div>
            )}
          </dl>

          <DialogFooter>
            <Button variant="outline" onClick={() => fechar(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir */}
      <Dialog open={dialogo === "remover"} onOpenChange={fechar}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir pedido #{pedido.id}?</DialogTitle>
            <DialogDescription>
              O pedido “{pedido.origem} → {pedido.destino}” será removido
              permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => fechar(false)}
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
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
