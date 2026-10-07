"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/form-error";
import { atualizarMeuPerfilAction } from "@/app/motorista/actions";
import { PRACAS, SERVICOS } from "@/lib/freta";

export type PerfilValores = {
  nome: string;
  telefone: string;
  whatsapp: string;
  praca: string;
  tipoViatura: string;
  matricula: string;
  cargaMax: string;
  servicos: string[];
  precoKm: string;
  observacoes: string;
  fotoUrl: string;
};

function CampoErro({
  erros,
  campo,
}: {
  erros: Record<string, string[]>;
  campo: string;
}) {
  const lista = erros[campo];
  if (!lista?.length) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {lista[0]}
    </p>
  );
}

/** Formulário de edição do próprio perfil do motorista. */
export function PerfilForm({ valores }: { valores: PerfilValores }) {
  const [state, formAction, isPending] = useActionState(
    atualizarMeuPerfilAction,
    {}
  );
  const [servicos, setServicos] = useState<string[]>(valores.servicos);

  function alternarServico(valor: string, marcado: boolean) {
    setServicos((prev) =>
      marcado ? [...prev, valor] : prev.filter((v) => v !== valor)
    );
  }

  const erros = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={valores.nome}
            autoComplete="name"
            required
          />
          <CampoErro erros={erros} campo="nome" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="84 123 4567"
            defaultValue={valores.telefone}
            required
          />
          <CampoErro erros={erros} campo="telefone" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="84 123 4567"
            defaultValue={valores.whatsapp}
          />
          <CampoErro erros={erros} campo="whatsapp" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="praca">Praça</Label>
          <Select name="praca" defaultValue={valores.praca}>
            <SelectTrigger id="praca" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRACAS.map((praca) => (
                <SelectItem key={praca} value={praca}>
                  {praca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CampoErro erros={erros} campo="praca" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tipoViatura">Tipo de viatura</Label>
          <Input
            id="tipoViatura"
            name="tipoViatura"
            placeholder="ex.: Toyota Dyna"
            defaultValue={valores.tipoViatura}
            required
          />
          <CampoErro erros={erros} campo="tipoViatura" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input
            id="matricula"
            name="matricula"
            placeholder="ex.: ABD-123"
            defaultValue={valores.matricula}
            required
          />
          <CampoErro erros={erros} campo="matricula" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cargaMax">Capacidade de carga</Label>
          <Input
            id="cargaMax"
            name="cargaMax"
            placeholder="ex.: 2 toneladas"
            defaultValue={valores.cargaMax}
            required
          />
          <CampoErro erros={erros} campo="cargaMax" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="precoKm">Preço/km de referência (opcional)</Label>
          <Input
            id="precoKm"
            name="precoKm"
            placeholder="ex.: 25 MT"
            defaultValue={valores.precoKm}
          />
          <CampoErro erros={erros} campo="precoKm" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="fotoUrl">
            Link da fotografia (opcional)
          </Label>
          <Input
            id="fotoUrl"
            name="fotoUrl"
            type="url"
            inputMode="url"
            placeholder="https://..."
            defaultValue={valores.fotoUrl}
          />
          <CampoErro erros={erros} campo="fotoUrl" />
        </div>

        <fieldset className="space-y-1.5 sm:col-span-2">
          <legend className="text-sm font-medium">Serviços</legend>
          <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Hidden inputs: o Checkbox do Base UI não garante input nativo. */}
            {servicos.map((valor) => (
              <input
                key={`hidden-${valor}`}
                type="hidden"
                name="servicos"
                value={valor}
              />
            ))}
            {SERVICOS.map((servico) => {
              const marcado = servicos.includes(servico.value);
              const idServico = `servico-${servico.value}`;
              return (
                <Label
                  key={servico.value}
                  htmlFor={idServico}
                  className="flex cursor-pointer items-center gap-2 rounded-md text-sm font-normal"
                >
                  <Checkbox
                    id={idServico}
                    checked={marcado}
                    onCheckedChange={(checked) =>
                      alternarServico(servico.value, checked === true)
                    }
                  />
                  {servico.label}
                </Label>
              );
            })}
          </div>
          <CampoErro erros={erros} campo="servicos" />
        </fieldset>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="observacoes">Observações (opcional)</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            defaultValue={valores.observacoes}
            className="resize-none"
          />
          <CampoErro erros={erros} campo="observacoes" />
        </div>
      </div>

      {state.message && !state.success && <FormError>{state.message}</FormError>}
      {state.success && state.message && (
        <p
          role="status"
          className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary-text"
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar alterações
        </Button>
      </div>
    </form>
  );
}
