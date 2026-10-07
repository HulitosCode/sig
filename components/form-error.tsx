import { AlertCircle } from "lucide-react";
import { cn } from "cn";

/**
 * Banner de erro de formulário (validação ou acção falhada).
 * Semântica `role="alert"` para leitores de ecrã.
 */
export function FormError({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive",
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}
