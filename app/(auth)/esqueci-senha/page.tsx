"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
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
import { FormError } from "@/components/form-error";
import { requestPasswordResetAction } from "../actions";

const schema = z.object({
  email: z.string().email("Email inválido."),
});

type Values = z.infer<typeof schema>;

export default function EsqueciSenhaPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    {}
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (state?.success) form.reset();
  }, [state, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar palavra-passe</CardTitle>
        <CardDescription>
          Indique o email da sua conta e enviaremos as instruções de
          recuperação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-6 text-center">
            <MailCheck className="size-8 text-primary-text" aria-hidden />
            <p className="text-sm font-medium">{state.message}</p>
            <p className="text-xs text-muted-foreground">
              Se não encontrar o email, verifique a caixa de spam.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form action={formAction} noValidate className="space-y-4">
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

              <FormError>
                {state?.success ? null : state?.message}
              </FormError>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isPending ? "A enviar…" : "Enviar instruções"}
              </Button>
            </form>
          </Form>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/entrar" className="text-primary-text hover:underline">
            Voltar a iniciar sessão
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
