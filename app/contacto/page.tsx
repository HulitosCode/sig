import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SUPORTE } from "@/lib/freta";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Fale com a equipa FRETA — suporte por telefone, WhatsApp ou email.",
};

const contactos = [
  {
    titulo: "Telefone",
    valor: SUPORTE.telefoneFormatado,
    descricao: "Chamadas directas para o suporte FRETA.",
    icone: Phone,
    botoes: [
      {
        label: `Ligar ${SUPORTE.telefoneFormatado}`,
        href: `tel:${SUPORTE.telefoneIntl}`,
        externo: false,
      },
    ],
  },
  {
    titulo: "WhatsApp",
    valor: SUPORTE.whatsapp.replace("https://wa.me/", "+258 "),
    descricao: "Mais rápido para dúvidas e suporte no dia a dia.",
    icone: MessageCircle,
    botoes: [
      {
        label: "Conversar no WhatsApp",
        href: SUPORTE.whatsapp,
        externo: true,
      },
    ],
  },
  {
    titulo: "Email",
    valor: "info@freta.co.mz",
    descricao: "Para assuntos formais e parcerias.",
    icone: Mail,
    botoes: [
      { label: "Enviar email", href: "mailto:info@freta.co.mz", externo: false },
    ],
  },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Fale connosco
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Suporte para clientes e motoristas — por telefone, WhatsApp ou email.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {contactos.map((contacto) => (
          <Card key={contacto.titulo}>
            <CardHeader className="pb-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary-text">
                <contacto.icone className="size-4.5" />
              </span>
              <CardTitle className="text-base">{contacto.titulo}</CardTitle>
              <CardDescription>{contacto.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{contacto.valor}</p>
              {contacto.botoes.map((botao) =>
                botao.externo ? (
                  <Button
                    key={botao.label}
                    className="w-full"
                    render={
                      <a
                        href={botao.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    {botao.label}
                  </Button>
                ) : (
                  <Button
                    key={botao.label}
                    className="w-full"
                    render={<a href={botao.href} />}
                  >
                    {botao.label}
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-xl border bg-muted/40 p-6 text-center">
        <div className="flex items-center justify-center gap-2 font-medium">
          <MapPin className="size-4 text-primary-text" />
          Maputo, Moçambique
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          É motorista e quer se juntar à plataforma?{" "}
          <Link
            href="/registo"
            className="font-medium text-primary-text hover:underline"
          >
            Crie o seu perfil
          </Link>{" "}
          ou
          <Link
            href="/encontrar"
            className="font-medium text-primary-text hover:underline"
          >
            {" "}
            encontre um motorista
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button variant="outline" render={<Link href="/registo" />}>
            <UserRound className="size-4" />
            Criar conta grátis
          </Button>
          <Button render={<Link href="/encontrar" />}>Preciso de frete</Button>
        </div>
      </div>
    </div>
  );
}
