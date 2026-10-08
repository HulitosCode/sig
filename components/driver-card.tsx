"use client";

import { useState, useTransition } from "react";
import {
  BadgeCheck,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { MotoristaResultado } from "@/app/encontrar/actions";
import {
  avaliarMotoristaAction,
  recordContactAction,
} from "@/app/encontrar/actions";
import { SERVICO_LABELS } from "@/lib/freta";

type DriverCardProps = {
  motorista: MotoristaResultado;
  pedidoId: number | null;
};

function normalizarTelefone(t: string): string {
  return t.replace(/[^\d+]/g, "");
}

export function DriverCard({ motorista, pedidoId }: DriverCardProps) {
  const [ratingOpen, setRatingOpen] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [isRatingPending, startRatingTransition] = useTransition();

  const iniciais = motorista.nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function registarContacto(canal: "telefone" | "whatsapp") {
    if (!pedidoId) return
    // Fire-and-forget: associa o pedido ao motorista contactado.
    void recordContactAction(pedidoId, motorista.id, canal)
  }

  const telefone = normalizarTelefone(motorista.telefone)
  const whatsapp = normalizarTelefone(motorista.whatsapp ?? motorista.telefone)

  function submeterAvaliacao() {
    startRatingTransition(async () => {
      try {
        const res = await avaliarMotoristaAction(
          motorista.id,
          pedidoId,
          nota,
          comentario
        );
        if (res.ok) {
          toast.success(res.message ?? "Obrigado pela sua avaliação!");
          setRatingOpen(false);
          setComentario("");
          setNota(5);
        } else {
          toast.error(res.message ?? "Não foi possível enviar a avaliação.");
        }
      } catch {
        toast.error("Erro de ligação. Tente novamente.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {motorista.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={motorista.fotoUrl}
              alt={motorista.nome}
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary-text">
              {iniciais}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-semibold">
                {motorista.nome}
                {/* Selo de perfil verificado (visível para os clientes). */}
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-text">
                  <BadgeCheck className="size-3" />
                  Verificado
                </span>
              </span>
              <Badge
                variant="outline"
                className={
                  motorista.disponibilidade === "disponivel"
                    ? "gap-1 border-primary/50 bg-primary/15 text-primary-text"
                    : motorista.disponibilidade === "ocupado"
                      ? "gap-1 border-yellow-500/50 bg-yellow-500/10 text-yellow-700"
                      : "gap-1 text-muted-foreground"
                }
              >
                <span
                  className={`size-1.5 rounded-full ${
                    motorista.disponibilidade === "disponivel"
                      ? "bg-primary-text"
                      : motorista.disponibilidade === "ocupado"
                        ? "bg-yellow-500"
                        : "bg-muted-foreground"
                  }`}
                />
                {motorista.disponibilidade === "disponivel"
                  ? "Disponível agora"
                  : motorista.disponibilidade === "ocupado"
                    ? "Ocupado"
                    : "Indisponível"}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {motorista.tipoViatura} · {motorista.cargaMax}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="size-3.5" />
                {motorista.praca}
                {motorista.naMinhaZona && (
                  <span className="text-primary-text">(sua zona)</span>
                )}
              </span>
              {motorista.notaMedia > 0 ? (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  {motorista.notaMedia.toFixed(1)}
                  <span className="text-muted-foreground">
                    ({motorista.totalAvaliacoes})
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">Novo na plataforma</span>
              )}
              {motorista.precoKm && (
                <span className="text-muted-foreground">{motorista.precoKm}</span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {motorista.servicos.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {SERVICO_LABELS[s] ?? s}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                render={
                  <a
                    href={`tel:+258${telefone}`}
                    onClick={() => registarContacto("telefone")}
                  />
                }
              >
                <Phone className="size-3.5" /> Ligar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-primary/50 bg-primary/10 text-primary-text hover:bg-primary/20 hover:text-primary-text"
                render={
                  <a
                    href={`https://wa.me/258${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => registarContacto("whatsapp")}
                  />
                }
              >
                <MessageCircle className="size-3.5" /> WhatsApp
              </Button>

              <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
                <DialogTrigger render={<Button size="sm" variant="ghost" className="gap-1.5" />}>
                  <Star className="size-3.5" /> Avaliar
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Avaliar {motorista.nome}</DialogTitle>
                    <DialogDescription>
                      Como foi o serviço? A sua avaliação é anónima.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          aria-label={`Nota ${n}`}
                          onClick={() => setNota(n)}
                          className="rounded p-1"
                        >
                          <Star
                            className={`size-7 ${
                              n <= nota
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comentario">Comentário (opcional)</Label>
                      <Textarea
                        id="comentario"
                        rows={3}
                        maxLength={500}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Pontos positivos, estado da viatura, pontualidade..."
                      />
                    </div>

                    <Button
                      onClick={submeterAvaliacao}
                      disabled={isRatingPending}
                      className="w-full"
                    >
                      {isRatingPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      {isRatingPending ? "A enviar…" : "Enviar avaliação"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
