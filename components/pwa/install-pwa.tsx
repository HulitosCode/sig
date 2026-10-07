"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

// Deteccão de modo standalone (app instalada) via sistema externo ao React.
function subscribeStandalone(callback: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari expõe navigator.standalone (não é padrão TS)
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function getServerStandaloneSnapshot() {
  return false;
}

type InstallPwaProps = {
  /** `button` (default) mostra botão; `link` mostra acção discreta no rodapé. */
  variant?: "button" | "link";
};

export function InstallPwa({ variant = "button" }: InstallPwaProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);

  // Em modo standalone (app instalada) → nunca mostrar o botão.
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getServerStandaloneSnapshot
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      // Guarda o evento — não forçar o popup automaticamente.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !installed && !isStandalone;

  async function handleInstall() {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } catch {
      // Utilizador pode fechar o prompt; ignorar silenciosamente.
    }
  }

  // Instalada / não suportada → nada a mostrar.
  if (isStandalone || installed) return null;

  if (variant === "link") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button className="text-muted-foreground hover:text-foreground" />
          }
        >
          Instalar aplicação
        </DialogTrigger>
        <InstallDialogContent
          canInstall={canInstall}
          onInstall={handleInstall}
        />
      </Dialog>
    );
  }

  // Android/desktop com suporte nativo → botão directo.
  if (canInstall) {
    return (
      <Button onClick={handleInstall} className="gap-2">
        <Download className="size-4" />
        Instalar aplicação
      </Button>
    );
  }

  // Sem beforeinstallprompt (ex.: iOS ou browser sem suporte) → diálogo com instruções.
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <Smartphone className="size-4" />
        Instalar aplicação
      </DialogTrigger>
      <InstallDialogContent canInstall={false} onInstall={handleInstall} />
    </Dialog>
  );
}

function InstallDialogContent({
  canInstall,
  onInstall,
}: {
  canInstall: boolean;
  onInstall: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle2 className="size-5 text-primary-text" />
          Instalar a aplicação FRETA
        </DialogTitle>
        <DialogDescription>
          Instale a FRETA no seu telefone para abrir mais rápido e receber
          pedidos mesmo com ligação fraca.
        </DialogDescription>
      </DialogHeader>

      {canInstall ? (
        <Button onClick={onInstall} className="gap-2">
          <Download className="size-4" />
          Instalar agora
        </Button>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="font-medium">No iPhone/iPad:</p>
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Toque no botão Partilhar (quadrado com seta).</li>
            <li>Escolha &ldquo;Adicionar ao Ecrã Principal&rdquo;.</li>
            <li>Toque em &ldquo;Adicionar&rdquo;.</li>
          </ol>
          <p className="font-medium">No Android:</p>
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Abra o menu do navegador (três pontos).</li>
            <li>Escolha &ldquo;Instalar aplicação&rdquo; ou &ldquo;Adicionar ao ecrã inicial&rdquo;.</li>
          </ol>
        </div>
      )}
    </DialogContent>
  );
}
