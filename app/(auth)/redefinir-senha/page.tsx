"use client";

import { Suspense, useActionState, useEffect } from "react";
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
import { FormError } from "@/components/form-error";
import { PasswordInput } from "@/components/password-input";
import { resetPasswordAction } from "../actions";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
    token: z.string().min(1, "Token em falta."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirForm />
    </Suspense>
  );
}

function RedefinirForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const hasErrorParam = searchParams.get("error") === "INVALID_TOKEN";

  const [state, formAction, isPending] = useActionState(resetPasswordAction, {});

  // Resultados da acção → toast (sucesso redireciona para o login).
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "Palavra-passe redefinida!");
      router.push("/entrar");
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
      token: tokenFromUrl,
    },
    values: {
      newPassword: "",
      confirmPassword: "",
      token: tokenFromUrl,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar nova palavra-passe</CardTitle>
        <CardDescription>
          Escolha uma palavra-passe com pelo menos 8 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tokenFromUrl && (
          <FormError className="mb-4">
            {hasErrorParam
              ? "O link de recuperação é inválido ou expirou. Peça um novo em "
              : "Link de recuperação inválido. Peça um novo em "}
            <Link href="/esqueci-senha" className="underline">
              esquecer a palavra-passe
            </Link>
            .
          </FormError>
        )}

        <Form {...form}>
          <form action={formAction} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input readOnly {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova palavra-passe</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar palavra-passe</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !tokenFromUrl}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "A redefinir…" : "Redefinir palavra-passe"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
