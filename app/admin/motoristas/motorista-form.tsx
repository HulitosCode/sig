"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  criarMotoristaAction,
  atualizarMotoristaAction,
} from "@/app/admin/actions";
import { PRACAS, SERVICOS } from "@/lib/freta";

export type MotoristaValores = {
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  praca: string;
  tipoViatura: string;
  matricula: string;
  cargaMax: string;
  servicos: string[];
  precoKm: string;
  observacoes: string;
};

export const MOTORISTA_VALORES_VAZIOS: MotoristaValores = {
  nome: "",
  email: "",
  telefone: "",
  whatsapp: "",
  praca: "Maputo",
  tipoViatura: "",
  matricula: "",
  cargaMax: "",
  servicos: [],
  precoKm: "",
  observacoes: "",
};

type Props = {
  mode: "criar" | "editar";
  valores?: MotoristaValores;
  motoristaId?: number;
  onConcluido?: () => void;
  onCancelar?: () => void;
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

/** Formulário de motorista usado nos modais criar/editar do admin. */
export function MotoristaForm({
  mode,
  valores,
  motoristaId,
  onConcluido,
  onCancelar,
}: Props) {
  const uid = useId();
  const [errosCampo, setErrosCampo] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const base = { ...MOTORISTA_VALORES_VAZIOS, ...valores };
  const [servicos, setServicos] = useState<string[]>(base.servicos);

  const id = (campo: string) => `${uid}-${campo}`;

  function alternarServico(valor: string, marcado: boolean) {
    setServicos((prev) =>
      marcado ? [...prev, valor] : prev.filter((v) => v !== valor)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (mode === "editar") {
      formData.append("motoristaId", String(motoristaId));
    }

    setErrosCampo({});

    startTransition(async () => {
      try {
        const resultado =
          mode === "criar"
            ? await criarMotoristaAction(formData)
            : await atualizarMotoristaAction(formData);

        if (resultado.success) {
          toast.success(resultado.message ?? "Guardado.");
          onConcluido?.();
        } else {
          toast.error(resultado.message ?? "Verifique os dados do formulário.");
          setErrosCampo(resultado.errors ?? {});
        }
      } catch {
        toast.error("Erro de ligação. Tente novamente.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={id("nome")}>Nome completo</Label>
          <Input
            id={id("nome")}
            name="nome"
            defaultValue={base.nome}
            autoComplete="name"
            required
            aria-invalid={Boolean(errosCampo.nome?.length)}
          />
          <CampoErro erros={errosCampo} campo="nome" />
        </div>

        {mode === "criar" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={id("email")}>Email</Label>
              <Input
                id={id("email")}
                name="email"
                type="email"
                inputMode="email"
                defaultValue={base.email}
                autoComplete="email"
                required
                aria-invalid={Boolean(errosCampo.email?.length)}
              />
              <CampoErro erros={errosCampo} campo="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={id("password")}>Palavra-passe</Label>
              <Input
                id={id("password")}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(errosCampo.password?.length)}
              />
              <CampoErro erros={errosCampo} campo="password" />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor={id("telefone")}>Telefone</Label>
          <Input
            id={id("telefone")}
            name="telefone"
            type="tel"
            inputMode="tel"
            placeholder="84 123 4567"
            defaultValue={base.telefone}
            required
            aria-invalid={Boolean(errosCampo.telefone?.length)}
          />
          <CampoErro erros={errosCampo} campo="telefone" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={id("whatsapp")}>WhatsApp (opcional)</Label>
          <Input
            id={id("whatsapp")}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="84 123 4567"
            defaultValue={base.whatsapp}
          />
          <CampoErro erros={errosCampo} campo="whatsapp" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={id("praca")}>Praça</Label>
          <Select name="praca" defaultValue={base.praca}>
            <SelectTrigger id={id("praca")} className="w-full">
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
          <CampoErro erros={errosCampo} campo="praca" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={id("tipoViatura")}>Tipo de viatura</Label>
          <Input
            id={id("tipoViatura")}
            name="tipoViatura"
            placeholder="ex.: Toyota Dyna"
            defaultValue={base.tipoViatura}
            required
            aria-invalid={Boolean(errosCampo.tipoViatura?.length)}
          />
          <CampoErro erros={errosCampo} campo="tipoViatura" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={id("matricula")}>Matrícula</Label>
          <Input
            id={id("matricula")}
            name="matricula"
            placeholder="ex.: ABD-123"
            defaultValue={base.matricula}
            required
            aria-invalid={Boolean(errosCampo.matricula?.length)}
          />
          <CampoErro erros={errosCampo} campo="matricula" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={id("cargaMax")}>Capacidade de carga</Label>
          <Input
            id={id("cargaMax")}
            name="cargaMax"
            placeholder="ex.: 2 toneladas"
            defaultValue={base.cargaMax}
            required
            aria-invalid={Boolean(errosCampo.cargaMax?.length)}
          />
          <CampoErro erros={errosCampo} campo="cargaMax" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={id("precoKm")}>Preço/km de referência (opcional)</Label>
          <Input
            id={id("precoKm")}
            name="precoKm"
            placeholder="ex.: 25 MT"
            defaultValue={base.precoKm}
          />
          <CampoErro erros={errosCampo} campo="precoKm" />
        </div>

        <fieldset className="space-y-1.5 sm:col-span-2">
          <legend className="text-sm font-medium">Serviços</legend>
          <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Submissão ao servidor: o Checkbox do Base UI não garante
                input nativo no form — usamos hidden inputs. */}
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
              const idServico = id(`servico-${servico.value}`);
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
          <CampoErro erros={errosCampo} campo="servicos" />
        </fieldset>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={id("observacoes")}>
            Observações (opcional)
          </Label>
          <Textarea
            id={id("observacoes")}
            name="observacoes"
            rows={2}
            defaultValue={base.observacoes}
            className="resize-none"
          />
          <CampoErro erros={errosCampo} campo="observacoes" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancelar && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={isPending}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {mode === "criar" ? "Criar motorista" : "Guardar alterações"}
        </Button>
      </div>
    </form>
  );
}
