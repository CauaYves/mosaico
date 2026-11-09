"use client";

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import * as React from "react";
import {
  NavigationMenuItem,
  NavigationMenuList,
} from "@/registry/mosaico/components/mosaico/navigation-menu";

type DropdownNavigationEntry = {
  label: string;
  description?: string;
  /** Ícone do Phosphor (elemento já criado, ex.: `<RocketIcon />`). */
  icon?: React.ReactNode;
  href: string;
};

type DropdownNavigationGroup = {
  title: string;
  items: DropdownNavigationEntry[];
};

type DropdownNavigationItem = {
  label: string;
  /** Sem `groups`, o item vira um link simples. */
  href?: string;
  groups?: DropdownNavigationGroup[];
};

// ---------------------------------------------------------------------------
// Pílula de destaque: um único elemento que desliza até o gatilho sob o cursor.
// ---------------------------------------------------------------------------

type Highlight = { left: number; width: number };

const HighlightContext = React.createContext<{
  show: (element: HTMLElement | null) => void;
  hide: () => void;
} | null>(null);

function useHighlight() {
  const context = React.useContext(HighlightContext);
  if (!context) throw new Error("Use as partes dentro de <DropdownNavigation>.");
  return context;
}

const triggerClassName =
  "relative z-10 inline-flex h-9 cursor-pointer items-center gap-1 rounded-field px-3.5 text-sm font-medium text-foreground/80 transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 data-popup-open:text-foreground";

function DropdownNavigation({
  items,
  className,
  ...props
}: Omit<NavigationMenuPrimitive.Root.Props, "children"> & {
  items: DropdownNavigationItem[];
}) {
  const [highlight, setHighlight] = React.useState<Highlight | null>(null);
  // a primeira aparição não desliza do canto: só as trocas seguintes animam
  const [animate, setAnimate] = React.useState(false);

  // enquanto um painel está aberto, a pílula fica no gatilho aberto mesmo com o cursor fora da lista
  const openRef = React.useRef(false);
  const hoveredRef = React.useRef(false);

  const context = React.useMemo(
    () => ({
      show(element: HTMLElement | null) {
        if (!element) return;
        hoveredRef.current = true;
        setHighlight((previous) => {
          setAnimate(previous !== null);
          return { left: element.offsetLeft, width: element.offsetWidth };
        });
      },
      hide() {
        hoveredRef.current = false;
        if (!openRef.current) setHighlight(null);
      },
    }),
    [],
  );

  return (
    <HighlightContext.Provider value={context}>
      <NavigationMenuPrimitive.Root
        data-slot="dropdown-navigation"
        className={cn("relative flex max-w-max items-center", className)}
        {...props}
        onValueChange={(value, eventDetails) => {
          openRef.current = value != null && value !== "";
          if (!openRef.current && !hoveredRef.current) setHighlight(null);
          props.onValueChange?.(value, eventDetails);
        }}
      >
        <NavigationMenuList
          className="relative gap-0.5"
          onPointerLeave={context.hide}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) context.hide();
          }}
        >
          <span
            aria-hidden="true"
            data-slot="dropdown-navigation-highlight"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 my-auto h-9 rounded-field bg-muted opacity-0 motion-reduce:transition-none",
              highlight && "opacity-100",
              animate &&
                "transition-[transform,width,opacity] duration-(--duration-fluid-fast) ease-(--ease-fluid)",
            )}
            style={
              highlight
                ? { width: highlight.width, transform: `translateX(${highlight.left}px)` }
                : undefined
            }
          />
          {items.map((item) =>
            item.groups?.length ? (
              <DropdownNavigationMenu key={item.label} label={item.label} groups={item.groups} />
            ) : (
              <DropdownNavigationLink key={item.label} href={item.href}>
                {item.label}
              </DropdownNavigationLink>
            ),
          )}
        </NavigationMenuList>
        <DropdownNavigationPositioner />
      </NavigationMenuPrimitive.Root>
    </HighlightContext.Provider>
  );
}

/** Item com painel: gatilho + conteúdo em colunas por grupo. */
function DropdownNavigationMenu({
  label,
  groups,
}: {
  label: string;
  groups: DropdownNavigationGroup[];
}) {
  const { show } = useHighlight();
  return (
    <NavigationMenuItem
      onPointerEnter={(event) => show(event.currentTarget)}
      onFocus={(event) => show(event.currentTarget)}
    >
      <NavigationMenuPrimitive.Trigger
        data-slot="dropdown-navigation-trigger"
        className={cn(triggerClassName, "group/trigger")}
      >
        {label}
        <CaretDownIcon
          aria-hidden="true"
          className="size-3 transition-transform duration-(--duration-fluid-fast) ease-(--ease-fluid) group-data-popup-open/trigger:rotate-180 motion-reduce:transition-none"
        />
      </NavigationMenuPrimitive.Trigger>
      <DropdownNavigationContent groups={groups} />
    </NavigationMenuItem>
  );
}

/** Link simples no mesmo ritmo dos gatilhos (sem painel). */
function DropdownNavigationLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
  const { show } = useHighlight();
  return (
    <NavigationMenuItem
      onPointerEnter={(event) => show(event.currentTarget)}
      onFocus={(event) => show(event.currentTarget)}
    >
      <NavigationMenuPrimitive.Link
        data-slot="dropdown-navigation-link"
        className={cn(triggerClassName, className)}
        {...props}
      />
    </NavigationMenuItem>
  );
}

function DropdownNavigationContent({
  groups,
  className,
  ...props
}: Omit<NavigationMenuPrimitive.Content.Props, "children"> & {
  groups: DropdownNavigationGroup[];
}) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="dropdown-navigation-content"
      className={cn(
        // o conteúdo que entra/sai faz fade; a direção dá um pequeno deslocamento lateral
        "w-max p-2 transition-[opacity,translate] duration-(--duration-fluid-fast) ease-(--ease-out-fluid) data-ending-style:opacity-0 data-starting-style:opacity-0 data-[starting-style][data-activation-direction=left]:-translate-x-3 data-[starting-style][data-activation-direction=right]:translate-x-3 data-[ending-style][data-activation-direction=left]:translate-x-3 data-[ending-style][data-activation-direction=right]:-translate-x-3 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <div className="flex gap-6">
        {groups.map((group) => (
          <DropdownNavigationGroup key={group.title} group={group} />
        ))}
      </div>
    </NavigationMenuPrimitive.Content>
  );
}

function DropdownNavigationGroup({ group }: { group: DropdownNavigationGroup }) {
  return (
    <div data-slot="dropdown-navigation-group" className="flex w-64 flex-col gap-1">
      <p className="px-3 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">{group.title}</p>
      {group.items.map((entry) => (
        <DropdownNavigationEntryLink key={entry.label} entry={entry} />
      ))}
    </div>
  );
}

function DropdownNavigationEntryLink({ entry }: { entry: DropdownNavigationEntry }) {
  return (
    <NavigationMenuPrimitive.Link
      href={entry.href}
      data-slot="dropdown-navigation-entry"
      className="flex items-start gap-3 rounded-item p-3 text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 motion-reduce:transition-none [&_svg:not([class*='size-'])]:size-5"
    >
      {entry.icon ? (
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-muted-foreground">
          {entry.icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium text-foreground">{entry.label}</span>
        {entry.description ? (
          <span className="text-muted-foreground">{entry.description}</span>
        ) : null}
      </span>
    </NavigationMenuPrimitive.Link>
  );
}

/** Superfície única que redimensiona entre painéis (width/height vêm do Base UI). */
function DropdownNavigationPositioner({ className }: { className?: string }) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side="bottom"
        align="start"
        sideOffset={10}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-(--duration-fluid-fast) ease-(--ease-out-fluid) data-instant:transition-none motion-reduce:transition-none",
          className,
        )}
      >
        <NavigationMenuPrimitive.Popup className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-surface bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 transition-[opacity,transform,width,height] duration-(--duration-fluid-fast) ease-(--ease-out-fluid) outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none dark:ring-foreground/10">
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden rounded-surface" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  );
}

export {
  DropdownNavigation,
  DropdownNavigationContent,
  type DropdownNavigationEntry,
  type DropdownNavigationGroup,
  type DropdownNavigationItem,
  DropdownNavigationLink,
  DropdownNavigationMenu,
};
