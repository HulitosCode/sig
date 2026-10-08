"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setDisponibilidadeAction } from "./actions";

const ESTADOS = [
  { value: "disponivel" as const, label: "Disponível", classe: "bg-green-100 text-green-800 hover:bg-green-200" },
  { value: "ocupado" as const, label: "Ocupado", classe: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
  { value: "indisponivel" as const, label: "Indisponível", classe: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
];

export function DisponibilidadeControl({
  atual,
}: {
  atual: string;
}) {
  const [isPending, startTransition] = useTransition();

  function definir(valor: "disponivel" | "ocupado" | "indisponivel") {
    if (valor === atual) return;
    startTransition(async () => {
      try {
        const r = await setDisponibilidadeAction(valor);
        if (r.success) {
          const rotulo = ESTADOS.find((e) => e.value === valor)?.label ?? "";
          toast.success(`Disponibilidade: ${rotulo}.`);
        } else {
          toast.error(r.message ?? "Não foi possível alterar a disponibilidade.");
        }
      } catch {
        toast.error("Erro de ligação. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Estado de disponibilidade">
      {ESTADOS.map((estado) => (
        <button
          key={estado.value}
          type="button"
          onClick={() => definir(estado.value)}
          disabled={isPending}
          aria-pressed={atual === estado.value}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
            atual === estado.value
              ? estado.classe
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {isPending && atual !== estado.value && (
            <Loader2 className="mr-1 inline size-3 animate-spin" />
          )}
          {estado.label}
        </button>
      ))}
    </div>
  );
}
