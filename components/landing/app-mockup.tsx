import { MapPin, MessageCircle, Search, ShieldCheck, Star, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const motoristasDemo = [
  {
    nome: "Carlos M.",
    iniciais: "CM",
    viatura: "Toyota Dyna · 2 ton",
    praca: "Maputo",
    nota: "4.8",
  },
  {
    nome: "Ana S.",
    iniciais: "AS",
    viatura: "Carrinha · 1 ton",
    praca: "Matola",
    nota: "4.9",
  },
  {
    nome: "João B.",
    iniciais: "JB",
    viatura: "Camião · 5 ton",
    praca: "Zimpeto",
    nota: "4.7",
  },
];

/**
 * Pré-visualização estilizada da aplicação (sem imagens: 100% CSS/JSX) —
 * usada como "imagem" do herói.
 */
export function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Brilho da marca por trás do telemóvel. */}
      <div
        aria-hidden
        className="absolute inset-x-6 top-10 -z-10 h-64 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="rounded-[2rem] border bg-card p-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="space-y-3 rounded-[1.5rem] bg-background p-4">
          {/* Cabeçalho do ecrã */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <span className="flex size-5 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Truck className="size-3" />
              </span>
              FRETA
            </span>
            <span className="rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary-text">
              Maputo
            </span>
          </div>

          {/* Pesquisa */}
          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              O que precisa de transportar?
            </p>
            <p className="mt-0.5 text-sm font-semibold">
              Mudança de casa · Maputo → Matola
            </p>
            <div className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground">
              <Search className="size-3.5" />
              Encontrar motoristas
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-2">
            {motoristasDemo.map((m) => (
              <div
                key={m.nome}
                className="flex items-center gap-3 rounded-xl border p-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-text">
                  {m.iniciais}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{m.nome}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {m.viatura}
                  </p>
                </div>
                <span className="flex items-center gap-0.5 text-[10px] font-medium">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  {m.nota}
                </span>
              </div>
            ))}
          </div>

          {/* Acção */}
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-foreground py-2 text-xs font-semibold text-background">
            <MessageCircle className="size-3.5" />
            Falar por WhatsApp
          </div>
        </div>
      </div>

      {/* Cartões flutuantes */}
      <Flutuante className="-left-3 top-14 sm:-left-8">
        <ShieldCheck className="size-3.5 text-primary-text" />
        Perfil verificado
      </Flutuante>
      <Flutuante className="-right-3 bottom-16 sm:-right-8">
        <MapPin className="size-3.5 text-primary-text" />
        16 praças
      </Flutuante>
    </div>
  );
}

function Flutuante({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "absolute z-10 hidden items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:inline-flex",
        className
      )}
    >
      {children}
    </span>
  );
}
