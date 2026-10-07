"use client";

import { useEffect, useState } from "react";
import { Share, PlusCircle, X } from "lucide-react";

/**
 * Instruções de instalação para iPhone/iPad (Safari não suporta
 * `beforeinstallprompt`, por isso mostramos um aviso discreto com
 * as instruções da Partilhar → Adicionar ao Ecrã Principal).
 */
export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent
    const isIos = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg/.test(ua);
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (!isIos || standalone) return;
    if (isSafari === false) return; // só no Safari
    if (localStorage.getItem("freta-ios-prompt-dismissed") === "1") return;

    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem("freta-ios-prompt-dismissed", "1");
    } catch {
      // localStorage indisponível (modo privado) — ignorar.
    }
  }

  if (!visible || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border bg-card p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <PlusCircle className="size-5 text-primary" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-medium">Instalar no iPhone</p>
          <p className="mt-1 text-muted-foreground">
            Toque em <Share className="inline size-3.5 align-[-2px]" />{" "}
            <strong>Partilhar</strong> e depois em{" "}
            <strong>Adicionar ao Ecrã Principal</strong>.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Fechar aviso de instalação"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
