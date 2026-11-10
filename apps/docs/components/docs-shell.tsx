"use client";

import { SidebarProvider } from "@multiclubes/ui/components/sidebar";
import type * as React from "react";

/**
 * Moldura das páginas de /docs: a sidebar de navegação fica fixa e só o conteúdo troca,
 * inclusive nas galerias (/docs/components e /docs/marca).
 */
export function DocsShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      className="min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
      style={{ "--sidebar-width": "calc(var(--spacing) * 72)" } as React.CSSProperties}
    >
      {sidebar}
      <div className="h-full w-full min-w-0">{children}</div>
    </SidebarProvider>
  );
}
