"use client";

import { useEffect } from "react";
import { IosInstallPrompt } from "@/components/pwa/ios-install-prompt";

/**
 * Regista o Service Worker apenas no browser.
 * Não faz nada em SSR (evita erros de `navigator` inexistente).
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Não registar em desenvolvimento para evitar caches confusas no dev.
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        // O SW activa sozinho (skipWaiting/clients.claim) e limpa caches
        // antigos no activate — o HTML nunca é cacheado, por isso as
        // próximas navegações já recebem a versão nova sem reload forçado.
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[PWA] Falha ao registar service worker:", error)
        }
      }
    };

    // Registar depois do load para não competir com recursos críticos.
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return <IosInstallPrompt />;
}
