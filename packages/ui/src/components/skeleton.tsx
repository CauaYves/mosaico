import { cn } from "cn";

// Decorativo: quem carrega o conteúdo anuncia o estado (por exemplo aria-busy no bloco ou um
// Spinner com role="status"). Por isso o Skeleton fica fora da árvore de acessibilidade.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-item bg-muted motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
