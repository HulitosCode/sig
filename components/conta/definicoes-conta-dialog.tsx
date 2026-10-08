"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/password-input";
import { authClient } from "@/lib/auth-client";

type DefinicoesContaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name: string; email: string };
};

/** Erro do better-auth (código/mensagem podem vir em inglês). */
type AuthError = { code?: string; message?: string } | null | undefined;

/** Traduz os códigos comuns do better-auth para pt-MZ; caso contrário, a mensagem. */
function msgErroAuth(erro: AuthError, fallback: string): string {
  const code = erro?.code ?? "";
  const message = erro?.message ?? "";
  if (code === "INVALID_PASSWORD" || /invalid password/i.test(message)) {
    return "Palavra-passe atual incorreta.";
  }
  if (
    code.includes("PASSWORD") &&
    (code.includes("SHORT") || code.includes("WEAK"))
  ) {
    return "A nova palavra-passe deve ter pelo menos 8 caracteres.";
  }
  if (code === "SESSION_EXPIRED") {
    return "Sessão expirada. Volte a entrar.";
  }
  return message || fallback;
}

/** ZodError → mensagens por campo (validação inline). */
function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = issue.path[0]?.toString() ?? "geral";
    if (!erros[campo]) erros[campo] = issue.message;
  }
  return erros;
}

const nomeSchema = z.object({
  nome: z.string().trim().min(2, "Indique o seu nome completo."),
});

const senhaSchema = z
  .object({
    atual: z.string().min(1, "Indique a palavra-passe atual."),
    nova: z
      .string()
      .min(8, "A nova palavra-passe deve ter pelo menos 8 caracteres."),
    confirmar: z.string(),
  })
  .refine((dados) => dados.nova === dados.confirmar, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmar"],
  });

function ErroCampo({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {mensagem}
    </p>
  );
}

/**
 * Definições da conta — partilhado por todos os perfis
 * (cliente, motorista e admin): nome, palavra-passe e exclusão da conta.
 */
export function DefinicoesContaDialog({
  open,
  onOpenChange,
  user,
}: DefinicoesContaDialogProps) {
  const router = useRouter();

  // Perfil (nome)
  const [nome, setNome] = useState(user.name);
  const [errosNome, setErrosNome] = useState<Record<string, string>>({});
  const [nomePending, startNome] = useTransition();

  // Palavra-passe
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmar, setSenhaConfirmar] = useState("");
  const [errosSenha, setErrosSenha] = useState<Record<string, string>>({});
  const [senhaPending, startSenha] = useTransition();

  // Exclusão
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [errosExcluir, setErrosExcluir] = useState<Record<string, string>>({});
  const [excluirPending, startExcluir] = useTransition();

  function fechar(aberto: boolean) {
    if (aberto) {
      // Ao abrir, parte sempre do nome actual (prop pode ter mudado com
      // router.refresh() entretanto — ex.: noutro componente da navbar).
      setNome(user.name);
    } else {
      // Nunca deixar palavras-passe em memória com o diálogo fechado.
      setSenhaAtual("");
      setSenhaNova("");
      setSenhaConfirmar("");
      setSenhaExcluir("");
      setConfirmado(false);
      setErrosNome({});
      setErrosSenha({});
      setErrosExcluir({});
    }
    onOpenChange(aberto);
  }

  async function guardarNome() {
    const parsed = nomeSchema.safeParse({ nome });
    if (!parsed.success) {
      setErrosNome(errosPorCampo(parsed.error));
      return;
    }
    setErrosNome({});
    startNome(async () => {
      const { error } = await authClient.updateUser({ name: parsed.data.nome });
      if (error) {
        toast.error(msgErroAuth(error, "Não foi possível actualizar o nome."));
        return;
      }
      toast.success("Nome actualizado.");
      router.refresh();
    });
  }

  async function alterarSenha() {
    const parsed = senhaSchema.safeParse({
      atual: senhaAtual,
      nova: senhaNova,
      confirmar: senhaConfirmar,
    });
    if (!parsed.success) {
      setErrosSenha(errosPorCampo(parsed.error));
      return;
    }
    setErrosSenha({});
    startSenha(async () => {
      const { error } = await authClient.changePassword({
        currentPassword: parsed.data.atual,
        newPassword: parsed.data.nova,
      });
      if (error) {
        toast.error(
          msgErroAuth(error, "Não foi possível alterar a palavra-passe.")
        );
        return;
      }
      setSenhaAtual("");
      setSenhaNova("");
      setSenhaConfirmar("");
      toast.success("Palavra-passe alterada com sucesso.");
    });
  }

  async function excluirConta() {
    const erros: Record<string, string> = {};
    if (!senhaExcluir.trim()) {
      erros.senha = "Confirme com a sua palavra-passe.";
    }
    if (!confirmado) {
      erros.confirmado = "Marque a confirmação para continuar.";
    }
    setErrosExcluir(erros);
    if (Object.keys(erros).length > 0) return;

    startExcluir(async () => {
      const { error } = await authClient.deleteUser({ password: senhaExcluir });
      if (error) {
        toast.error(msgErroAuth(error, "Não foi possível excluir a conta."));
        return;
      }
      toast.success("Conta excluída. Até breve!");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Definições da conta</DialogTitle>
          <DialogDescription className="truncate">
            {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Perfil — nome */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Nome</h3>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-nome">Nome completo</Label>
              <Input
                id="dc-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={Boolean(errosNome.nome)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void guardarNome();
                }}
              />
              <ErroCampo mensagem={errosNome.nome} />
            </div>
            <Button
              size="sm"
              onClick={() => void guardarNome()}
              disabled={nomePending}
            >
              {nomePending && <Loader2 className="size-4 animate-spin" />}
              Guardar nome
            </Button>
          </section>

          <Separator />

          {/* Palavra-passe */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Palavra-passe</h3>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-senha-atual">Palavra-passe atual</Label>
              <PasswordInput
                id="dc-senha-atual"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                aria-invalid={Boolean(errosSenha.atual)}
              />
              <ErroCampo mensagem={errosSenha.atual} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-senha-nova">Nova palavra-passe</Label>
              <PasswordInput
                id="dc-senha-nova"
                autoComplete="new-password"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                aria-invalid={Boolean(errosSenha.nova)}
              />
              <ErroCampo mensagem={errosSenha.nova} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-senha-confirmar">Confirmar nova palavra-passe</Label>
              <PasswordInput
                id="dc-senha-confirmar"
                autoComplete="new-password"
                value={senhaConfirmar}
                onChange={(e) => setSenhaConfirmar(e.target.value)}
                aria-invalid={Boolean(errosSenha.confirmar)}
              />
              <ErroCampo mensagem={errosSenha.confirmar} />
            </div>
            <Button
              size="sm"
              onClick={() => void alterarSenha()}
              disabled={senhaPending}
            >
              {senhaPending && <Loader2 className="size-4 animate-spin" />}
              Alterar palavra-passe
            </Button>
          </section>

          <Separator />

          {/* Zona de perigo — excluir conta */}
          <section className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <div className="flex items-center gap-2">
              <Trash2 className="size-4 text-destructive" />
              <h3 className="text-sm font-semibold text-destructive">
                Excluir conta
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              A exclusão é permanente: o perfil, os documentos, o histórico e
              todas as imagens são apagados. Esta acção não pode ser desfeita.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="dc-senha-excluir">Palavra-passe</Label>
              <PasswordInput
                id="dc-senha-excluir"
                autoComplete="current-password"
                value={senhaExcluir}
                onChange={(e) => setSenhaExcluir(e.target.value)}
                aria-invalid={Boolean(errosExcluir.senha)}
              />
              <ErroCampo mensagem={errosExcluir.senha} />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="dc-confirmar-exclusao"
                className="flex cursor-pointer items-start gap-2 font-normal"
              >
                <Checkbox
                  id="dc-confirmar-exclusao"
                  checked={confirmado}
                  onCheckedChange={(v) => setConfirmado(v === true)}
                  className="mt-0.5"
                />
                <span className="text-xs">
                  Compreendo que esta acção não pode ser desfeita.
                </span>
              </Label>
              <ErroCampo mensagem={errosExcluir.confirmado} />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void excluirConta()}
              disabled={excluirPending}
            >
              {excluirPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Excluir a minha conta
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
