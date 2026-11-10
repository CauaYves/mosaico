// Valores do registry shadcn do Mosaico, validados em 2026-11-09 num projeto Next com o shadcn
// oficial já instalado em components/ui (plano: docs/superpowers/plans/2026-11-09-registry-shadcn.md,
// Task 1). Com estes prefixos, o CLI reescreve os imports para os aliases do projeto e grava em
// pastas próprias, sem tocar em components/ui. O tema funciona como dependência com
// type "registry:theme" e as variáveis no campo `css`.

export const REGISTRY_REPO = "CauaYves/mosaico";

/** `type` do item do tema. */
export const THEME_TYPE = "registry:theme";

/** Prefixo de import entre arquivos do kit, por pasta de origem em src/. */
export const IMPORT_PREFIX: Record<"components" | "hooks" | "lib", string> = {
  components: "@/registry/mosaico/components/mosaico",
  hooks: "@/registry/mosaico/hooks/mosaico",
  lib: "@/registry/mosaico/lib/mosaico",
};

/** `target` de cada pasta de origem, com placeholder do CLI. */
export const TARGET_DIR: Record<"components" | "hooks" | "lib", string> = {
  components: "@components/mosaico",
  hooks: "@hooks/mosaico",
  lib: "@lib/mosaico",
};
