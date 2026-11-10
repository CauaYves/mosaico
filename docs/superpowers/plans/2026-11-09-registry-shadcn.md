# Registry shadcn do Mosaico: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada arquivo de `packages/ui/src` vira um item instalável com `npx shadcn@latest add CauaYves/mosaico/<nome>`, já com o tema Multiclubes, sem tocar em `components/ui` de quem instala.

**Architecture:** O GitHub serve o registry direto do código (registry de fonte). Um script em `packages/ui/scripts/registry/` lê os imports de cada arquivo e o `globals.css` e gera `packages/ui/registry.json`. A CI roda o script em modo `--check`. Os imports internos do kit passam ao formato `@/registry/mosaico/...`, que o CLI reescreve, e um alias resolve esse formato no monorepo.

**Tech Stack:** shadcn CLI (GitHub registries), TypeScript executado direto pelo Node 24, Vitest, PostCSS (parser do CSS), Next 16 + Turbopack, pnpm/turbo, Biome.

**Spec:** `docs/superpowers/specs/2026-11-09-registry-shadcn-design.md`

## Global Constraints

- Endereço de item: `CauaYves/mosaico/<item>`, sempre completo e sem `#ref`. Nome solto em `registryDependencies` é proibido.
- Comando documentado: `npx shadcn@latest add CauaYves/mosaico/<nome>`.
- Pastas de destino: `@components/mosaico/`, `@hooks/mosaico/`, `@lib/mosaico/`. Nada é gravado em `@ui/`.
- Caminhos (`path`) em `packages/ui/registry.json` são relativos a `packages/ui/`, por exemplo `src/components/button.tsx`.
- O tema vai no campo `css` (`":root"`, `".dark"`), nunca em `cssVars`.
- `dependencies` usam a faixa do `packages/ui/package.json`: `nome@faixa`, por exemplo `recharts@3.8.0`.
- Entram todos os 75 arquivos de `packages/ui/src/components` (sem `*.test.tsx`), `src/hooks/use-mobile.ts`, `src/hooks/use-highlighted-code.ts`, `src/lib/utils.ts` e `src/lib/highlighter.tsx`.
- `@source "../"` não vai para o registry.
- Imports que os apps fazem (`@multiclubes/ui/components/*`) não mudam.
- Lint (`pnpm lint`), tipos (`pnpm check-types`), testes (`pnpm test`) e build (`pnpm build`) continuam passando.
- Arquivos lidos para comparação (`--check`) têm `\r\n` normalizado para `\n`, porque o checkout no Windows usa CRLF.

## Review Focus

- Import de subcaminho npm (`@base-ui/react/dialog`, `shiki/core`, `@phosphor-icons/react/dist/ssr`) vira o pacote raiz (`@base-ui/react`, `shiki`, `@phosphor-icons/react`) com a faixa certa. O teste fica na Task 3.
- `import type` de outro arquivo do kit continua gerando `registryDependency`, porque o arquivo instalado não compila sem ele. Task 3.
- Pacote importado que não está no `package.json` do `ui` faz o script falhar com o nome do arquivo e do pacote, em vez de gerar um item sem dependência. Task 3.
- Projeto que já tem o `button` oficial em `components/ui`: depois do `add` do dialog do Mosaico, `components/ui/button.tsx` fica idêntico ao de antes. Task 6.
- Rodar `add` duas vezes não duplica blocos `:root`/`.dark` nem keyframes no `globals.css`. Task 6.

---

### Task 1: Validar o formato de import com subpasta e o tema como dependência

Responde as duas incógnitas do spec antes de escrever código definitivo. **Não é commitado na branch de trabalho.** Usa uma branch temporária no GitHub, apagada no fim.

**Files:**
- Create: `packages/ui/scripts/registry/config.ts` (o único arquivo que fica, com o resultado)

**Interfaces:**
- Produces: `packages/ui/scripts/registry/config.ts`

```ts
export const REGISTRY_REPO = "CauaYves/mosaico";
/** Prefixo de import entre arquivos do kit, por pasta de origem em src/. */
export const IMPORT_PREFIX: Record<"components" | "hooks" | "lib", string>;
/** `target` de cada pasta de origem, com placeholder do CLI. */
export const TARGET_DIR: Record<"components" | "hooks" | "lib", string>;
```

- [ ] **Step 1: Montar a branch temporária `spike-registry-subpasta`**

Na raiz, um `registry.json` com `include: ["packages/ui/registry.json"]`. Em `packages/ui/registry.json`, à mão:
- `theme`: tipo `registry:theme`, com `css` contendo `":root": {"--primary": "oklch(0.44 0.213 263)"}` e `".dark": {"--primary": "oklch(0.62 0.2 263)"}`.
- `button`: `target` `@components/mosaico/button.tsx`, dependendo de `CauaYves/mosaico/theme#spike-registry-subpasta`.
- `use-mobile`: `target` `@hooks/mosaico/use-mobile.ts`.
- `probe`: um arquivo em `packages/ui/spike/probe.tsx` que importa `Button` de `@/registry/mosaico/components/mosaico/button` e `useIsMobile` de `@/registry/mosaico/hooks/mosaico/use-mobile`, com `target` `@components/mosaico/probe.tsx` e dependências nos dois itens acima (com `#spike-registry-subpasta`).

Faça push da branch.

- [ ] **Step 2: Instalar num projeto com o shadcn oficial**

Num diretório temporário: `npx create-next-app@latest probe-app --ts --tailwind --app --yes`, depois `npx shadcn@latest init --defaults --yes` (cria `components/ui/button.tsx` oficial), um commit nesse repo temporário e por fim `npx shadcn@latest add "CauaYves/mosaico/probe#spike-registry-subpasta" --yes`.

Expected:
- `components/mosaico/probe.tsx` importa de `@/components/mosaico/button` e de `@/hooks/mosaico/use-mobile`.
- `git diff --stat components/ui` no projeto temporário está vazio.
- `--primary` em `app/globals.css` é `oklch(0.44 0.213 263)`.

- [ ] **Step 3: Se algum item falhar, testar o próximo formato**

Para o import, teste nesta ordem: `@/registry/mosaico/ui/mosaico/button` e depois `@/registry/mosaico/components/button` com `target` `@components/mosaico/button.tsx`. Para o tema, teste `type: "registry:style"`. Se nenhum formato passar nos três critérios do Step 2, **pare e leve o resultado ao usuário**. O spec manda conversar antes da alternativa de cópia gerada.

- [ ] **Step 4: Gravar o resultado em `config.ts`**

Use os valores que passaram. Exemplo, se o primeiro formato passar:
`IMPORT_PREFIX = { components: "@/registry/mosaico/components/mosaico", hooks: "@/registry/mosaico/hooks/mosaico", lib: "@/registry/mosaico/lib/mosaico" }` e `TARGET_DIR = { components: "@components/mosaico", hooks: "@hooks/mosaico", lib: "@lib/mosaico" }`. Anote também o `type` do tema que funcionou, num comentário sobre `REGISTRY_REPO`.

- [ ] **Step 5: Apagar a branch temporária**

Run: `git push origin --delete spike-registry-subpasta`, e depois `git ls-remote --heads origin spike-registry-subpasta`.
Expected: nenhuma saída.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/scripts/registry/config.ts
git commit -m "chore(ui): formato de import e destinos do registry validados"
```

---

### Task 2: Imports internos no formato do registry e alias no monorepo

**Files:**
- Create: `packages/ui/scripts/registry/codemod-imports.ts`
- Modify: os 26 arquivos de `packages/ui/src/components/*.tsx` com imports `@multiclubes/ui/...` ou `./...`, e `packages/ui/src/hooks/use-highlighted-code.ts`
- Modify: `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `apps/docs/tsconfig.json`, `apps/web/tsconfig.json`
- Test: `packages/ui/scripts/registry/codemod-imports.test.ts`

**Interfaces:**
- Consumes: `IMPORT_PREFIX` de `config.ts` (Task 1)
- Produces: `rewriteInternalImports(code: string, fileDir: "components" | "hooks" | "lib"): string`

- [ ] **Step 1: Escrever o teste que falha**

O teste usa os valores de `IMPORT_PREFIX`, não strings fixas:

```ts
import { IMPORT_PREFIX } from "./config.ts";
import { rewriteInternalImports } from "./codemod-imports.ts";

test("pacote do kit vira o prefixo do registry", () => {
  expect(rewriteInternalImports('import { Button } from "@multiclubes/ui/components/button";', "components"))
    .toBe(`import { Button } from "${IMPORT_PREFIX.components}/button";`);
  expect(rewriteInternalImports('import { useIsMobile } from "@multiclubes/ui/hooks/use-mobile";', "components"))
    .toBe(`import { useIsMobile } from "${IMPORT_PREFIX.hooks}/use-mobile";`);
  expect(rewriteInternalImports('import { loadHighlighter } from "@multiclubes/ui/lib/highlighter";', "hooks"))
    .toBe(`import { loadHighlighter } from "${IMPORT_PREFIX.lib}/highlighter";`);
});

test("relativo da mesma pasta vira o prefixo da pasta", () => {
  expect(rewriteInternalImports('import { Seal } from "./seal";', "components"))
    .toBe(`import { Seal } from "${IMPORT_PREFIX.components}/seal";`);
});

test("imports de fora do kit não mudam", () => {
  const code = 'import { cn } from "cn";\nimport type * as React from "react";';
  expect(rewriteInternalImports(code, "components")).toBe(code);
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `pnpm --filter @multiclubes/ui exec vitest run scripts/registry/codemod-imports.test.ts`
Expected: FAIL, porque o módulo não existe.

- [ ] **Step 3: Implementar `rewriteInternalImports`**

Faça a troca por regex sobre os especificadores entre aspas: `@multiclubes/ui/(components|hooks|lib)/<nome>` e `./<nome>`. A pasta do relativo é `fileDir`. Inclua `tsconfig` e `vitest` para enxergar `scripts/`: no `include` do `packages/ui/tsconfig.json`, adicione `"scripts"`.

- [ ] **Step 4: Rodar o teste e ver passar**

Run: o mesmo comando do Step 2.
Expected: PASS.

- [ ] **Step 5: Aplicar o codemod em `src/` e configurar os aliases**

Rode o codemod uma vez sobre `src/components/*.tsx` (exceto `*.test.tsx`), `src/hooks/*.ts` e `src/lib/*.ts*`. Ele não roda na CI. Depois:
- `packages/ui/tsconfig.json`, `apps/docs/tsconfig.json` e `apps/web/tsconfig.json`: em `paths`, adicione `"<IMPORT_PREFIX.components>/*": ["<caminho até packages/ui/src/components>/*"]` e o mesmo para `hooks` e `lib`. Nos apps, o caminho é `../../packages/ui/src/...`; no `ui`, `./src/...`.
- `packages/ui/vitest.config.ts`: em `resolve.alias`, adicione as três entradas. As mais específicas vêm antes de `@multiclubes/ui`.

- [ ] **Step 6: Verificar o monorepo inteiro**

Run: `pnpm check-types && pnpm test && pnpm build`
Expected: tudo passa. O build do docs e do web compila com Turbopack. **Se o build do docs ou do web falhar por não resolver o alias, pare e leve ao usuário**, como o spec manda.

Run: `pnpm exec biome check packages/ui apps/docs/tsconfig.json apps/web/tsconfig.json`
Expected: sem erros nos arquivos alterados.

- [ ] **Step 7: Commit**

```bash
git add packages/ui apps/docs/tsconfig.json apps/web/tsconfig.json
git commit -m "refactor(ui): imports internos no formato do registry shadcn"
```

---

### Task 3: Grafo de itens a partir do código

**Files:**
- Create: `packages/ui/scripts/registry/items.ts`
- Test: `packages/ui/scripts/registry/items.test.ts`

**Interfaces:**
- Consumes: `REGISTRY_REPO`, `IMPORT_PREFIX` e `TARGET_DIR` de `config.ts`
- Produces:

```ts
export type SourceFile = { dir: "components" | "hooks" | "lib"; file: string; code: string };
export type Meta = { title?: string; description?: string };
export type RegistryItem = {
  name: string;
  type: "registry:ui" | "registry:hook" | "registry:lib";
  title: string;
  description: string;
  dependencies: string[];          // "pacote@faixa", ordenado
  registryDependencies: string[];  // "CauaYves/mosaico/<item>", ordenado, sempre inclui ".../theme"
  files: { path: string; type: RegistryItem["type"]; target: string }[];
  css?: Record<string, unknown>;   // preenchido na Task 4
};
export function buildItem(src: SourceFile, versions: Record<string, string>, meta: Meta): RegistryItem;
```

- [ ] **Step 1: Escrever os testes que falham**

```ts
const versions = { "@base-ui/react": "^1.4.0", "@phosphor-icons/react": "^2.1.10", cn: "^0.5.0", shiki: "^4.5.0" };
const dialog = {
  dir: "components", file: "dialog.tsx",
  code: [
    '"use client";',
    'import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";',
    `import { Button } from "${IMPORT_PREFIX.components}/button";`,
    'import { XIcon } from "@phosphor-icons/react/dist/ssr";',
    'import { cn } from "cn";',
    'import type * as React from "react";',
  ].join("\n"),
} as const;

test("dependências npm com faixa, sem react, subcaminho vira raiz", () => {
  expect(buildItem(dialog, versions, {}).dependencies)
    .toEqual(["@base-ui/react@^1.4.0", "@phosphor-icons/react@^2.1.10", "cn@^0.5.0"]);
});

test("dependências internas com endereço completo e o tema", () => {
  expect(buildItem(dialog, versions, {}).registryDependencies)
    .toEqual(["CauaYves/mosaico/button", "CauaYves/mosaico/theme"]);
});

test("import type de arquivo do kit também conta", () => {
  const src = { dir: "components", file: "x.tsx", code: `import type { ButtonProps } from "${IMPORT_PREFIX.components}/button";` } as const;
  expect(buildItem(src, versions, {}).registryDependencies).toContain("CauaYves/mosaico/button");
});

test("caminho relativo a packages/ui e target na pasta do Mosaico", () => {
  expect(buildItem(dialog, versions, {}).files)
    .toEqual([{ path: "src/components/dialog.tsx", type: "registry:ui", target: `${TARGET_DIR.components}/dialog.tsx` }]);
});

test("hook e lib ganham o tipo certo", () => {
  expect(buildItem({ dir: "hooks", file: "use-mobile.ts", code: "" }, versions, {}).type).toBe("registry:hook");
  expect(buildItem({ dir: "lib", file: "highlighter.tsx", code: 'import { createHighlighterCore } from "shiki/core";' }, versions, {}).dependencies)
    .toEqual(["shiki@^4.5.0"]);
});

test("título e descrição: do meta, ou o nome em Title Case e descrição vazia", () => {
  expect(buildItem(dialog, versions, { title: "Dialog", description: "Janela." })).toMatchObject({ title: "Dialog", description: "Janela." });
  expect(buildItem({ dir: "components", file: "chart-donut.tsx", code: "" }, versions, {})).toMatchObject({ title: "Chart Donut", description: "" });
});

test("pacote fora do package.json falha com arquivo e pacote", () => {
  const src = { dir: "components", file: "x.tsx", code: 'import z from "zod";' } as const;
  expect(() => buildItem(src, versions, {})).toThrow(/x\.tsx.*zod/);
});
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `pnpm --filter @multiclubes/ui exec vitest run scripts/registry/items.test.ts`
Expected: FAIL, porque o módulo não existe.

- [ ] **Step 3: Implementar `buildItem` em `items.ts`**

Extraia os especificadores de `import ... from "x"`, `import "x"` e `export ... from "x"`. Ficam de fora `react`, `react-dom` e especificadores relativos. O nome do item é o nome do arquivo sem extensão. O item do `theme` não passa por aqui (Task 4).

- [ ] **Step 4: Rodar os testes e ver passar**

Run: o mesmo comando do Step 2.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/scripts/registry/items.ts packages/ui/scripts/registry/items.test.ts
git commit -m "feat(ui): monta itens do registry a partir dos imports"
```

---

### Task 4: CSS do tema e dos componentes a partir do `globals.css`

**Files:**
- Create: `packages/ui/scripts/registry/css.ts`
- Modify: `packages/ui/src/styles/globals.css`: só comentários marcadores, sem mudar nenhuma regra
- Modify: `packages/ui/package.json`: `devDependencies` ganha `"postcss": "^8.5.6"`
- Test: `packages/ui/scripts/registry/css.test.ts`

**Interfaces:**
- Produces:

```ts
/** CSS (string) -> objeto do campo `css` do registry. */
export function cssToRegistry(css: string): Record<string, unknown>;
/** Separa globals.css em blocos por item, pelos marcadores. Sem marcador = "theme". */
export function splitByItem(globalsCss: string): Record<string, string>;
export function buildThemeItem(themeCss: Record<string, unknown>, versions: Record<string, string>): {
  name: "theme"; type: string; title: string; description: string;
  dependencies: string[]; css: Record<string, unknown>;
};
```

Marcadores no `globals.css`: `/* @registry <item> */` abre e `/* @registry end */` fecha. Vão em volta de `theme-reveal` e da view-transition (`theme-toggle`), dos keyframes `theme-icon-*` (`theme-toggle`), de `brand-loader-*` (`brand-loader`), de `mosaic-loader-pulse` (`mosaic-loader`) e da regra `.recharts-pie-sector` (`chart-donut`). As transições fluidas (`:root` com `--ease-fluid`, keyframes `fluid-*`, `@utility animate-fluid-*`, `fluid-stagger`, `prefers-reduced-motion`) ficam no `theme`, porque o `bottom-nav` e o site usam.

- [ ] **Step 1: Escrever os testes que falham**

```ts
test("regras, at-rules aninhadas e @apply", () => {
  expect(cssToRegistry(":root { --primary: oklch(0.44 0.213 263); }\n@layer base { body { @apply bg-background text-foreground; } }"))
    .toEqual({
      ":root": { "--primary": "oklch(0.44 0.213 263)" },
      "@layer base": { body: { "@apply bg-background text-foreground": {} } },
    });
});

test("@import, @custom-variant e @source", () => {
  const out = cssToRegistry('@import "tw-animate-css";\n@source "../";\n@custom-variant dark (&:is(.dark *));');
  expect(out).toEqual({ '@import "tw-animate-css"': {}, "@custom-variant dark (&:is(.dark *))": {} });
});

test("keyframes, @utility e @supports aninhado", () => {
  const out = cssToRegistry("@utility fluid-stagger { & > * { --fluid-index: 16; } @supports (x: y) { & > * { --fluid-index: 1; } } }");
  expect(out).toEqual({ "@utility fluid-stagger": { "& > *": { "--fluid-index": "16" }, "@supports (x: y)": { "& > *": { "--fluid-index": "1" } } } });
});

test("marcadores separam por item; o resto é theme", () => {
  const parts = splitByItem("a{b:c}\n/* @registry brand-loader */\n@keyframes x{from{opacity:0}}\n/* @registry end */\nd{e:f}");
  expect(Object.keys(parts).sort()).toEqual(["brand-loader", "theme"]);
  expect(parts["brand-loader"]).toContain("@keyframes x");
  expect(parts.theme).not.toContain("@keyframes x");
});

const srcDir = join(import.meta.dirname, "../../src");

test("o globals.css real: theme tem :root, .dark e @theme inline, sem @source", () => {
  const parts = splitByItem(readFileSync(join(srcDir, "styles/globals.css"), "utf8"));
  const theme = cssToRegistry(parts.theme);
  expect(theme[":root"]).toMatchObject({ "--primary": "oklch(0.44 0.213 263)", "--highlight": "oklch(0.914 0.191 101.4)" });
  expect(theme[".dark"]).toMatchObject({ "--primary": "oklch(0.62 0.2 263)" });
  expect(theme["@theme inline"]).toMatchObject({ "--radius-field": "calc(var(--surface-radius) - var(--radius-step))" });
  expect(JSON.stringify(theme)).not.toContain("@source");
  expect(Object.keys(parts)).toEqual(expect.arrayContaining(["theme", "theme-toggle", "brand-loader", "mosaic-loader", "chart-donut"]));
});
```

Duas observações sobre os testes:
- Os comentários do CSS são descartados.
- Quando um seletor se repete (dois blocos `:root`), as declarações se juntam no mesmo objeto, e a última vence.

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `pnpm --filter @multiclubes/ui exec vitest run scripts/registry/css.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `css.ts` e colocar os marcadores no `globals.css`**

O `cssToRegistry` usa o `postcss.parse` e percorre a árvore. Ele descarta `@source` e os comentários. Uma declaração `@apply` vira chave com objeto vazio. O `buildThemeItem` usa o `type` do tema gravado no comentário de `config.ts` (Task 1) e as `dependencies` `tw-animate-css@<faixa>` e `shadcn@<faixa>`, porque o tema importa `shadcn/tailwind.css`.

- [ ] **Step 4: Rodar os testes e ver passar**

Run: o mesmo comando do Step 2.
Expected: PASS.

Run: `pnpm --filter docs build`
Expected: passa, porque os marcadores são só comentários e o CSS não muda.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/scripts/registry/css.ts packages/ui/scripts/registry/css.test.ts packages/ui/src/styles/globals.css packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): converte o tema e as animações para o formato do registry"
```

---

### Task 5: Gerador, `registry.json` e checagem na CI

**Files:**
- Create: `packages/ui/scripts/registry/build.ts`
- Create: `registry.json` (raiz)
- Create: `packages/ui/registry.json` (gerado)
- Modify: `packages/ui/package.json`: scripts `"registry": "node scripts/registry/build.ts"` e `"registry:check": "node scripts/registry/build.ts --check"`
- Modify: `.github/workflows/ci.yml`: passo "Registry", depois de "Referência da skill"
- Test: `packages/ui/scripts/registry/build.test.ts`

**Interfaces:**
- Consumes: `buildItem` (Task 3), `splitByItem`, `cssToRegistry` e `buildThemeItem` (Task 4)
- Produces: `buildRegistry(uiRoot: string, docsContentRoot: string): string`, que devolve o JSON final formatado com 2 espaços e `\n` no fim.

Os metadados vêm do frontmatter (`title`, `description`) de `apps/docs/content/docs/components/<nome>.mdx` ou de `apps/docs/content/docs/components-multiclubes/<nome>.mdx`. Os itens saem ordenados: `theme` primeiro, depois os outros por nome. O `css` de cada item vem do bloco de mesmo nome do `splitByItem`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
const uiRoot = join(import.meta.dirname, "../..");
const docsContentRoot = join(uiRoot, "../../apps/docs/content/docs");
const json = JSON.parse(buildRegistry(uiRoot, docsContentRoot));

test("um item por arquivo de src, mais o tema", () => {
  expect(json.items).toHaveLength(1 + 75 + 2 + 2);
  expect(json.items[0].name).toBe("theme");
});

test("nenhuma dependência com nome solto e nenhum target em @ui/", () => {
  for (const item of json.items) {
    for (const dep of item.registryDependencies ?? []) expect(dep).toMatch(/^CauaYves\/mosaico\/[a-z0-9-]+$/);
    for (const f of item.files ?? []) expect(f.target.startsWith("@ui/")).toBe(false);
  }
});

test("todo registryDependency existe como item", () => {
  const names = new Set(json.items.map((i: { name: string }) => i.name));
  for (const item of json.items)
    for (const dep of item.registryDependencies ?? []) expect(names).toContain(dep.split("/").at(-1));
});

test("metadado do MDX e CSS próprio", () => {
  const button = json.items.find((i: { name: string }) => i.name === "button");
  expect(button.description).toBe("Displays a button or a component that looks like a button.");
  const loader = json.items.find((i: { name: string }) => i.name === "brand-loader");
  expect(Object.keys(loader.css)).toContain("@keyframes brand-loader-draw");
});
```

- [ ] **Step 2: Rodar os testes e ver falhar**

Run: `pnpm --filter @multiclubes/ui exec vitest run scripts/registry/build.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar `build.ts`**

Sem argumento, `build.ts` escreve `packages/ui/registry.json` e imprime o caminho. Com `--check`, compara com o arquivo existente, normalizando `\r\n`. Se for diferente, sai com código 1 e a mensagem `O registry está desatualizado. Rode "pnpm --filter @multiclubes/ui registry".`; se for igual, imprime `Registry em dia.`. É o mesmo padrão do `apps/docs/scripts/sync-ia.mjs`. O `registry.json` da raiz é fixo: `$schema`, `name: "mosaico"`, `homepage: "https://github.com/CauaYves/mosaico"` e `include: ["packages/ui/registry.json"]`.

- [ ] **Step 4: Rodar os testes e ver passar; gerar o arquivo**

Run: `pnpm --filter @multiclubes/ui exec vitest run scripts/registry/build.test.ts && pnpm --filter @multiclubes/ui registry && pnpm --filter @multiclubes/ui registry:check`
Expected: PASS, depois `Escrito: .../packages/ui/registry.json`, depois `Registry em dia.`.

- [ ] **Step 5: Passo na CI**

No `.github/workflows/ci.yml`, depois de "Referência da skill", acrescente o passo `- name: Registry`, com `run: pnpm --filter @multiclubes/ui registry:check`.

- [ ] **Step 6: Commit**

```bash
git add registry.json packages/ui/registry.json packages/ui/scripts/registry/build.ts packages/ui/scripts/registry/build.test.ts packages/ui/package.json .github/workflows/ci.yml
git commit -m "feat(ui): gera o registry.json e checa na CI"
```

---

### Task 6: Teste de instalação ponta a ponta

**Files:**
- Create: `packages/ui/scripts/registry/smoke.ts`
- Modify: `packages/ui/package.json`: script `"registry:smoke": "node scripts/registry/smoke.ts"`

**Interfaces:**
- Consumes: `packages/ui/registry.json` publicado na `main` (Task 5)
- Produces: `registry:smoke [item...]`, que sai com código 0 se tudo passar. O padrão de itens é `dialog sidebar date-field theme-toggle`.

Como as dependências internas não têm `#ref`, elas sempre vêm da `main`. Por isso o smoke roda **depois do merge na `main`**: localmente e num workflow com `on: push: branches: [main]` e `workflow_dispatch`. Não roda nos PRs.

- [ ] **Step 1: Implementar `smoke.ts`**

O `smoke.ts` cria um projeto num diretório temporário do sistema com `create-next-app` (`--ts --tailwind --app --yes`). Depois roda `shadcn init --defaults --yes` e grava o hash de cada arquivo de `components/ui`. Para cada item, roda `npx shadcn@latest add CauaYves/mosaico/<item> --yes` duas vezes. Ao fim, ele confere:

1. Os hashes de `components/ui` continuam iguais.
2. Nenhum arquivo de `components/mosaico`, `hooks/mosaico` ou `lib/mosaico` contém `@multiclubes/ui` ou `@/registry/`.
3. Em `app/globals.css`, `--primary` é `oklch(0.44 0.213 263)` em `:root` e `oklch(0.62 0.2 263)` em `.dark`.
4. `@keyframes brand-loader-draw` aparece no máximo uma vez, e o mesmo vale para `:root {` e `.dark {` fora de `@supports`.
5. `npx tsc --noEmit` e `npx next build` passam no projeto.

Cada falha imprime qual checagem falhou e o arquivo.

- [ ] **Step 2: Rodar depois que as Tasks 2 a 5 estiverem na `main`**

Run: `pnpm --filter @multiclubes/ui registry:smoke`
Expected: `5 checagens ok` e código de saída 0.

- [ ] **Step 3: Workflow**

Crie `.github/workflows/registry-smoke.yml`, com `on: push: branches: [main]` e `workflow_dispatch`, que roda `pnpm install --frozen-lockfile` e `pnpm --filter @multiclubes/ui registry:smoke`. O Node 24 e o pnpm são configurados como no `ci.yml`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/scripts/registry/smoke.ts packages/ui/package.json .github/workflows/registry-smoke.yml
git commit -m "test(ui): instalação do registry ponta a ponta"
```

---

### Task 7: Documentação e plano

**Files:**
- Modify: `apps/docs/components/installation.tsx`
- Modify: `apps/docs/content/docs/installation.mdx`
- Modify: `README.md` (seções "Componentes" e "Usando o kit em um app")
- Modify: `docs/plano.md` (seção 4.3, Fase 4, decisões em aberto 1 e 3, item "Avaliar o registry shadcn" da Fase 7)

**Interfaces:**
- Consumes: o comando e as pastas definidos nas Global Constraints

- [ ] **Step 1: Seção de instalação de cada componente**

O `Installation({ name })` passa a renderizar o `CodeBlockCommand` com as quatro variantes de gerenciador:

| Prop | Valor |
| --- | --- |
| `__npm__` | `npx shadcn@latest add CauaYves/mosaico/${name}` |
| `__pnpm__` | `pnpm dlx shadcn@latest add CauaYves/mosaico/${name}` |
| `__yarn__` | `yarn dlx shadcn@latest add CauaYves/mosaico/${name}` |
| `__bun__` | `bunx --bun shadcn@latest add CauaYves/mosaico/${name}` |

O texto em volta diz que o componente é instalado em `components/mosaico/` e já traz o tema Multiclubes. Ele deixa de falar em `@multiclubes/ui` e em `pnpm add`.

- [ ] **Step 2: Página `/docs/installation`**

Reescreva a página com estas seções:
1. **Requisitos:** React 19.2 e Tailwind v4.
2. **Projeto novo:** `npx shadcn@latest init`.
3. **Instale um componente:** o comando acima, com o `button` como exemplo.
4. **Onde os arquivos ficam:** `components/mosaico`, `hooks/mosaico` e `lib/mosaico`, convivendo com `components/ui`.
5. **Tema:** cada `add` reaplica as cores Multiclubes no CSS global, então a personalização de cliente fica num arquivo de tema separado, carregado depois dele, só com as variáveis que mudam.
6. **Fonte:** carregar a Geist no app, com o exemplo de `next/font` do `app/layout.tsx` do próprio docs.
7. **Atualizar:** rodar o `add` de novo traz a versão da `main`.

Remova a seção "Next.js / transpilePackages".

- [ ] **Step 3: `README.md` e `docs/plano.md`**

No `README.md`, troque a seção "Usando o kit em um app" pelo comando do registry e aponte para `/docs/installation`.

No `plano.md`:
- Na 4.3, o modelo B (registry) passa a ser o adotado e o A (pacote npm) fica registrado como descartado, com a data 2026-11-09 e o motivo da escolha.
- A Fase 4 deixa de falar em build, Azure Artifacts e Changesets. Passa a dizer que o registry é servido pelo GitHub e que a `main` é a versão publicada.
- As decisões em aberto 1 e 3 vão para "Decidido".

- [ ] **Step 4: Verificar**

Run: `pnpm lint && pnpm --filter docs check-types && pnpm --filter docs build`
Expected: passa, considerando só os arquivos alterados. O lint do repo inteiro já falha antes desta mudança por causa de CRLF; se continuar falhando, confira que nenhum dos erros vem dos arquivos desta task.

Run: `curl -s http://localhost:3001/docs/components/button | grep -c "CauaYves/mosaico/button"`, com o docs rodando.
Expected: ao menos `1`.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/components/installation.tsx apps/docs/content/docs/installation.mdx README.md docs/plano.md
git commit -m "docs: instalação pelo registry shadcn"
```
