import type { Metadata } from "next";
import { BuscaForm } from "./busca-form";

export const metadata: Metadata = {
  title: "Encontrar motorista",
  description:
    "Encontre motoristas disponíveis para mudanças, mercadorias e fretes na sua zona.",
};

export default function EncontrarPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <BuscaForm />
    </div>
  );
}
