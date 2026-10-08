"use client";

import { useEffect, useActionState, useRef, useState } from "react";
import { Loader2, Save, Send } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { UploadSlot } from "@/components/upload-slot";
import {
  submeterVerificacaoAction,
  removerImagemAction,
} from "@/app/motorista/actions";
import {
  PROVINCIAS,
  PRACAS,
  PRACAS_INFO,
  SERVICOS,
  TIPOS_CARRO,
  pracasDaProvincia,
  type PracaValue,
} from "@/lib/freta";

export type VerificacaoValores = {
  nome: string;
  telefone: string;
  whatsapp: string;
  provincia: string;
  praca: string;
  rotaDestino: string;
  tipoViatura: string;
  modelo: string;
  ano: string;
  matricula: string;
  cargaMax: string;
  servicos: string[];
  precoKm: string;
  observacoes: string;
  fotoUrl: string;
  biFrenteUrl: string;
  biVersoUrl: string;
  fotoFrenteUrl: string;
  fotoEsquerdaUrl: string;
  fotoDireitaUrl: string;
  fotoTraseiraUrl: string;
};

// Imagens do formulário: docs de verificação + fotografia de perfil
// (todas pelo mesmo caminho de upload/remoção).
type DocCampo =
  | "fotoUrl"
  | "biFrenteUrl"
  | "biVersoUrl"
  | "fotoFrenteUrl"
  | "fotoEsquerdaUrl"
  | "fotoDireitaUrl"
  | "fotoTraseiraUrl";

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

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{titulo}</h3>
        {descricao && (
          <p className="text-xs text-muted-foreground">{descricao}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Formulário completo de verificação: perfil + viatura + BI + fotos do carro.
 * Usado dentro do modal do painel do motorista.
 */
export function VerificacaoForm({
  valores,
  verificado,
  onConcluido,
}: {
  valores: VerificacaoValores;
  verificado: boolean;
  onConcluido?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    submeterVerificacaoAction,
    {}
  );
  const [servicos, setServicos] = useState<string[]>(valores.servicos);
  // Província em estado: filtra as praças em cascata (select controlado).
  // A praça guardada é a fonte de verdade (linhas antigas sem província).
  const [provincia, setProvincia] = useState<string>(
    (valores.praca && PRACAS_INFO[valores.praca as PracaValue]?.provincia) ||
      valores.provincia ||
      PROVINCIAS[0]
  );
  const [docs, setDocs] = useState<Record<DocCampo, string>>({
    fotoUrl: valores.fotoUrl,
    biFrenteUrl: valores.biFrenteUrl,
    biVersoUrl: valores.biVersoUrl,
    fotoFrenteUrl: valores.fotoFrenteUrl,
    fotoEsquerdaUrl: valores.fotoEsquerdaUrl,
    fotoDireitaUrl: valores.fotoDireitaUrl,
    fotoTraseiraUrl: valores.fotoTraseiraUrl,
  });

  // onConcluido via ref: evita re-disparar o effect por identidade instável.
  const concluidoRef = useRef(onConcluido);
  useEffect(() => {
    concluidoRef.current = onConcluido;
  });

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success(state.message);
      concluidoRef.current?.();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  function alternarServico(valor: string, marcado: boolean) {
    setServicos((prev) =>
      marcado ? [...prev, valor] : prev.filter((v) => v !== valor)
    );
  }

  function alterarDoc(campo: DocCampo, novo: string) {
    const anterior = docs[campo];
    setDocs((prev) => ({ ...prev, [campo]: novo }));
    if (anterior && anterior !== novo) {
      void removerImagemAction(anterior); // limpa a imagem antiga no servidor
    }
  }

  const erros = state.errors ?? {};
  const obrigatorio = !verificado;
  const tipos = TIPOS_CARRO.includes(valores.tipoViatura as never)
    ? [...TIPOS_CARRO]
    : valores.tipoViatura
      ? [valores.tipoViatura, ...TIPOS_CARRO]
      : [...TIPOS_CARRO];

  // Praças da província em selecção (cascata). A praça guardada manda:
  // se pertencer a outra província (linhas antigas), seguimos a praça.
  const pracasDaProv = pracasDaProvincia(provincia);
  const pracaInicial =
    valores.praca && pracasDaProv.includes(valores.praca as PracaValue)
      ? valores.praca
      : pracasDaProv[0];

  return (
    <form action={formAction} noValidate className="space-y-5">
      <Secao titulo="Conta e contacto">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="v-nome">Nome completo</Label>
          <Input
            id="v-nome"
            name="nome"
            defaultValue={valores.nome}
            autoComplete="name"
            required
          />
          <CampoErro erros={erros} campo="nome" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-telefone">Telefone</Label>
          <Input
            id="v-telefone"
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
          <Label htmlFor="v-whatsapp">WhatsApp (opcional)</Label>
          <Input
            id="v-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="84 123 4567"
            defaultValue={valores.whatsapp}
          />
          <CampoErro erros={erros} campo="whatsapp" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <UploadSlot
            id="v-fotoUrl"
            label="Fotografia de perfil (opcional)"
            hint="JPG/PNG até 4MB"
            url={docs.fotoUrl}
            onChange={(v) => alterarDoc("fotoUrl", v)}
            erro={erros.fotoUrl?.[0]}
            disabled={isPending}
          />
          <input type="hidden" name="fotoUrl" value={docs.fotoUrl} />
        </div>
      </Secao>

      <Separator />

      <Secao
        titulo="Localização e rota"
        descricao="Onde está e para onde vai — os pedidos com origem/destino compatíveis são distribuídos primeiro."
      >
        <div className="space-y-1.5">
          <Label htmlFor="v-provincia">Província</Label>
          <Select
            name="provincia"
            value={provincia}
            onValueChange={(v) => {
              // Base UI envia string | null — só manda para estado válido.
              if (v) setProvincia(v);
            }}
          >
            <SelectTrigger id="v-provincia" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVINCIAS.map((prov) => (
                <SelectItem key={prov} value={prov}>
                  {prov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CampoErro erros={erros} campo="provincia" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="v-praca">Praça</Label>
          {/* key: remonta ao mudar a província e repõe o valor válido. */}
          <Select key={provincia} name="praca" defaultValue={pracaInicial}>
            <SelectTrigger id="v-praca" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pracasDaProv.map((praca) => (
                <SelectItem key={praca} value={praca}>
                  {praca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CampoErro erros={erros} campo="praca" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="v-rotaDestino">
            Destino da rota (opcional)
          </Label>
          <Select name="rotaDestino" defaultValue={valores.rotaDestino || undefined}>
            <SelectTrigger id="v-rotaDestino" className="w-full">
              <SelectValue placeholder="Sem rota definida" />
            </SelectTrigger>
            <SelectContent>
              {PRACAS.map((praca) => (
                <SelectItem key={praca} value={praca}>
                  De {valores.praca || "sua praça"} para {praca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CampoErro erros={erros} campo="rotaDestino" />
          <p className="text-xs text-muted-foreground">
            Se costuma fazer um trajecto (ex.: Maputo → Matola), indique o
            destino — os clientes que vão para lá aparecem-lhe primeiro.
          </p>
        </div>
      </Secao>

      <Separator />

      <Secao titulo="Viatura" descricao="Dados do veículo que vai usar nos fretes.">
        <div className="space-y-1.5">
          <Label htmlFor="v-tipoViatura">Tipo de carro</Label>
          <Select
            name="tipoViatura"
            defaultValue={valores.tipoViatura || TIPOS_CARRO[0]}
          >
            <SelectTrigger id="v-tipoViatura" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tipos.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CampoErro erros={erros} campo="tipoViatura" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="v-modelo">Modelo</Label>
          <Input
            id="v-modelo"
            name="modelo"
            placeholder="ex.: Toyota Dyna"
            defaultValue={valores.modelo}
          />
          <CampoErro erros={erros} campo="modelo" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="v-ano">Ano</Label>
          <Input
            id="v-ano"
            name="ano"
            inputMode="numeric"
            maxLength={4}
            placeholder="ex.: 2018"
            defaultValue={valores.ano}
          />
          <CampoErro erros={erros} campo="ano" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="v-matricula">Matrícula</Label>
          <Input
            id="v-matricula"
            name="matricula"
            placeholder="ex.: ABD-123"
            defaultValue={valores.matricula}
            required
          />
          <CampoErro erros={erros} campo="matricula" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="v-cargaMax">Capacidade de carga</Label>
          <Input
            id="v-cargaMax"
            name="cargaMax"
            placeholder="ex.: 2 toneladas"
            defaultValue={valores.cargaMax}
            required
          />
          <CampoErro erros={erros} campo="cargaMax" />
        </div>
      </Secao>

      <Separator />

      <Secao titulo="Serviços e preço">
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
              const idServico = `v-servico-${servico.value}`;
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

        <div className="space-y-1.5">
          <Label htmlFor="v-precoKm">Preço/km de referência (opcional)</Label>
          <Input
            id="v-precoKm"
            name="precoKm"
            placeholder="ex.: 25 MT"
            defaultValue={valores.precoKm}
          />
          <CampoErro erros={erros} campo="precoKm" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="v-observacoes">Observações (opcional)</Label>
          <Textarea
            id="v-observacoes"
            name="observacoes"
            rows={3}
            defaultValue={valores.observacoes}
            className="resize-none"
          />
          <CampoErro erros={erros} campo="observacoes" />
        </div>
      </Secao>

      <Separator />

      <Secao
        titulo="Documento de identidade (BI)"
        descricao="Frente e verso — obrigatório para a verificação."
      >
        <UploadSlot
          id="v-biFrenteUrl"
          label="BI — frente"
          hint="JPG/PNG até 4MB"
          url={docs.biFrenteUrl}
          onChange={(v) => alterarDoc("biFrenteUrl", v)}
          erro={erros.biFrenteUrl?.[0]}
          obrigatorio={obrigatorio}
          disabled={isPending}
        />
        <UploadSlot
          id="v-biVersoUrl"
          label="BI — verso"
          hint="JPG/PNG até 4MB"
          url={docs.biVersoUrl}
          onChange={(v) => alterarDoc("biVersoUrl", v)}
          erro={erros.biVersoUrl?.[0]}
          obrigatorio={obrigatorio}
          disabled={isPending}
        />
        <input type="hidden" name="biFrenteUrl" value={docs.biFrenteUrl} />
        <input type="hidden" name="biVersoUrl" value={docs.biVersoUrl} />
      </Secao>

      <Secao
        titulo="Fotos do veículo"
        descricao="Frente, lado esquerdo, lado direito e traseira — obrigatório para a verificação."
      >
        <UploadSlot
          id="v-fotoFrenteUrl"
          label="Frente"
          hint="JPG/PNG até 4MB"
          url={docs.fotoFrenteUrl}
          onChange={(v) => alterarDoc("fotoFrenteUrl", v)}
          erro={erros.fotoFrenteUrl?.[0]}
          obrigatorio={obrigatorio}
          disabled={isPending}
        />
        <UploadSlot
          id="v-fotoEsquerdaUrl"
          label="Lado esquerdo"
          hint="JPG/PNG até 4MB"
          url={docs.fotoEsquerdaUrl}
          onChange={(v) => alterarDoc("fotoEsquerdaUrl", v)}
          erro={erros.fotoEsquerdaUrl?.[0]}
          obrigatorio={obrigatorio}
          disabled={isPending}
        />
        <UploadSlot
          id="v-fotoDireitaUrl"
          label="Lado direito"
          hint="JPG/PNG até 4MB"
          url={docs.fotoDireitaUrl}
          onChange={(v) => alterarDoc("fotoDireitaUrl", v)}
          erro={erros.fotoDireitaUrl?.[0]}
          obrigatorio={obrigatorio}
          disabled={isPending}
        />
        <UploadSlot
          id="v-fotoTraseiraUrl"
          label="Traseira"
          hint="JPG/PNG até 4MB"
          url={docs.fotoTraseiraUrl}
          onChange={(v) => alterarDoc("fotoTraseiraUrl", v)}
          erro={erros.fotoTraseiraUrl?.[0]}
          obrigatorio={obrigatorio}
          disabled={isPending}
        />
        <input type="hidden" name="fotoFrenteUrl" value={docs.fotoFrenteUrl} />
        <input
          type="hidden"
          name="fotoEsquerdaUrl"
          value={docs.fotoEsquerdaUrl}
        />
        <input type="hidden" name="fotoDireitaUrl" value={docs.fotoDireitaUrl} />
        <input
          type="hidden"
          name="fotoTraseiraUrl"
          value={docs.fotoTraseiraUrl}
        />
      </Secao>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : verificado ? (
          <Save className="size-4" />
        ) : (
          <Send className="size-4" />
        )}
        {isPending
          ? "A guardar…"
          : verificado
            ? "Guardar alterações"
            : "Enviar para verificação"}
      </Button>

      {!verificado && (
        <p className="text-center text-xs text-muted-foreground">
          Após o envio, a administração valida os documentos e o perfil fica
          visível com o selo <strong className="text-foreground">Verificado</strong>.
        </p>
      )}
    </form>
  );
}
