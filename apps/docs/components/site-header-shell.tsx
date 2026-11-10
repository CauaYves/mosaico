"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * Casca do header. Na página inicial ele começa transparente sobre a onda do hero e se
 * forma quando sai dela: o fundo aparece e o conteúdo sobe um pouco. Nas outras páginas
 * ele já começa formado. Com o menu mobile aberto (data-menu-open), o fundo se forma também.
 * No celular e no tablet o fundo formado é opaco; no desktop fica translúcido, com desfoque.
 */
export function SiteHeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const ref = React.useRef<HTMLElement>(null);
  const [solid, setSolid] = React.useState(!overHero);

  React.useEffect(() => {
    if (!overHero) {
      setSolid(true);
      return;
    }

    const wave = document.querySelector("[data-slot=wave-hero]");
    const update = () => {
      const headerBottom = ref.current?.getBoundingClientRect().bottom ?? 0;
      if (!wave) {
        setSolid(window.scrollY > 0);
        return;
      }
      // "Fora da onda": a borda de baixo do header passou da linha do meio da curva.
      const rect = wave.getBoundingClientRect();
      setSolid(rect.top + rect.height / 2 <= headerBottom);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [overHero]);

  return (
    <header ref={ref} data-solid={solid} className="group/header sticky top-0 z-50 w-full">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 origin-top bg-background lg:bg-background/90 lg:backdrop-blur-lg transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[solid=false]/header:scale-y-75 group-data-[solid=false]/header:opacity-0 group-has-[[data-menu-open=true]]/header:scale-y-100! group-has-[[data-menu-open=true]]/header:opacity-100! motion-reduce:transition-none"
      />
      <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[solid=false]/header:translate-y-1.5 group-has-[[data-menu-open=true]]/header:translate-y-0! motion-reduce:transition-none">
        {children}
      </div>
    </header>
  );
}
