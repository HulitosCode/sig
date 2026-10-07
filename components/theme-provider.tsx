"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Tema claro/escuro (next-themes). `attribute="class"` activa os tokens
 * `.dark` do globals.css; a escolha do utilizador persiste em localStorage.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
