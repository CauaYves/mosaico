import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

// Canhoto de carnê ou de ingresso: em cima, o que se paga e quanto; abaixo do picote, o
// destacável com os dados do título; embaixo, a borda serrilhada de recibo destacado.
//
// O contorno vem de máscaras vetoriais (SVG), que o navegador desenha na resolução da tela e
// suaviza; um gradiente com corte seco faria o mesmo contorno, mas serrilhado. Os recortes do
// picote são furos de verdade: por eles aparece o que estiver atrás do canhoto, inclusive a
// sombra dele. A sombra é um drop-shadow na raiz, porque box-shadow seria cortada pela máscara.

/** Círculo dos recortes do picote. */
const NOTCH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12'/%3E%3C/svg%3E")`;

/** Um dente da borda serrilhada, com a ponta para baixo. */
const TOOTH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 6' preserveAspectRatio='none'%3E%3Cpath d='M0 0h12L6 6z'/%3E%3C/svg%3E")`;

/** Os dois círculos são subtraídos (exclude) do retângulo cheio, que é a última camada. */
const NOTCHES: React.CSSProperties = {
  mask: `${NOTCH} left -0.75rem top 0 / 1.5rem 1.5rem no-repeat, ${NOTCH} right -0.75rem top 0 / 1.5rem 1.5rem no-repeat, linear-gradient(#000 0 0)`,
  maskComposite: "exclude, exclude, add",
};

const TEETH: React.CSSProperties = {
  mask: `${TOOTH} center / 0.75rem 100% round`,
};

const ticketVariants = cva(
  "group/ticket relative [filter:drop-shadow(0_14px_14px_var(--ticket-shadow))]",
  {
    variants: {
      tone: {
        primary:
          "text-primary-foreground [--ticket-color:var(--primary)] [--ticket-shadow:color-mix(in_oklab,var(--primary)_26%,transparent)]",
        success:
          "text-success-foreground [--ticket-color:var(--success)] [--ticket-shadow:color-mix(in_oklab,var(--success)_26%,transparent)]",
        card: "text-card-foreground [--ticket-color:var(--card)] [--ticket-shadow:color-mix(in_oklab,var(--foreground)_14%,transparent)]",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

function Ticket({
  tone,
  band = false,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof ticketVariants> & {
    /** Em faixa: sem os cantos de cima, para ir de ponta a ponta no topo de uma tela. */
    band?: boolean;
  }) {
  return (
    <div
      data-slot="ticket"
      data-band={band ? "" : undefined}
      className={cn(ticketVariants({ tone }), className)}
      {...props}
    >
      {children}
      {/* Sobe um pixel sobre a peça de cima: sem isso, a emenda pode abrir um fio da cor do fundo. */}
      <span
        aria-hidden="true"
        data-slot="ticket-teeth"
        className="-mt-px block h-1.5 bg-(--ticket-color)"
        style={TEETH}
      />
    </div>
  );
}

/** A peça de cima. Com um TicketStub logo depois, cede a ele parte do respiro de baixo. */
function TicketBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ticket-body"
      className={cn(
        "relative isolate overflow-hidden rounded-t-surface bg-(--ticket-color) px-5 pt-5 pb-6 group-data-band/ticket:rounded-t-none has-[+[data-slot=ticket-stub]]:pb-3",
        className,
      )}
      {...props}
    />
  );
}

/** O destacável: começa no picote, com a linha tracejada e os dois recortes. */
function TicketStub({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ticket-stub"
      className={cn(
        "relative -mt-px bg-(--ticket-color) px-5 pt-7 pb-4 before:absolute before:inset-x-5 before:top-[calc(0.75rem-1px)] before:border-t-2 before:border-dashed before:border-current/30",
        className,
      )}
      style={{ ...NOTCHES, ...style }}
      {...props}
    />
  );
}

/**
 * Marca-d'água no canto do TicketBody. Com `src`, a imagem vira máscara e sai numa cor só, a do
 * texto, seja qual for a cor do arquivo; sem `src`, o filho (um SVG com currentColor) é o desenho.
 */
function TicketWatermark({
  src,
  className,
  style,
  ...props
}: React.ComponentProps<"span"> & {
  /** Imagem com transparência, como o símbolo do clube. */
  src?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="ticket-watermark"
      className={cn(
        "pointer-events-none absolute -top-3 -right-9 -z-10 block h-40 w-56 opacity-[0.09] [&>svg]:size-full",
        src && "bg-current",
        className,
      )}
      style={
        src
          ? {
              maskImage: `url(${src})`,
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "center",
              ...style,
            }
          : style
      }
      {...props}
    />
  );
}

export { Ticket, TicketBody, TicketStub, TicketWatermark, ticketVariants };
