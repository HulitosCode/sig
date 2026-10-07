import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de uso",
};

export default function TermosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Termos de uso</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Ao utilizar o FRETA, concorda em utilizar a plataforma de forma
          legítima e respeitosa com todos os utilizadores.
        </p>
        <h2 className="text-base font-semibold text-foreground">
          Para clientes
        </h2>
        <p>
          O FRETA é um directorório que o liga a motoristas independentes. O
          contrato de transporte é acordado directamente entre o cliente e o
          motorista. O FRETA não executa nem garante o transporte.
        </p>
        <h2 className="text-base font-semibold text-foreground">
          Para motoristas
        </h2>
        <p>
          Os motoristas comprometem-se a fornecer dados verdadeiros (veículo,
          matrícula, capacidade e contactos), a manter o estado de disponibilidade
          actualizado e a pagar a mensalidade acordada de 120 MT/mês. Perfis não
          verificados ou com dados falsos serão bloqueados.
        </p>
        <h2 className="text-base font-semibold text-foreground">
          Avaliações
        </h2>
        <p>
          As avaliações são anónimas e devem reflectir experiências reais.
          Avaliações ofensivas ou falsas poderão ser removidas.
        </p>
        <p className="pt-4 text-xs">
          Última actualização: Outubro de 2026.
        </p>
      </div>
    </div>
  );
}
