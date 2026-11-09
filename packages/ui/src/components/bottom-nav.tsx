"use client";

import { cn } from "cn";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/mosaico/components/mosaico/tooltip";

type BottomNavContextValue = {
  value: string | undefined;
  select: (value: string) => void;
};

const BottomNavContext = React.createContext<BottomNavContextValue | null>(null);

function useBottomNav() {
  const context = React.useContext(BottomNavContext);
  if (!context) throw new Error("BottomNavItem precisa estar dentro de <BottomNav>.");
  return context;
}

type BottomNavProps = Omit<React.ComponentProps<"nav">, "defaultValue" | "onChange"> & {
  /** Item ativo (controlado). */
  value?: string;
  /** Item ativo inicial (não controlado). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fixa a barra no rodapé da tela, centralizada. */
  sticky?: boolean;
};

function BottomNav({
  value: valueProp,
  defaultValue,
  onValueChange,
  sticky = false,
  className,
  children,
  "aria-label": ariaLabel = "Navegação",
  onKeyDown,
  ...props
}: BottomNavProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : internal;
  const navRef = React.useRef<HTMLElement>(null);
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = React.useState(false);

  const select = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );

  // mede o item ativo para posicionar o indicador deslizante
  const measure = React.useCallback(() => {
    const active = navRef.current?.querySelector<HTMLElement>(
      '[data-slot="bottom-nav-item"][data-active="true"]',
    );
    setIndicator(active ? { left: active.offsetLeft, width: active.offsetWidth } : null);
  }, []);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, value, children]);

  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    // só anima depois da primeira medição, para o indicador não deslizar do zero
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure]);

  // setas movem o foco entre os itens (roving tabindex)
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const items = Array.from(
      navRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot="bottom-nav-item"]') ?? [],
    ).filter((item) => !item.disabled);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % items.length;
    if (event.key === "ArrowLeft") next = (current - 1 + items.length) % items.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = items.length - 1;
    event.preventDefault();
    items[next]?.focus();
  }

  return (
    <BottomNavContext.Provider value={{ value, select }}>
      <nav
        ref={navRef}
        data-slot="bottom-nav"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex w-fit items-center gap-1 rounded-full bg-card p-1.5 shadow-lg ring-1 ring-foreground/5",
          sticky &&
            "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2 animate-fluid-in-sm",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          data-slot="bottom-nav-indicator"
          className={cn(
            "pointer-events-none absolute top-1.5 bottom-1.5 left-0 rounded-full bg-primary/10 opacity-0 motion-reduce:transition-none",
            indicator && "opacity-100",
            animate &&
              "transition-[transform,width] duration-(--duration-fluid-fast) ease-(--ease-fluid)",
          )}
          style={{
            width: indicator?.width ?? 0,
            transform: `translateX(${indicator?.left ?? 0}px)`,
          }}
        />
        {children}
      </nav>
    </BottomNavContext.Provider>
  );
}

type BottomNavItemProps = Omit<React.ComponentProps<"button">, "value"> & {
  value: string;
  /** Ícone (elemento ou componente, ex.: do Phosphor). */
  icon: React.ReactElement | React.ElementType;
  /** Só para acessibilidade e tooltip; nunca aparece dentro da barra. */
  label: string;
  /** Marcador pequeno: `true` mostra um ponto, número ou texto mostra o valor. */
  badge?: boolean | number | string;
};

function BottomNavItem({
  value,
  icon,
  label,
  badge,
  className,
  onClick,
  ...props
}: BottomNavItemProps) {
  const { value: current, select } = useBottomNav();
  const active = current === value;
  // sem item ativo, o primeiro item fica focável pelo Tab
  const iconNode = React.isValidElement(icon)
    ? icon
    : React.createElement(icon as React.ElementType, { weight: active ? "fill" : "regular" });
  const hasBadge = badge !== undefined && badge !== false && badge !== 0;
  const isDot = badge === true;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            data-slot="bottom-nav-item"
            data-active={active}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            tabIndex={active || current === undefined ? 0 : -1}
            onClick={(event) => {
              onClick?.(event);
              if (!event.defaultPrevented) select(value);
            }}
            className={cn(
              "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-[transform,color,background-color] duration-150 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-95 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none data-[active=true]:bg-transparent data-[active=true]:text-primary [&_svg]:size-5",
              className,
            )}
            {...props}
          />
        }
      >
        {iconNode}
        {hasBadge && (
          <span
            aria-hidden
            data-slot="bottom-nav-badge"
            className={cn(
              "absolute flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card",
              isDot
                ? "top-2 right-2 size-2"
                : "-top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] leading-none font-medium",
            )}
          >
            {isDot ? null : badge}
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export { BottomNav, BottomNavItem };
