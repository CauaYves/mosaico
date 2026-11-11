"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@multiclubes/ui/components/command";
import { Kbd, KbdGroup } from "@multiclubes/ui/components/kbd";
import { ArrowRightIcon, CircleDashedIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { NavItem } from "@/lib/docs";

/** Componentes sugeridos antes de digitar. Ao digitar, a busca vale para todos. */
const SUGGESTED = 5;

/** Minúsculas e sem acentos, para "botao" achar "botão". */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Filtro da busca. O padrão do cmdk aceita letras soltas na ordem, e com a necessidade de cada
 * componente nas keywords (frases longas) quase tudo casava. Aqui cada palavra digitada precisa
 * aparecer inteira: no título, que vem primeiro, ou na necessidade.
 */
function searchFilter(value: string, search: string, keywords?: string[]) {
  const words = normalize(search).split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  const title = normalize(value);
  if (title.startsWith(words.join(" "))) return 1;
  if (words.every((word) => title.includes(word))) return 0.8;
  const need = normalize(keywords?.join(" ") ?? "");
  return words.every((word) => need.includes(word)) ? 0.4 : 0;
}

/**
 * Busca do header. Fica no lugar: ao focar, o campo alarga para a esquerda e as opções
 * aparecem logo abaixo dele. Ctrl+K ou "/" focam o campo; Esc fecha.
 */
export function CommandMenu({
  sections,
  components,
}: {
  sections: NavItem[];
  components: NavItem[];
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || event.key === "/") {
        const target = event.target as HTMLElement | null;
        if (
          target?.isContentEditable ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const go = (url: string) => {
    close();
    router.push(url);
  };

  return (
    <Command
      filter={searchFilter}
      data-open={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery("");
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      className={cn(
        "relative w-full overflow-visible rounded-full bg-transparent p-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:w-48 xl:w-64 data-[open=true]:md:w-64 data-[open=true]:xl:w-96 motion-reduce:transition-none",
        // O CommandInput vem com moldura de campo; aqui ele vira a pílula do header.
        "*:data-[slot=command-input-wrapper]:p-0 **:data-[slot=input-group]:h-8 **:data-[slot=input-group]:rounded-full **:data-[slot=input-group]:bg-muted/50 dark:**:data-[slot=input-group]:bg-card",
      )}
    >
      <CommandInput
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        onFocus={() => setOpen(true)}
        placeholder="Buscar na documentação..."
        aria-label="Buscar na documentação"
        className="pr-14 placeholder:text-muted-foreground"
      />
      <KbdGroup
        className={cn(
          "pointer-events-none absolute top-1.5 right-1.5 hidden sm:flex",
          open && "sm:hidden",
        )}
      >
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <CommandList
        hidden={!open}
        // Clicar numa opção não pode tirar o foco do campo antes do clique valer.
        onMouseDown={(event) => event.preventDefault()}
        className="absolute top-full right-0 mt-2 w-full min-w-64 origin-top rounded-surface border bg-popover p-1 text-popover-foreground shadow-lg animate-in duration-200 fade-in-0 zoom-in-95 slide-in-from-top-1"
      >
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        <CommandGroup heading={query ? "Páginas" : "Comece por aqui"}>
          {sections.map((item) => (
            <CommandItem key={item.url} value={item.title} onSelect={() => go(item.url)}>
              <ArrowRightIcon />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading={query ? "Componentes" : "Componentes populares"}>
          {(query ? components : components.slice(0, SUGGESTED)).map((item) => (
            <CommandItem
              key={item.url}
              value={item.title}
              keywords={item.keywords}
              onSelect={() => go(item.url)}
            >
              <CircleDashedIcon />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
