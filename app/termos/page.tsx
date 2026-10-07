import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Termos de uso da plataforma FRETA: natureza do serviço, conta de motorista, verificação, pagamentos, pedidos, avaliações e responsabilidades.",
};

const SECCOES: { id: string; titulo: string }[] = [
  { id: "aceitacao", titulo: "1. Aceitação" },
  { id: "servico", titulo: "2. O que é o FRETA" },
  { id: "conta", titulo: "3. Conta e registo" },
  { id: "perfil", titulo: "4. Perfil e verificação" },
  { id: "pagamentos", titulo: "5. Pagamentos" },
  { id: "pedidos", titulo: "6. Pedidos e contratação" },
  { id: "uso", titulo: "7. Uso aceitável" },
  { id: "avaliacoes", titulo: "8. Avaliações" },
  { id: "propriedade", titulo: "9. Propriedade intelectual" },
  { id: "suspensao", titulo: "10. Suspensão e encerramento" },
  { id: "responsabilidade", titulo: "11. Limitação de responsabilidade" },
  { id: "alteracoes", titulo: "12. Alterações aos termos" },
  { id: "lei", titulo: "13. Lei aplicável e contacto" },
];

function Secao({
  id,
  titulo,
  children,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
      <div className="mt-2 space-y-3">{children}</div>
      <Separator className="mt-6" />
    </section>
  );
}

export default function TermosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Termos de uso</h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Estes Termos de Uso definem as regras de acesso e utilização do{" "}
          <strong className="text-foreground">FRETA</strong>, a plataforma
          moçambicana que liga clientes a motoristas independentes para
          mudanças de casa, mercadorias, móveis, material de construção e outros
          fretes.
        </p>
        <p>
          Ao pesquisar motoristas, criar conta, registar um perfil ou contactar
          um motorista através do FRETA, declara que leu e aceita estes termos
          na íntegra. Se não concorda com alguma disposição, não deve utilizar
          a plataforma.
        </p>
      </div>

      {/* Índice de secções com âncoras. */}
      <Card className="mt-8">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-foreground">Nesta página</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {SECCOES.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-primary-text hover:underline"
                >
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <Secao id="aceitacao" titulo="1. Aceitação">
          <p>
            O uso do FRETA está reservado a maiores de 18 anos, com capacidade
            legal para contratar em nome próprio.
          </p>
          <p>
            A consulta de motoristas e o envio de pedidos são gratuitos para
            clientes. Ao continuar a usar a plataforma depois de uma actualização
            destes termos, aceita a versão então publicada.
          </p>
        </Secao>

        <Secao id="servico" titulo="2. O que é o FRETA">
          <p>
            O FRETA é um serviço de <strong className="text-foreground">intermediação</strong>:
            apresenta perfis de motoristas verificados e facilita o contacto
            entre quem precisa transportar e quem transporta.
          </p>
          <p>
            Não somos transportadores nem intermediários financeiros do frete.
            Não executamos, nem garantimos, o transporte, o preço acordado, os
            prazos ou a segurança da carga.
          </p>
          <p>
            O contacto acontece directamente entre cliente e motorista, por
            telefone ou WhatsApp. O preço por quilómetro indicado no perfil é
            uma referência facultativa, definida pelo próprio motorista.
          </p>
        </Secao>

        <Secao id="conta" titulo="3. Conta e registo">
          <p>
            Só os motoristas criam conta. O registo faz-se em dois passos: dados
            de acesso (nome, email e palavra-passe) e dados do veículo.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              A conta é pessoal e intransferível; é proibido registar conta em
              nome de terceiros.
            </li>
            <li>
              As palavras-passe são guardadas de forma encriptada; manter as
              suas credenciais confidenciais é da sua responsabilidade.
            </li>
            <li>
              Deve comunicar de imediato qualquer acesso não autorizado à sua
              conta.
            </li>
            <li>
              Todos os dados fornecidos no registo devem ser verdadeiros e
              actuais.
            </li>
          </ul>
          <p>
            Os clientes utilizam o FRETA sem conta: não é necessário registo
            para pesquisar um motorista ou pedir um transporte.
          </p>
        </Secao>

        <Secao id="perfil" titulo="4. Perfil e verificação">
          <p>O perfil do motorista inclui, no mínimo:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>praça / zona de operação;</li>
            <li>tipo de viatura e matrícula;</li>
            <li>capacidade de carga;</li>
            <li>serviços realizados (mudança, mercadoria, móveis, construção, carga pesada, outro);</li>
            <li>telefone e, opcionalmente, WhatsApp, preço por km, observações e fotografia.</li>
          </ul>
          <p>
            Antes de ficar visível para os clientes, a equipa FRETA verifica o
            motorista presencialmente na praça e confirma os pagamentos. O
            perfil assume os estados <em>pendente</em>, <em>activo</em> ou{" "}
            <em>bloqueado</em>.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              O motorista é o único responsável pela exactidão dos dados e
              documentos apresentados, incluindo matrícula e capacidade de
              carga.
            </li>
            <li>
              Deve manter o estado de disponibilidade actualizado e comunicar
              mudanças de viatura, praça ou contactos.
            </li>
            <li>
              Perfis não verificados, com dados falsos ou bloqueados deixam de
              ser apresentados aos clientes.
            </li>
            <li>
              Quando activo, o perfil é público no FRETA: nome, praça, veículo,
              serviços, contactos e avaliações são visíveis aos utilizadores.
            </li>
          </ul>
        </Secao>

        <Secao id="pagamentos" titulo="5. Pagamentos">
          <p>
            O registo de motorista tem o custo de{" "}
            <strong className="text-foreground">120 MT</strong> (cadastro) e o
            plano mensal custa{" "}
            <strong className="text-foreground">480 MT</strong>, pelos valores
            comunicados no momento do registo e confirmados com a administração.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              O pagamento é feito por M-Pesa ou e-Mola; o site não processa
              pagamentos online nem guarda dados de cartões.
            </li>
            <li>
              A administração confirma o pagamento manualmente e regista o
              período correspondente; o perfil só fica activo após a
              confirmação.
            </li>
            <li>
              Sem confirmação no prazo indicado, o perfil mantém-se ou volta a
              ficar pendente de activação.
            </li>
            <li>
              Os valores pagos não são reembolsáveis, excepto quando a lei
              moçambicana o exija ou quando a FRETA não chegue a activar o
              perfil por razões da sua responsabilidade.
            </li>
          </ul>
        </Secao>

        <Secao id="pedidos" titulo="6. Pedidos e contratação">
          <p>
            O cliente descreve o que precisa transportar: tipo de carga, praça
            de origem, endereço de origem, destino, veículo sugerido e, se
            quiser, telefone de contacto.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              O pedido fica visível para os motoristas activos da praça, que
              poderão ser contactados pelo cliente.
            </li>
            <li>
              Se indicar o contacto, o telefone é partilhado apenas com o
              motorista escolhido, para que possa devolver a chamada ou
              responder no WhatsApp.
            </li>
            <li>
              O contrato de transporte — preço, data, horário, responsabilidade
              pela carga, seguro, carregamento e descarregamento — é celebrado
              directamente entre cliente e motorista.
            </li>
            <li>
              O cliente é responsável por descrever a carga com verdade
              (natureza, peso e dimensões) e por a ter pronta no horário
              acordado.
            </li>
          </ul>
          <p>
            Não são permitidos fretes de materiais perigosos, ilegais ou que
            violem a legislação moçambicana.
          </p>
        </Secao>

        <Secao id="uso" titulo="7. Uso aceitável">
          <p>É proibido, entre outros comportamentos:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>fornecer dados falsos, incompletos ou desactualizados;</li>
            <li>suplantar outra pessoa ou manter múltiplas contas;</li>
            <li>
              usar o FRETA para fraude, cobranças indevidas, spam ou qualquer
              actividade ilícita;
            </li>
            <li>
              recolher dados da plataforma automaticamente (scraping) ou
              circular perfis e contactos fora do serviço;
            </li>
            <li>
              publicar ou enviar conteúdo ofensivo, discriminatório, difamatório
              ou enganador;
            </li>
            <li>
              interferir no funcionamento do site, contornar medidas de
              segurança ou testar vulnerabilidades sem autorização;
            </li>
            <li>
              usar a marca, o design ou o conteúdo do FRETA sem autorização
              escrita.
            </li>
          </ul>
          <p>
            Estas violações podem levar à suspensão ou bloqueio imediato do
            perfil, sem prejuízo de outras medidas previstas na lei.
          </p>
        </Secao>

        <Secao id="avaliacoes" titulo="8. Avaliações">
          <p>
            Após o serviço, o cliente pode avaliar o motorista com uma nota de 1
            a 5 e um comentário opcional. A avaliação não exige conta e não
            revela publicamente a identidade do autor.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>as avaliações devem reflectir experiências reais;</li>
            <li>
              comentários ofensivos, falsos ou puramente promocionais podem ser
              removidos;
            </li>
            <li>
              é proibido pedir, pressionar ou recompensar avaliações.
            </li>
          </ul>
        </Secao>

        <Secao id="propriedade" titulo="9. Propriedade intelectual">
          <p>
            A marca FRETA, o design, o código e o conteúdo da plataforma
            pertencem à FRETA ou são licenciados. É proibida a reprodução, cópia
            ou exploração comercial sem autorização.
          </p>
          <p>
            Os dados introduzidos pelo motorista e pelo cliente continuam a
            pertencer-lhes; ao submetê-los, autorizam a sua exibição na
            plataforma durante a vigência da conta e para o funcionamento do
            serviço.
          </p>
        </Secao>

        <Secao id="suspensao" titulo="10. Suspensão e encerramento">
          <p>
            A administração pode suspender, bloquear ou eliminar perfis quando
            detetar dados falsos, falta de pagamento, uso indevido, queixas
            fundamentadas de clientes ou motoristas, ou quando existir exigência
            de autoridade competente.
          </p>
          <p>
            O motorista pode encerrar a sua conta a qualquer momento, pedindo
            pelo contacto indicado no fim destes termos. Após o encerramento, os
            dados são tratados conforme a Política de Privacidade.
          </p>
        </Secao>

        <Secao
          id="responsabilidade"
          titulo="11. Limitação de responsabilidade"
        >
          <p>
            O FRETA intermedia contactos. A verificação presencial confirma a
            identidade e os dados do veículo, mas não constitui garantia da
            qualidade, pontualidade ou segurança do serviço contratado.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              O serviço de transporte é contratado directamente entre cliente e
              motorista; a responsabilidade pela execução é do motorista.
            </li>
            <li>
              A FRETA não responde por atrasos, danos, extravios, acidentes,
              prejuízos ou divergências de preço entre as partes.
            </li>
            <li>
              A disponibilidade do site e da aplicação não é garantida sem
              interrupções; poderemos efectuar manutenções.
            </li>
            <li>
              As ligações para telefone e WhatsApp abrem serviços externos, cuja
              política e segurança não controlamos.
            </li>
          </ul>
          <p>
            Na máxima extensão permitida pela lei, a responsabilidade total da
            FRETA fica limitada ao montante que o utilizador pagou à plataforma
            nos doze meses anteriores ao facto que originou a reclamação.
          </p>
        </Secao>

        <Secao id="alteracoes" titulo="12. Alterações aos termos">
          <p>
            Podemos actualizar estes termos para reflectir alterações legais,
            técnicas ou de negócio. As alterações entram em vigor na data de
            publicação nesta página, recomendando-se que as reveje
            periodicamente. O uso continuado da plataforma após a actualização
            equivale à aceitação da nova versão.
          </p>
        </Secao>

        <Secao id="lei" titulo="13. Lei aplicável e contacto">
          <p>
            Estes termos são regidos pela lei da República de Moçambique. Qualquer
            divergência será primeiro tentada por via amigável e, na falta de
            acordo, será submetida aos tribunais moçambicanos competentes.
          </p>
          <p>
            Para dúvidas, pedidos ou reclamações: telefone / WhatsApp{" "}
            <strong className="text-foreground">+258 84 377 9669</strong> ·
            email <strong className="text-foreground">info@freta.co.mz</strong>.
          </p>
          <p>
            Consulte também a nossa{" "}
            <Link
              href="/privacidade"
              className="text-primary-text hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </Secao>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Última actualização: Outubro de 2026.
      </p>
    </div>
  );
}
