"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Menu de tema (Claro / Escuro / Automático) para o header.
 * Os ícones alternam só com CSS (`dark:hidden`) — sem estado de mounted,
 * portanto sem problemas de hidratação.
 */
export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className={className} />
        }
      >
        <Sun className="size-4 dark:hidden" />
        <Moon className="size-4 hidden dark:block" />
        <span className="sr-only">Alterar tema</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Base UI exige que a GroupLabel esteja dentro de Menu.Group. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuRadioGroup
          value={theme ?? "system"}
          onValueChange={setTheme}
        >
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" /> Claro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" /> Escuro
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" /> Automático
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
