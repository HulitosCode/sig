import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "O FRETA conecta clientes e motoristas em Moçambique para mudanças, mercadorias e fretes.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Sobre o FRETA</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>
          O <strong className="text-foreground">FRETA</strong> é uma plataforma
          moçambicana que liga quem precisa transportar carga a motoristas
          disponíveis na sua zona — para mudanças de casa, mercadorias, móveis,
          material de construção e outros fretes.
        </p>
        <p>
          Todos os motoristas são verificados presencialmente pelas nossas
          equipas nas praças (Maputo, Matola, Marracuene, Zimpeto, Benfica e
          outras), com registo do veículo, matrícula e capacidade de carga.
        </p>
        <p>
          A tua carga. O motorista certo.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 text-sm">
            <h2 className="font-semibold">Verificado</h2>
            <p className="mt-1 text-muted-foreground">
              Perfis confirmados presencialmente na praça.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-sm">
            <h2 className="font-semibold">Directo</h2>
            <p className="mt-1 text-muted-foreground">
              Fale com o motorista por telefone ou WhatsApp.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-sm">
            <h2 className="font-semibold">Avaliado</h2>
            <p className="mt-1 text-muted-foreground">
              Veja as avaliações de outros clientes antes de escolher.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
