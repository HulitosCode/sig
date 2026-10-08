"use client";

import { useRouter } from "next/navigation";
import { CriarContaModal } from "@/components/conta/criar-conta-modal";

/**
 * Rota de registo (para links directos da landing/e-mail).
 * Só apresenta o modal de criação de conta; ao fechar, volta à home.
 */
export default function RegistoPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <CriarContaModal open onOpenChange={(v) => { if (!v) router.push("/"); }} />
      <p className="text-sm text-muted-foreground">
        A criar conta… se o formulário não abrir,{" "}
        <button
          type="button"
          className="text-primary-text underline underline-offset-4"
          onClick={() => router.push("/")}
        >
          volte à página inicial
        </button>
        .
      </p>
    </div>
  );
}
