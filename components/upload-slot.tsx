"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUploadThing } from "@/lib/uploadthing-client";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB (limite do route imageUploader)

type UploadSlotProps = {
  /** id/for do label */
  id: string;
  label: string;
  /** Texto de ajuda curto (ex.: "Frente do veículo"). */
  hint?: string;
  /** URL actual da imagem ("" = sem imagem). */
  url: string;
  /** Chamado quando a imagem carrega ou é removida (novamente ""). */
  onChange: (url: string) => void;
  /** Erro de validação do servidor para este campo. */
  erro?: string;
  /** Indica que a imagem é obrigatória (mostra "*"). */
  obrigatorio?: boolean;
  disabled?: boolean;
};

/** Slot de upload de uma imagem (BI/fotos) com preview e remoção. */
export function UploadSlot({
  id,
  label,
  hint,
  url,
  onChange,
  erro,
  obrigatorio,
  disabled,
}: UploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aUpload, setAUpload] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolha uma imagem (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("A imagem deve ter no máximo 4MB.");
      return;
    }

    setAUpload(true);
    try {
      const res = await startUpload([file]);
      const novo = res?.[0]?.serverData?.url;
      if (!novo) throw new Error("Upload sem URL");
      onChange(novo);
      toast.success("Imagem carregada.");
    } catch (err) {
      console.error("[Upload] Falha:", err);
      toast.error("Falha no upload da imagem. Tente novamente.");
    } finally {
      setAUpload(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm">
        {label}
        {obrigatorio && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled || aUpload}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {url ? (
        <div className="group relative overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="h-32 w-full object-cover"
            loading="lazy"
          />
          {aUpload && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
          <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-7"
              disabled={disabled || aUpload}
              onClick={() => inputRef.current?.click()}
              title="Substituir imagem"
            >
              <RefreshCw className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="size-7"
              disabled={disabled || aUpload}
              onClick={() => onChange("")}
              title="Remover imagem"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || aUpload}
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
        >
          {aUpload ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs font-medium">
            {aUpload ? "A carregar…" : "Escolher imagem"}
          </span>
          {hint && <span className="text-[11px]">{hint}</span>}
        </button>
      )}

      {erro && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
