"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MotoristaForm } from "./motorista-form";

/** Botão "Novo motorista" + modal com o formulário de criação. */
export function CriarMotoristaDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="size-4" />
        Novo motorista
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo motorista</DialogTitle>
          <DialogDescription>
            Cria a conta com palavra-passe e o perfil de motorista (fica
            pendente até verificação e pagamento).
          </DialogDescription>
        </DialogHeader>
        <MotoristaForm
          mode="criar"
          onConcluido={() => setOpen(false)}
          onCancelar={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
