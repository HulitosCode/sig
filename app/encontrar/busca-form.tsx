"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICOS, PRACAS } from "@/lib/freta";
import { searchMotoristasAction, type MotoristaResultado } from "./actions";
import { DriverCard } from "@/components/driver-card";

const searchFormSchema = z.object({
  tipoCarga: z.string().min(1, "Escolha o tipo de carga."),
  praca: z.string().min(1, "Escolha a praça de origem."),
  origem: z.string().min(2, "Indique onde está a carga."),
  destino: z.string().min(2, "Indique para onde vai."),
  veiculoSugerido: z.string().optional().or(z.literal("")),
  contacto: z.string().optional().or(z.literal("")),
});

type SearchValues = z.infer<typeof searchFormSchema>;

type ResultState = {
  pedidoId?: number;
  motoristas?: MotoristaResultado[];
  message?: string;
  errors?: Record<string, string[]>;
};

export function BuscaForm() {
  const [result, setResult] = useState<ResultState | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SearchValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      tipoCarga: "",
      praca: "",
      origem: "",
      destino: "",
      veiculoSugerido: "",
      contacto: "",
    },
  });

  function onSubmit(values: SearchValues) {
    const fd = new FormData();
    fd.append("tipoCarga", values.tipoCarga);
    fd.append("praca", values.praca);
    fd.append("origem", values.origem);
    fd.append("destino", values.destino);
    fd.append("veiculoSugerido", values.veiculoSugerido ?? "");
    fd.append("contacto", values.contacto ?? "");

    startTransition(async () => {
      const res = await searchMotoristasAction({}, fd);
      setResult(res);
    });
  }

  const motoristas = result?.motoristas ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Precisa transportar alguma coisa?</CardTitle>
          <CardDescription>
            Preencha os dados da sua carga e encontre motoristas disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tipoCarga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O que pretende transportar?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Escolha o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICOS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="praca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onde está a carga? (praça)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Escolha a praça" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRACAS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro / rua da origem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Bairro Costa do Sol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Para onde vai?</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: Matola, Rua da Paz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="veiculoSugerido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viatura necessária (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex.: carrinha 2t" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O seu telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="84 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {result?.message && (
                <p className="text-sm text-destructive" role="alert">
                  {result.message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Encontrar motoristas
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <section aria-live="polite" className="space-y-4">
          <h2 className="text-lg font-semibold">
            {motoristas.length > 0
              ? `${motoristas.length} motorista${motoristas.length > 1 ? "s" : ""} encontrado${motoristas.length > 1 ? "s" : ""}`
              : "Nenhum motorista disponível"}
          </h2>

          {motoristas.length === 0 && !result.message && (
            <p className="text-sm text-muted-foreground">
              Não encontrámos motoristas activos para este serviço nesta praça.
              Tente outra praça ou fique atento — novos motoristas são
              verificados diariamente.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {motoristas.map((m) => (
              <DriverCard key={m.id} motorista={m} pedidoId={result.pedidoId ?? null} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
