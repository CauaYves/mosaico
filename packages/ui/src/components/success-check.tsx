import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

// Marca de confirmação: o anel se fecha, o disco entra e o check se desenha, nessa ordem. É o
// único momento orquestrado de uma tela de sucesso; os keyframes ficam no globals.css. Sem
// animação (`animated={false}` ou movimento reduzido), aparece já no estado final.
const successCheckVariants = cva("relative inline-grid size-12 shrink-0 place-items-center", {
  variants: {
    tone: {
      // Sobre o fundo da página: disco verde, check na cor do texto sobre o verde.
      success: "text-success [--success-check-mark:var(--success-foreground)]",
      // Sobre uma superfície colorida (um Ticket pago): o disco herda a cor do texto dela.
      inverse: "[--success-check-mark:var(--success)]",
    },
  },
  defaultVariants: { tone: "success" },
});

function SuccessCheck({
  tone,
  label = "Concluído",
  animated = true,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof successCheckVariants> & {
    /** Texto para leitores de tela. */
    label?: string;
    /** `false` mostra a marca pronta, sem a entrada animada. */
    animated?: boolean;
  }) {
  return (
    <span
      role="img"
      aria-label={label}
      data-slot="success-check"
      className={cn(successCheckVariants({ tone }), className)}
      {...props}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r="22.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
          className={cn(
            "[stroke-dasharray:1]",
            animated &&
              "animate-[success-check-draw_0.5s_ease-in-out_backwards] motion-reduce:animate-none",
          )}
        />
      </svg>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-full bg-current",
          animated &&
            "animate-[success-check-pop_0.45s_var(--ease-fluid)_0.5s_backwards] motion-reduce:animate-none",
        )}
      />
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="relative size-1/2">
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="var(--success-check-mark)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className={cn(
            "[stroke-dasharray:1]",
            animated &&
              "animate-[success-check-draw_0.3s_ease-out_0.8s_backwards] motion-reduce:animate-none",
          )}
        />
      </svg>
    </span>
  );
}

export { SuccessCheck, successCheckVariants };
