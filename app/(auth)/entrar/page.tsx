"use client";

import { Suspense, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Indique a palavra-passe."),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    startTransition(async () => {
      try {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
        });
        if (error) {
          toast.error(error.message || "Email ou palavra-passe incorretos.");
          return;
        }

        // Encaminha conforme o papel (ou ?next=…).
        const next = searchParams.get("next");
        const { data } = await authClient.getSession();
        const role =
          (data?.user as { role?: string } | undefined)?.role ?? "motorista";
        const destino =
          next && next.startsWith("/")
            ? next
            : role === "admin"
              ? "/admin"
              : role === "cliente"
                ? "/"
                : "/motorista";

        toast.success("Bem-vindo(a) de volta!");
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
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Aceda à sua conta FRETA (motorista, cliente ou administrador).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="nome@exemplo.com"
                      autoComplete="email"
                      autoFocus
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
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "A entrar…" : "Entrar"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link href="/esqueci-senha" className="text-primary-text hover:underline">
            Esqueceu a palavra-passe?
          </Link>
          <p className="text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/registo" className="text-primary-text hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
