import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Política de privacidade</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          A sua privacidade é importante para nós. Esta política explica como o
          FRETA recolhe, utiliza e protege a sua informação.
        </p>
        <h2 className="text-base font-semibold text-foreground">
          Informação recolhida
        </h2>
        <p>
          <strong className="text-foreground">Motoristas:</strong> nome, email,
          telefone/WhatsApp, praça, dados do veículo e histórico de pedidos.
        </p>
        <p>
          <strong className="text-foreground">Clientes:</strong> usam a
          plataforma sem conta. O telefone é opcional e só é partilhado com o
          motorista contactado para poder devolver a chamada.
        </p>
        <h2 className="text-base font-semibold text-foreground">
          Como usamos os dados
        </h2>
        <p>
          Para ligar clientes e motoristas, mostrar perfis verificados, gerir
          mensalidades e melhorar o serviço. Não vendemos dados pessoais a
          terceiros.
        </p>
        <h2 className="text-base font-semibold text-foreground">Segurança</h2>
        <p>
          As palavras-passe são armazenadas de forma encriptada. Pode pedir a
          elimination da sua conta a qualquer momento através do email de
          contacto.
        </p>
        <p className="pt-4 text-xs">
          Última actualização: Outubro de 2026. Questões: info@freta.co.mz
        </p>
      </div>
    </div>
  );
}
