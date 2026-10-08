"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, ExternalLink, Loader2, X } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  aprovarMotoristaAction,
  rejeitarVerificacaoAction,
} from "@/app/admin/actions";

export type DocumentosMotorista = {
  id: number;
  status: string;
  user: { name: string; email: string };
  documentosEnviadosEm: string | null;
  verificadoEm: string | null;
  rejeicaoMotivo: string | null;
  biFrenteUrl: string | null;
  biVersoUrl: string | null;
  fotoFrenteUrl: string | null;
  fotoEsquerdaUrl: string | null;
  fotoDireitaUrl: string | null;
  fotoTraseiraUrl: string | null;
};

function Foto({
  url,
  legenda,
}: {
  url: string | null;
  legenda: string;
}) {
  if (!url) {
    return (
      <div className="space-y-1">
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
          Sem imagem
        </div>
        <p className="text-xs font-medium">{legenda}</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block h-32 overflow-hidden rounded-lg border"
        title="Abrir em tamanho real"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={legenda} className="h-full w-full object-cover" />
        <span className="absolute right-1.5 top-1.5 rounded-md bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100">
          <ExternalLink className="size-3" />
        </span>
      </a>
      <p className="text-xs font-medium">{legenda}</p>
    </div>
  );
}

/** Modal de revisão dos documentos: BI + fotos do veículo + aprovar/rejeitar. */
export function DocumentosDialog({
  motorista,
  open,
  onOpenChange,
}: {
  motorista: DocumentosMotorista;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [modo, setModo] = useState<"ver" | "rejeitar">("ver");
  const [motivo, setMotivo] = useState("");
  const [isPending, startTransition] = useTransition();

  function fechar(v: boolean) {
    if (!v) {
      setModo("ver");
      setMotivo("");
    }
    onOpenChange(v);
  }

  function aprovar() {
    startTransition(async () => {
      try {
        const r = await aprovarMotoristaAction(motorista.id);
        if (r.success) {
          toast.success(r.message ?? "Perfil verificado.");
          fechar(false);
        } else {
          toast.error(r.message ?? "A acção falhou.");
        }
      } catch {
        toast.error("Erro de ligação. Tente novamente.");
      }
    });
  }

  function rejeitar() {
    startTransition(async () => {
      try {
        const r = await rejeitarVerificacaoAction(motorista.id, motivo);
        if (r.success) {
          toast.success(r.message ?? "Documentos rejeitados.");
          fechar(false);
        } else {
          toast.error(r.message ?? "A acção falhou.");
        }
      } catch {
        toast.error("Erro de ligação. Tente novamente.");
      }
    });
  }

  const temDocs = Boolean(
    motorista.biFrenteUrl ||
      motorista.biVersoUrl ||
      motorista.fotoFrenteUrl ||
      motorista.fotoEsquerdaUrl ||
      motorista.fotoDireitaUrl ||
      motorista.fotoTraseiraUrl
  );
  const verificado = motorista.status === "ativo";

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Documentos de {motorista.user.name}
            {verificado && (
              <Badge className="bg-green-100 text-green-800 dark:bg-primary/15 dark:text-primary">
                <BadgeCheck className="size-3.5" /> Verificado
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {motorista.user.email}
            {motorista.documentosEnviadosEm &&
              ` · submetido em ${new Date(motorista.documentosEnviadosEm).toLocaleDateString("pt-PT")}`}
            {!motorista.documentosEnviadosEm && " · ainda não submeteu documentos"}
          </DialogDescription>
        </DialogHeader>

        {!temDocs ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Este motorista ainda não enviou o BI nem as fotos do veículo.
          </div>
        ) : modo === "ver" ? (
          <div className="space-y-4">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Documento de identidade (BI)</h3>
              <div className="grid grid-cols-2 gap-3">
                <Foto url={motorista.biFrenteUrl} legenda="BI — frente" />
                <Foto url={motorista.biVersoUrl} legenda="BI — verso" />
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Fotos do veículo</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Foto url={motorista.fotoFrenteUrl} legenda="Frente" />
                <Foto url={motorista.fotoEsquerdaUrl} legenda="Esquerdo" />
                <Foto url={motorista.fotoDireitaUrl} legenda="Direito" />
                <Foto url={motorista.fotoTraseiraUrl} legenda="Traseira" />
              </div>
            </section>

            {motorista.rejeicaoMotivo && !verificado && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                <strong>Última rejeição:</strong> {motorista.rejeicaoMotivo}
              </p>
            )}
            {verificado && motorista.verificadoEm && (
              <p className="text-xs text-muted-foreground">
                Verificado em{" "}
                {new Date(motorista.verificadoEm).toLocaleDateString("pt-PT")}.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="motivo-rejeicao">Motivo da rejeição</Label>
            <Textarea
              id="motivo-rejeicao"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="ex.: Foto da frente do veículo desfocada / BI ilegível…"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              O motivo é enviado por email ao motorista.
            </p>
          </div>
        )}

        <DialogFooter>
          {modo === "rejeitar" ? (
            <>
              <Button
                variant="outline"
                onClick={() => setModo("ver")}
                disabled={isPending}
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={rejeitar}
                disabled={isPending || motivo.trim().length < 5}
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                <X className="size-4" />
                Confirmar rejeição
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => fechar(false)}
                disabled={isPending}
              >
                Fechar
              </Button>
              {!verificado && (
                <>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                    onClick={() => setModo("rejeitar")}
                    disabled={isPending}
                  >
                    Rejeitar
                  </Button>
                  <Button onClick={aprovar} disabled={isPending || !temDocs}>
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    <BadgeCheck className="size-4" />
                    Aprovar verificação
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
