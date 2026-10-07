"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/form-error";
import { PasswordInput } from "@/components/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { SERVICOS, PRACAS } from "@/lib/freta";
import { saveMotoristaProfileAction } from "./actions";

const registerSchema = z
  .object({
    name: z.string().min(2, "Indique o seu nome completo."),
    email: z.string().email("Email inválido."),
    telefone: z
      .string()
      .min(9, "Indique um telefone válido (ex.: 84 123 4567).")
      .max(20),
    whatsapp: z.string().max(20).optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
    confirmPassword: z.string(),
    praca: z.string().min(1, "Escolha a sua praça."),
    tipoViatura: z.string().min(2, "Indique o tipo de viatura."),
    matricula: z.string().min(2, "Indique a matrícula."),
    cargaMax: z.string().min(1, "Indique a capacidade de carga."),
    servicos: z.array(z.string()).min(1, "Escolha pelo menos um serviço."),
    precoKm: z.string().optional().or(z.literal("")),
    observacoes: z.string().optional().or(z.literal("")),
    fotoUrl: z
      .string()
      .url("Link inválido (use https://...).")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

type ActionState = { success?: boolean; message?: string; errors?: Record<string, string[]> };

export default function RegistoPage() {
  const router = useRouter();
  const [step, setStep] = useState<"conta" | "perfil">("conta");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [profileResult, setProfileResult] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();
  const [profilePending, startProfileTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      telefone: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
      praca: "",
      tipoViatura: "",
      matricula: "",
      cargaMax: "",
      servicos: [],
      precoKm: "",
      observacoes: "",
      fotoUrl: "",
    },
  });

  function buildProfileFormData(values: RegisterValues): FormData {
    const fd = new FormData();
    fd.append("telefone", values.telefone);
    fd.append("whatsapp", values.whatsapp ?? "");
    fd.append("praca", values.praca);
    fd.append("tipoViatura", values.tipoViatura);
    fd.append("matricula", values.matricula);
    fd.append("cargaMax", values.cargaMax);
    for (const s of values.servicos) fd.append("servicos", s);
    fd.append("precoKm", values.precoKm ?? "");
    fd.append("observacoes", values.observacoes ?? "");
    fd.append("fotoUrl", values.fotoUrl ?? "");
    return fd;
  }

  function onSubmit(values: RegisterValues) {
    setSignupError(null);

    if (step === "conta") {
      startTransition(async () => {
        const { error } = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        if (error) {
          setSignupError(error.message || "Não foi possível criar a conta.");
          return;
        }
        setStep("perfil");
        router.refresh();
      });
      return;
    }

    // Passo 2 — guarda o perfil de motorista na base de dados.
    startProfileTransition(async () => {
      const result = await saveMotoristaProfileAction({}, buildProfileFormData(values));
      setProfileResult(result);
    });
  }

  if (profileResult?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary-text" />
            Registo enviado!
          </CardTitle>
          <CardDescription>
            Obrigado. A nossa equipa vai verificar o seu perfil e confirmar o
            pagamento da mensalidade (120 MT) para activar a sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/motorista" />} className="w-full">
            Ir para o meu painel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta de motorista</CardTitle>
        <CardDescription>
          {step === "conta"
            ? "Passo 1 de 2 — os seus dados de acesso."
            : "Passo 2 de 2 — o seu veículo e serviços."}
        </CardDescription>
        {/* Indicador visual de progresso dos 2 passos. */}
        <div className="mt-1 flex gap-1.5" aria-hidden>
          <span
            className={
              "h-1.5 flex-1 rounded-full transition-colors " +
              (step === "conta" ? "bg-primary" : "bg-primary/70")
            }
          />
          <span
            className={
              "h-1.5 flex-1 rounded-full transition-colors " +
              (step === "perfil" ? "bg-primary" : "bg-muted")
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            {step === "conta" ? (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Carlos Mucavele"
                          autoComplete="name"
                          autoFocus
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            inputMode="tel"
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
                            inputMode="tel"
                            placeholder="84 123 4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Palavra-passe</FormLabel>
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
                </div>

                <FormError>{signupError}</FormError>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "A criar conta…" : "Continuar"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Conta criada. Agora conte-nos sobre o seu veículo.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="praca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Praça / zona</FormLabel>
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
                    name="cargaMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidade de carga</FormLabel>
                        <FormControl>
                          <Input placeholder="2 toneladas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoViatura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de viatura</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota Dyna" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula</FormLabel>
                        <FormControl>
                          <Input placeholder="AB-12-CD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="servicos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serviços que realiza</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {SERVICOS.map((servico) => (
                          <label
                            key={servico.value}
                            className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted/50"
                          >
                            <Checkbox
                              checked={field.value.includes(servico.value)}
                              onCheckedChange={(checked) => {
                                const set = new Set(field.value);
                                if (checked) set.add(servico.value);
                                else set.delete(servico.value);
                                field.onChange([...set]);
                              }}
                            />
                            {servico.label}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="precoKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por km (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="50 MT/km" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fotoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto (link, opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Link da fotografia do motorista ou da viatura.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Zonas de cobertura, horário, experiência..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormError>{profileResult?.success ? null : profileResult?.message}</FormError>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={profilePending}
                  >
                    {profilePending && <Loader2 className="size-4 animate-spin" />}
                    {profilePending ? "A submeter…" : "Submeter registo"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("conta")}
                    disabled={profilePending}
                  >
                    Voltar
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>

        {step === "conta" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/entrar" className="text-primary-text hover:underline">
              Entrar
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
