/**
 * Estados do perfil do motorista — módulo partilhado servidor/cliente.
 *
 * Fica num ficheiro próprio (sem "use client") para que o servidor possa
 * ler os valores: exportar constantes de um módulo cliente para um
 * Server Component devolve uma client reference, não o objeto.
 */
export const STATUS_MOTORISTA: Record<
  string,
  { label: string; classe: string }
> = {
  pendente: {
    label: "Pendente",
    classe:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  ativo: {
    label: "Verificado",
    classe:
      "bg-green-100 text-green-800 dark:bg-primary/15 dark:text-primary",
  },
  bloqueado: {
    label: "Bloqueado",
    classe: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
};
