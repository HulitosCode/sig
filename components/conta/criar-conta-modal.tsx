"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";
import { posRegistoAction } from "@/app/(auth)/registo/actions";

type TipoConta = "motorista" | "cliente";

const contaSchema = z
  .object({
    name: z.string().min(2, "Indique o seu nome completo."),
    email: z.string().email("Email inválido."),
    telefone: z.string().optional(),
    whatsapp: z.string().optional(),
    password: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  });

type ContaValues = z.infer<typeof contaSchema>;

type CriarContaModalProps = {
  /** Conteúdo do botão desencadeante (ex.: "Criar conta"). */
  trigger?: ReactNode;
  triggerVariant?: "default" | "ghost" | "outline" | "secondary";
  triggerClassName?: string;
  /** Estado controlado — usado por /registo (auto-abertura). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Modal de criação de conta: escolha motorista/cliente + formulário.
 * Registo grátis (nada é cobrado pelo cadastro).
 */
export function CriarContaModal({
  trigger,
  triggerVariant = "default",
  triggerClassName,
  open,
  onOpenChange,
}: CriarContaModalProps) {
  const router = useRouter();
  const [interno, setInterno] = useState(false);
  const [etapa, setEtapa] = useState<"escolha" | TipoConta>("escolha");
  const [pending, startTransition] = useTransition();

  const controlado = open !== undefined;
  const aberto = controlado ? open : interno;

  function setAberto(v: boolean) {
    if (!controlado) setInterno(v);
    onOpenChange?.(v);
    if (!v) setEtapa("escolha");
  }

  const form = useForm<ContaValues>({
    resolver: zodResolver(contaSchema),
    defaultValues: {
      name: "",
      email: "",
      telefone: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ContaValues) {
    const tipo: TipoConta = etapa === "cliente" ? "cliente" : "motorista";

    if (tipo === "motorista") {
      const telefone = values.telefone?.trim() ?? "";
      if (telefone.length < 9) {
        form.setError("telefone", {
          message: "Indique um telefone válido (ex.: 84 123 4567).",
        });
        return;
      }
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        if (error) {
          toast.error(error.message || "Não foi possível criar a conta.");
          return;
        }

        const res = await posRegistoAction({
          tipo,
          telefone: values.telefone,
          whatsapp: values.whatsapp,
        });
        if (!res.success) {
          toast.error(res.message || "Não foi possível concluir o registo.");
          return;
        }

        toast.success(
          tipo === "motorista"
            ? "Conta criada! Complete a verificação no seu painel."
            : "Conta criada! Veja os motoristas disponíveis no seu painel."
        );
        setAberto(false);
        router.push(tipo === "motorista" ? "/motorista" : "/cliente");
        router.refresh();
      } catch (err) {
        console.error("[Registo] Falha no signup:", err);
        toast.error(
          "Erro de ligação ao servidor. Verifique a internet e tente novamente."
        );
      }
    });
  }

  const motorista = etapa === "motorista";

  return (
    <>
      {trigger ? (
        <Button
          variant={triggerVariant}
          className={triggerClassName}
          disabled={pending}
          onClick={() => setAberto(true)}
        >
          {trigger}
        </Button>
      ) : null}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {etapa === "escolha"
                ? "Criar conta"
                : motorista
                  ? "Conta de motorista"
                  : "Conta de cliente"}
            </DialogTitle>
            <DialogDescription>
              {etapa === "escolha"
                ? "Como quer usar a FRETA?"
                : motorista
                  ? "Crie o seu perfil e receba pedidos de frete na sua zona. Registo grátis."
                  : "Guarde os seus contactos e acompanhe os seus pedidos. Registo grátis."}
            </DialogDescription>
          </DialogHeader>

          {etapa === "escolha" ? (
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setEtapa("motorista")}
                className="group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Truck className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">Sou motorista</span>
                  <span className="block text-sm text-muted-foreground">
                    Envio os meus documentos e o veículo, e recebo pedidos de
                    frete. Cadastro grátis.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEtapa("cliente")}
                className="group flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary/60 hover:bg-primary/5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <UserRound className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">Sou cliente</span>
                  <span className="block text-sm text-muted-foreground">
                    Procuro transporte para mercadorias, mudanças e fretes.
                    Cadastro grátis.
                  </span>
                </span>
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Sem custos de cadastro. Mensalidade de{" "}
                <strong className="text-foreground">480 MT/mês</strong> apenas
                para motoristas activos.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-8"
                  onClick={() => setEtapa("escolha")}
                >
                  <ArrowLeft className="size-4" />
                  Voltar
                </Button>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="O seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="nome@email.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {motorista && (
                  <>
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="84 123 4567"
                              autoComplete="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="84 123 4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavra-passe</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Mínimo 8 caracteres"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar palavra-passe</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Repita a palavra-passe"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {pending ? "A criar conta…" : "Criar conta grátis"}
                </Button>

                <Separator />

                <p className="text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <Link href="/entrar" className="text-primary-text underline-offset-4 hover:underline">
                    Entrar
                  </Link>
                </p>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
