import { cn } from "cn";

/**
 * Cabeçalho padrão das páginas de listagem (Componentes, Marca, Blocos): rótulo
 * pequeno, título com a contagem de itens e uma descrição. Só a home tem hero de divulgação.
 */
export function PageHeader({
  eyebrow,
  title,
  count,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  count?: number;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {count !== undefined && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-medium tabular-nums">
            {count}
          </span>
        )}
      </div>
      {description && <p className="max-w-2xl text-muted-foreground sm:text-lg">{description}</p>}
    </header>
  );
}
