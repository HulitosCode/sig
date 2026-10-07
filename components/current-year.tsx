"use client";

import { useEffect, useState } from "react";

// Ano actual. O valor inicial é uma constante (seguro no prerender) e é
// actualizado no cliente de forma assíncrona depois da hidratação.
export function CurrentYear() {
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setYear(String(new Date().getFullYear())), 0);
    return () => clearTimeout(timer);
  }, []);

  return <>{year ?? "2026"}</>;
}
