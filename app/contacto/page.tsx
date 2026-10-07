import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacte a equipa FRETA.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contacto</h1>
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="size-5 text-primary-text" />
          <span>info@freta.co.mz</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="size-5 text-primary-text" />
          <span>+258 84 000 0000</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="size-5 text-primary-text" />
          <span>Maputo, Moçambique</span>
        </div>
      </div>
      <p className="mt-8 text-muted-foreground">
        É motorista e quer se juntar à plataforma?{" "}
        <a href="/registo" className="text-primary-text hover:underline">
          Crie o seu perfil
        </a>{" "}
        ou fale connosco pelos contactos acima.
      </p>
    </div>
  );
}
