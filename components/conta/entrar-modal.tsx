"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn } from "lucide-react";
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
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Indique a palavra-passe."),
});

type LoginValues = z.infer<typeof loginSchema>;

type EntrarModalProps = {
  trigger?: ReactNode;
  triggerVariant?: "default" | "ghost" | "outline" | "secondary";
  triggerClassName?: string;
  /** Estado controlado (ex.: aberto pelo menu mobile). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** Modal de login (botão "Entrar" da navbar). */
export function EntrarModal({
  trigger,
  triggerVariant = "ghost",
  triggerClassName,
  open,
  onOpenChange,
}: EntrarModalProps) {
  const router = useRouter();
  const [interno, setInterno] = useState(false);
  const [pending, startTransition] = useTransition();

  const controlado = open !== undefined;
  const aberto = controlado ? open : interno;

  function setAberto(v: boolean) {
    if (!controlado) setInterno(v);
    onOpenChange?.(v);
  }

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    startTransition(async () => {
      try {
        const { error } = await authClient.signIn.email({
          email: values.email.trim(),
          password: values.password,
        });
        if (error) {
          toast.error(error.message || "Email ou palavra-passe incorretos.");
          return;
        }

        // Encaminha conforme o papel da conta.
        const { data } = await authClient.getSession();
        const role =
          (data?.user as { role?: string } | undefined)?.role ?? "motorista";
        const destino =
          role === "admin"
            ? "/admin"
            : role === "cliente"
              ? "/cliente"
              : "/motorista";

        toast.success("Bem-vindo(a) de volta!");
        setAberto(false);
        router.push(destino);
        router.refresh();
      } catch (err) {
        console.error("[Entrar] Falha no login:", err);
        toast.error(
          "Erro de ligação ao servidor. Verifique a internet e tente novamente."
        );
      }
    });
  }

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
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Entrar</DialogTitle>
            <DialogDescription>
              Acesse à sua conta FRETA.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palavra-passe</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="A sua palavra-passe"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                {pending ? "A entrar…" : "Entrar"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link
                  href="/registo"
                  className="text-primary-text underline-offset-4 hover:underline"
                >
                  Criar conta grátis
                </Link>
              </p>

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/esqueci-senha"
                  className="underline-offset-4 hover:underline"
                >
                  Esqueci a palavra-passe
                </Link>
              </p>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
