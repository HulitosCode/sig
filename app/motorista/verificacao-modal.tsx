"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  VerificacaoForm,
  type VerificacaoValores,
} from "./perfil/verificacao-form";

type ModalProps = {
  valores: VerificacaoValores;
  verificado: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Conteudo({ valores, verificado, onOpenChange }: Omit<ModalProps, "open">) {
  const router = useRouter();

  return (
    <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {verificado ? "O meu perfil" : "Completar verificação"}
        </DialogTitle>
        <DialogDescription>
          {verificado
            ? "Actualize os seus dados, viatura e documentos."
            : "Preencha os dados do veículo e envie o BI + fotos do carro para o perfil ficar visível."}
        </DialogDescription>
      </DialogHeader>
      <VerificacaoForm
        valores={valores}
        verificado={verificado}
        onConcluido={() => {
          onOpenChange(false);
          router.refresh(); // reflecte os dados revalidados pela acção
        }}
      />
    </DialogContent>
  );
}

/** Modal controlado (usado pelas páginas do painel). */
export function VerificacaoModal(props: ModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <Conteudo {...props} />
    </Dialog>
  );
}

/** Botão + modal (auto-gerido) — abre o formulário de verificação. */
export function VerificacaoBotao({
  valores,
  verificado,
  variant = "default",
  className,
  children,
}: {
  valores: VerificacaoValores;
  verificado: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={variant} className={className} />}>
        {children}
      </DialogTrigger>
      <Conteudo valores={valores} verificado={verificado} onOpenChange={setOpen} />
    </Dialog>
  );
}
