"use client";

import { cn } from "cn";
import type * as React from "react";
import { flushSync } from "react-dom";
import { Button } from "@/registry/mosaico/components/mosaico/button";

type Theme = "light" | "dark";

/**
 * Ícone padrão do modo claro: disco central e oito raios em triângulo, separados do disco
 * para continuar lendo como sol (e não estrela) em tamanhos pequenos. Os raios diagonais
 * são um pouco mais curtos e finos que os retos.
 */
function SunIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg data-slot="sun-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 7.4a4.6 4.6 0 1 1 0 9.2a4.6 4.6 0 1 1 0-9.2ZM12 0.8L13.6 4.8L10.4 4.8ZM19.5 4.5L18.05 7.86L16.14 5.95ZM23.2 12L19.2 13.6L19.2 10.4ZM19.5 19.5L16.14 18.05L18.05 16.14ZM12 23.2L10.4 19.2L13.6 19.2ZM4.5 19.5L5.95 16.14L7.86 18.05ZM0.8 12L4.8 10.4L4.8 13.6ZM4.5 4.5L7.86 5.95L5.95 7.86Z" />
    </svg>
  );
}

/**
 * Ícone padrão do modo escuro. A lua preenche o próprio desenho, enquanto o sol tem os raios
 * em volta de um disco menor: o viewBox quadrado com folga deixa a lua com ~76% da caixa,
 * para os dois parecerem do mesmo tamanho no mesmo size-*.
 */
function MoonIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      data-slot="moon-icon"
      viewBox="-35 -30 291 291"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M220.48 158.97c-15.63 10.9-34.65 17.29-55.16 17.29-53.33 0-96.57-43.24-96.57-96.57 0-32.67 16.21-61.54 41.03-79.02C48.73 3.18 0 53.48 0 115.15c0 63.28 51.3 114.58 114.58 114.58 47.76 0 88.7-29.22 105.9-70.76Z"
      />
    </svg>
  );
}

/**
 * Troca entre modo claro e escuro. O tema novo aparece num círculo que nasce no botão e
 * cobre a tela (View Transition), e o ícone novo entra girando, como os de sistema da
 * Apple. As animações estão no styles.css do kit. Sem suporte a View Transition ou com
 * movimento reduzido, a troca é imediata.
 *
 * O tema fica com a aplicação: `theme` é o tema em uso e `onThemeChange` aplica o novo
 * (ex. `resolvedTheme` e `setTheme` do next-themes). O tema segue a classe `dark` no
 * <html>, como o resto do kit.
 */
function ThemeToggle({
  theme,
  onThemeChange,
  animated = true,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  /** Tema em uso. Sem ele (antes da hidratação, por exemplo), vale a classe dark do <html>. */
  theme?: Theme | (string & {});
  onThemeChange: (theme: Theme) => void;
  /** false troca o tema na hora, sem o círculo nem o giro do ícone (ex.: dentro de prévias). */
  animated?: boolean;
}) {
  const toggle = (event: Parameters<NonNullable<typeof onClick>>[0]) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const root = document.documentElement;
    const isDark = theme ? theme === "dark" : root.classList.contains("dark");
    const next: Theme = isDark ? "light" : "dark";
    if (
      !animated ||
      !document.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onThemeChange(next);
      return;
    }

    // Centro do botão e tamanho final do círculo, que precisa alcançar o canto mais
    // distante da tela. A animação usa esses valores (styles.css).
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-size", `${Math.ceil(radius * 2.1)}px`);

    // data-theme-transition liga as animações só durante a troca.
    root.dataset.themeTransition = "";
    const transition = document.startViewTransition(() => {
      flushSync(() => onThemeChange(next));
      // A classe é aplicada na hora para o snapshot novo já sair no tema certo, mesmo
      // que a aplicação só atualize o <html> num efeito.
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
    });
    transition.finished.finally(() => {
      delete root.dataset.themeTransition;
      for (const name of ["--theme-x", "--theme-y", "--theme-size"]) {
        root.style.removeProperty(name);
      }
    });
  };

  return (
    <Button
      data-slot="theme-toggle"
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      onClick={toggle}
      {...props}
    >
      {/* Os dois ícones ficam no DOM e a classe dark escolhe qual aparece, sem esperar
          a hidratação. */}
      <SunIcon className="size-4.5 in-data-theme-transition:animate-[theme-icon-sun_600ms_cubic-bezier(0.34,1.56,0.64,1)_both] dark:hidden" />
      <MoonIcon className="hidden size-4.5 in-data-theme-transition:animate-[theme-icon-moon_600ms_cubic-bezier(0.34,1.56,0.64,1)_both] dark:block" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

export { MoonIcon, SunIcon, ThemeToggle };
