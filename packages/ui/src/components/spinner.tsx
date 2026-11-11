import { cn } from "cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="spinner"
      role="status"
      aria-label="Carregando"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className={cn("size-4 animate-spin", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" className="opacity-20" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

export { Spinner };
