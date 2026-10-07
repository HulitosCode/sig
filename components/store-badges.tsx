import { cn } from "@/lib/utils";

// TODO: substituir pelos links reais quando o FRETA entrar nas lojas.
const PLAY_STORE_URL = "#"; // https://play.google.com/store/apps/details?id=mz.co.freta
const APP_STORE_URL = "#"; // https://apps.apple.com/app/freta/idXXXXXXXXX

const badgeClass =
  "inline-flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-white ring-1 ring-white/10 transition-all duration-200 hover:scale-[1.03] hover:bg-zinc-900 active:scale-[0.95]";

/**
 * Botões "Google Play" e "App Store" (herói e rodapé).
 * Links ainda por definir — ver TODO acima.
 */
export function StoreBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {/* Google Play */}
      <a href={PLAY_STORE_URL} aria-label="Descarregar FRETA no Google Play" className={badgeClass}>
        <svg
          width="30"
          height="30"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M7.5 5.8C6.55 6.75 6 8.2 6 10.05V37.95C6 39.8 6.55 41.25 7.5 42.2L7.65 42.35L23.3 26.7V26.3L7.65 5.65L7.5 5.8Z"
            fill="#00D7FE"
          />
          <path
            d="M28.5 31.9L23.3 26.7V26.3L28.5 21.1L28.65 21.2L34.8 24.7C36.55 25.7 36.55 27.3 34.8 28.3L28.65 31.8L28.5 31.9Z"
            fill="#FFCE00"
          />
          <path
            d="M28.65 31.8L23.3 26.5L7.5 42.3C9 43.9 11.45 44.1 14.2 42.55L28.65 34.35V31.8Z"
            fill="#FF3A44"
          />
          <path
            d="M28.65 21.2L14.2 13C11.45 11.45 9 11.65 7.5 13.25L23.3 29.05L28.65 23.7V21.2Z"
            fill="#00F076"
            transform="translate(0 -7.55)"
          />
        </svg>
        <span className="flex flex-col items-start gap-0.5 leading-none">
          <span className="text-[9px] font-medium uppercase tracking-wide">
            Disponível no
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Google Play
          </span>
        </span>
      </a>

      {/* App Store */}
      <a href={APP_STORE_URL} aria-label="Descarregar FRETA na App Store" className={badgeClass}>
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            fill="currentColor"
            d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.1ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z"
          />
        </svg>
        <span className="flex flex-col items-start gap-0.5 leading-none">
          <span className="text-[9px] font-medium tracking-wide">
            Descarregue na
          </span>
          <span className="text-lg font-semibold tracking-tight">
            App Store
          </span>
        </span>
      </a>
    </div>
  );
}
