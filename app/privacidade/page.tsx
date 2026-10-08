import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Como o FRETA recolhe, utiliza, partilha e protege dados pessoais: contas de motoristas, pedidos de clientes, pagamentos, cookies, direitos e contacto.",
};

const SECCOES: { id: string; titulo: string }[] = [
  { id: "responsavel", titulo: "1. Quem trata os seus dados" },
  { id: "recolha", titulo: "2. Dados que recolhemos" },
  { id: "utilizacao", titulo: "3. Como usamos os dados" },
  { id: "partilha", titulo: "4. Com quem partilhamos" },
  { id: "pagamentos", titulo: "5. Pagamentos" },
  { id: "cookies", titulo: "6. Cookies e armazenamento local" },
  { id: "conservacao", titulo: "7. Conservação de dados" },
  { id: "direitos", titulo: "8. Os seus direitos" },
  { id: "seguranca", titulo: "9. Segurança" },
  { id: "menores", titulo: "10. Crianças e menores" },
  { id: "alteracoes", titulo: "11. Alterações e contacto" },
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

function Subtitulo({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Política de privacidade</h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          A sua privacidade é importante para nós. Esta política explica, de
          forma clara, que informação o <strong className="text-foreground">FRETA</strong>{" "}
          recolhe, para que a utiliza, com quem a partilhamos, por quanto tempo
          a conservamos e como pode exercer os seus direitos.
        </p>
        <p>
          O tratamento dos dados segue a legislação moçambicana de protecção de
          dados pessoais e aplica-se a todos os utilizadores da plataforma em
          Moçambique.
        </p>
        <p>
          Se é <strong className="text-foreground">cliente</strong>, pode usar o
          FRETA sem criar conta. Se é{" "}
          <strong className="text-foreground">motorista</strong>, cria uma conta
          e um perfil que fica visível aos clientes após verificação.
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
        <Secao id="responsavel" titulo="1. Quem trata os seus dados">
          <p>
            O FRETA, com operação em Maputo, Moçambique, é o responsável pelo
            tratamento dos dados pessoais recolhidos através do site e da
            aplicação.
          </p>
          <p>
            Só recolhemos a informação necessária para ligar clientes e
            motoristas, gerir contas e perfis, confirmar pagamentos e manter a
            plataforma segura.
          </p>
        </Secao>

        <Secao id="recolha" titulo="2. Dados que recolhemos">
          <Subtitulo>Conta de motorista (registo)</Subtitulo>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>nome completo e email;</li>
            <li>palavra-passe, guardada de forma encriptada;</li>
            <li>telefone e WhatsApp (opcional);</li>
            <li>
              registos de sessão: token de sessão, data, agente de utilizador e
              endereço IP.
            </li>
          </ul>

          <Subtitulo>Perfil de motorista (público na plataforma)</Subtitulo>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>praça / zona;</li>
            <li>tipo de viatura, matrícula e capacidade de carga;</li>
            <li>serviços realizados e preço por km (opcional);</li>
            <li>observações e link de fotografia (opcionais);</li>
            <li>telefone e WhatsApp, apresentados nos botões de contacto.</li>
          </ul>

          <Subtitulo>Pedidos de transporte (clientes sem conta)</Subtitulo>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>tipo de carga, praça de origem, endereço de origem e destino;</li>
            <li>veículo sugerido (opcional);</li>
            <li>telefone de contacto (opcional);</li>
            <li>
              registo do motorista contactado, para associar o pedido à
              resposta.
            </li>
          </ul>

          <Subtitulo>Avaliações</Subtitulo>
          <p>
            Nota de 1 a 5 e comentário opcional, associados ao motorista e, às
            vezes, ao pedido. A avaliação não identifica publicamente o autor.
          </p>

          <Subtitulo>Pagamentos e dados técnicos</Subtitulo>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              registo de pagamento: valor, estado, datas e período válido;
            </li>
            <li>
              endereço IP e dados de navegação, usados para limitar abusos e
              garantir a segurança do serviço.
            </li>
          </ul>
        </Secao>

        <Secao id="utilizacao" titulo="3. Como usamos os dados">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              ligar clientes e motoristas e mostrar os pedidos da praça;
            </li>
            <li>
              gerir contas, sessões e a verificação documental dos perfis (BI e
              fotos do veículo);
            </li>
            <li>
              gerir o cadastro, o plano mensal e as confirmações de pagamento;
            </li>
            <li>
              publicar avaliações e calcular a nota média de cada motorista;
            </li>
            <li>
              proteger a plataforma (limites de utilização por IP e prevenção de
              abuso);
            </li>
            <li>prestar apoio aos utilizadores e melhorar o serviço;</li>
            <li>cumprir obrigações legais.</li>
          </ul>
          <p>
            Tratamos os dados com base na utilização do serviço, no seu
            consentimento quando é exigido e no nosso interesse legítimo em
            manter a plataforma segura.{" "}
            <strong className="text-foreground">
              Não vendemos dados pessoais nem os usamos para publicidade de
              terceiros.
            </strong>
          </p>
        </Secao>

        <Secao id="partilha" titulo="4. Com quem partilhamos">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Motoristas da praça:</strong>{" "}
              veem os pedidos da sua zona (tipo de carga, origem, destino e, se
              fornecido, o telefone do cliente) para poderem responder.
            </li>
            <li>
              <strong className="text-foreground">Motorista escolhido:</strong>{" "}
              recebe o contacto do cliente apenas quando o cliente o indica,
              para devolver a chamada ou responder no WhatsApp.
            </li>
            <li>
              <strong className="text-foreground">Clientes:</strong> vêem o
              telefone e o WhatsApp do motorista, que constam do perfil público.
            </li>
            <li>
              <strong className="text-foreground">Administração FRETA:</strong>{" "}
              acede à informação para verificar perfis, apoiar utilizadores,
              confirmar pagamentos e decidir sobre bloqueios.
            </li>
            <li>
              <strong className="text-foreground">Prestadores técnicos:</strong>{" "}
              empresas de alojamento e infraestrutura que operam os nossos
              sistemas, contratadas para esse único fim e com dever de
              confidencialidade.
            </li>
          </ul>
          <p>
            Não partilhamos dados com terceiros para marketing. O envio de
            mensagens por telefone ou WhatsApp depende também da política dos
            respectivos serviços.
          </p>
        </Secao>

        <Secao id="pagamentos" titulo="5. Pagamentos">
          <p>
            O cadastro de motorista é <strong className="text-foreground">grátis</strong>{" "}
            e o plano mensal custa{" "}
            <strong className="text-foreground">480 MT</strong>. O pagamento é
            feito por M-Pesa ou e-Mola e confirmado manualmente pela
            administração.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              não processamos pagamentos online nem acedemos a dados de cartões
              bancários;
            </li>
            <li>
              guardamos apenas o registo do pagamento: valor, estado, datas,
              período válido e o administrador que o confirmou;
            </li>
            <li>
              os contactos de pagamento entregues à administração são usados
              apenas para identificar e conciliar a transferência.
            </li>
          </ul>
        </Secao>

        <Secao id="cookies" titulo="6. Cookies e armazenamento local">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Cookie de sessão:</strong>{" "}
              mantém o motorista autenticado durante a sua visita, tem duração
              limitada e não serve publicidade.
            </li>
            <li>
              <strong className="text-foreground">Armazenamento local:</strong>{" "}
              guarda apenas preferências do próprio dispositivo, como já ter
              fechado as instruções de instalação da app em iOS.
            </li>
            <li>
              <strong className="text-foreground">Cache da aplicação (PWA):</strong>{" "}
              o service worker guarda em cache apenas assets públicos — ícones,
              estilos e páginas públicas — para que o FRETA abra mesmo sem
              internet. Essa cache não contém dados pessoais, pedidos nem
              sessões.
            </li>
          </ul>
          <p>
            Não usamos cookies de publicidade nem de perfilamento de terceiros.
            Pode limpar cookies e cache nas definições do navegador; a sessão
            terminará e terá de entrar novamente.
          </p>
        </Secao>

        <Secao id="conservacao" titulo="7. Conservação de dados">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Conta e perfil:</strong> enquanto
              a conta existir, até ao encerramento a pedido do titular ou por
              bloqueio.
            </li>
            <li>
              <strong className="text-foreground">Pedidos e avaliações:</strong>{" "}
              enquanto forem necessários ao funcionamento e ao histórico da
              plataforma, podendo ser anonimizados ou removidos a pedido.
            </li>
            <li>
              <strong className="text-foreground">Sessões:</strong> até
              expirarem ou serem terminadas.
            </li>
            <li>
              <strong className="text-foreground">Pagamentos:</strong> pelo
              período exigido pela legislação fiscal e comercial moçambicana.
            </li>
            <li>
              <strong className="text-foreground">Registos de segurança:</strong>{" "}
              por período curto, apenas para prevenção de abuso.
            </li>
          </ul>
          <p>
            Quando a informação deixa de ser necessária, é eliminada ou
            anonimizada de forma segura.
          </p>
        </Secao>

        <Secao id="direitos" titulo="8. Os seus direitos">
          <p>Pode, a qualquer momento, pedir:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-foreground">Acesso</strong> — saber que
              dados temos sobre si e como os estamos a usar;
            </li>
            <li>
              <strong className="text-foreground">Rectificação</strong> —
              corrigir dados incorrectos ou desactualizados;
            </li>
            <li>
              <strong className="text-foreground">Eliminação</strong> — apagar a
              conta e os dados associados, quando não existir obrigação legal de
              os conservar;
            </li>
            <li>
              <strong className="text-foreground">Oposição ou limitação</strong>{" "}
              — opor-se a determinados usos ou pedir a suspensão do tratamento;
            </li>
            <li>
              <strong className="text-foreground">Portabilidade</strong> —
              receber os seus dados em formato comum, quando aplicável.
            </li>
          </ul>
          <p>
            Para exercer estes direitos, contacte-nos por telefone / WhatsApp{" "}
            <strong className="text-foreground">+258 84 377 9669</strong> ou
            por email <strong className="text-foreground">info@freta.co.mz</strong>,
            indicando o seu nome, o email da conta e o que deseja. Para
            protecção da sua identidade, poderemos pedir confirmação de que se
            trata de si. Respondemos dentro do prazo legal aplicável ou, na
            falta de prazo definido, em prazo razoável.
          </p>
        </Secao>

        <Secao id="seguranca" titulo="9. Segurança">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>palavras-passe guardadas de forma encriptada, nunca em texto simples;</li>
            <li>ligações cifradas (HTTPS) e sessões com validade limitada;</li>
            <li>acesso administrativo restrito aos dados de utilizadores;</li>
            <li>
              medidas técnicas contra abuso, como limites de pedidos por
              endereço IP;
            </li>
            <li>
              verificação dos documentos (BI e fotos do veículo) antes da
              publicação do perfil.
            </li>
          </ul>
          <p>
            Nenhum sistema é totalmente imune a incidentes. Se detectar uma
            falha de segurança ou uso indevido da sua conta, contacte-nos de
            imediato.
          </p>
        </Secao>

        <Secao id="menores" titulo="10. Crianças e menores">
          <p>
            O FRETA destina-se a maiores de 18 anos. Não recolhemos
            deliberadamente dados de crianças; se verificarmos que foi
            submetida informação nesses termos, eliminamo-la.
          </p>
        </Secao>

        <Secao id="alteracoes" titulo="11. Alterações e contacto">
          <p>
            Podemos actualizar esta política para reflectir mudanças no serviço
            ou na lei. A versão em vigor é a publicada nesta página, com a data
            de actualização no fim; recomendamos que a reveja periodicamente.
          </p>
          <p>
            Em caso de litígio, aplica-se a lei da República de Moçambique. Para
            dúvidas sobre os seus dados ou sobre esta política, consulte também
            os nossos{" "}
            <Link
              href="/termos"
              className="text-primary-text hover:underline"
            >
              Termos de uso
            </Link>
            .
          </p>
        </Secao>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Última actualização: Outubro de 2026. Questões sobre os seus dados:
        telefone / WhatsApp{" "}
        <span className="text-primary-text">+258 84 377 9669</span> ·{" "}
        <span className="text-primary-text">info@freta.co.mz</span>
      </p>
    </div>
  );
}
