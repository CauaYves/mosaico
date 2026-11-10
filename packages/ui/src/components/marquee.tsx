import { cn } from "cn";
import type * as React from "react";

/**
 * Faixa que rola sem parar, na horizontal ou na vertical. O conteúdo é repetido `repeat`
 * vezes; cada cópia anda o próprio tamanho mais o espaço entre elas, então o laço fecha sem
 * emenda. Baseado no marquee 3D de 21st.dev (Magic UI).
 *
 * Só a primeira cópia fica acessível: as outras são inertes e escondidas de leitores de tela,
 * para o conteúdo não ser lido nem focado várias vezes. Com `decorative`, todas ficam inertes:
 * o conteúdo vira vitrine, sem clique, foco nem teclado, e só o hover pausa a faixa (ele cai
 * na própria faixa, que não é inerte). Com movimento reduzido a faixa para.
 * Velocidade e espaço vêm das variáveis `--duration` e `--gap` (ex. `[--duration:60s]`).
 */
function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  decorative = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Anda no sentido contrário. */
  reverse?: boolean;
  /** Pausa com o mouse em cima ou com o foco dentro (para dar para usar o conteúdo). */
  pauseOnHover?: boolean;
  /** Rola na vertical em vez da horizontal. */
  vertical?: boolean;
  /** Quantas vezes o conteúdo é repetido. Precisa cobrir a área visível mais uma cópia. */
  repeat?: number;
  /** Só vitrine: nenhuma cópia recebe clique, foco ou teclado (o hover continua pausando). */
  decorative?: boolean;
}) {
  return (
    <div
      data-slot="marquee"
      className={cn(
        "group/marquee flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
      {...props}
    >
      {Array.from({ length: repeat }, (_, index) => (
        <div
          key={index}
          aria-hidden={decorative || index > 0 || undefined}
          inert={decorative || index > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around gap-(--gap) motion-reduce:animate-none",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
            pauseOnHover &&
              "group-hover/marquee:[animation-play-state:paused] group-has-focus-visible/marquee:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

export { Marquee };
