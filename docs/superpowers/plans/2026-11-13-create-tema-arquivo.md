# Tema de cliente em arquivo (/create) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O `/create` gera um `<cliente>.css` para baixar, com um link de edição no cabeçalho; as escolhas ficam na URL e um arquivo gerado reabre a página com as mesmas escolhas.

**Architecture:** Funções puras em `apps/docs/lib/create-theme-file.ts` (serializar/ler parâmetros, nome do arquivo, montar o arquivo, ler o link do cabeçalho), testadas com Vitest. O `create-customizer.tsx` troca os cinco `useState` por um objeto de escolhas sincronizado com a URL via `window.history.replaceState`, e ganha campo de nome, download e abertura de arquivo. Tudo no navegador, sem servidor.

**Tech Stack:** Next.js (App Router, versão do repo — ler `apps/docs/node_modules/next/dist/docs/` antes de usar APIs do Next), React 19.2, Vitest 5, componentes `@multiclubes/ui`.

**Spec:** `docs/superpowers/specs/2026-11-13-create-tema-arquivo-design.md`

## Global Constraints

- Tudo roda no navegador; nenhum endpoint, rota de API ou deploy.
- O arquivo de tema nunca é escrito no `globals.css`: é sempre um arquivo separado, carregado depois dele.
- Parâmetros da URL, nesta ordem: `cliente`, `cor`, `graficos`, `raio`, `fonte`, `titulos`. Ausente ou inválido → padrão, sem erro.
- Atualização da URL com `replace` (sem nova entrada no histórico).
- Nome do arquivo: cliente em kebab-case + `.css`; sem nome, `tema-mosaico.css`.
- Mensagem de arquivo sem link: `Este arquivo não foi gerado pelo Mosaico. Abra um tema baixado do /create.`
- Textos de interface em português, sentence case. Rótulos fixos: **Nome do cliente**, **Baixar tema**, **Abrir tema**, **Usar este tema**.
- `pnpm lint`, `pnpm check-types`, `pnpm test` e `pnpm build` passam na raiz.
- Commits sem `Co-Authored-By` nem rodapé de ferramenta de IA.

## Review Focus

1. Nome de cliente com `*/` ou quebra de linha fecharia o comentário do cabeçalho e quebraria o CSS → o cabeçalho remove `*/` e quebras de linha do nome (teste na Task 1).
2. Nome com acentos e espaços (`Flamengo Sócio`) → `flamengo-socio.css`; nome só com símbolos → `tema-mosaico.css` (teste na Task 1).
3. Fonte com espaço no nome (`DM Sans`) precisa ir e voltar pela URL intacta (teste na Task 1).
4. Link de edição de outra origem (gerado em `localhost:3001`, aberto em outro endereço) → só os parâmetros são lidos, a origem é ignorada (teste na Task 1).
5. Abrir a página sem parâmetros não pode reescrever a URL antes de ler os parâmetros existentes (verificação manual na Task 2).

---

### Task 1: Funções do arquivo de tema e Vitest no docs

**Files:**
- Create: `apps/docs/lib/create-theme-file.ts`
- Create: `apps/docs/lib/create-theme-file.test.ts`
- Modify: `apps/docs/package.json` (script `"test": "vitest run"`, devDependency `"vitest": "^5.0.5"`, a mesma faixa do `packages/ui`)

**Interfaces:**
- Produces:
  ```ts
  export type ThemeChoices = {
    cliente: string; cor: string; graficos: string; raio: string; fonte: string; titulos: string;
  };
  export type ChoiceOptions = { colors: string[]; charts: string[]; radii: string[]; fonts: string[] };
  export function choicesToSearch(choices: ThemeChoices): string; // sem "?" inicial
  export function choicesFromSearch(search: string, options: ChoiceOptions, defaults: ThemeChoices): ThemeChoices;
  export function themeFileName(cliente: string): string;
  export function themeFile(input: { cliente: string; editUrl: string; css: string; date: string }): string;
  export function editUrlFromFile(text: string): string | null;
  ```
  `titulos` aceita `""` (igual ao texto) ou um nome de `options.fonts`. `cliente` é texto livre: `trim()` e no máximo 80 caracteres. `search` aceita com ou sem `?`.

- [ ] **Step 1: Instalar o Vitest no docs**

Run (em `apps/docs`): `pnpm add -D vitest@^5.0.5` e adicionar `"test": "vitest run"` em `scripts`.
Expected: `pnpm test` roda e reporta "No test files found".

- [ ] **Step 2: Escrever os testes que falham**

```ts
import { describe, expect, it } from "vitest";
import { choicesFromSearch, choicesToSearch, editUrlFromFile, themeFile, themeFileName } from "./create-theme-file";

const options = { colors: ["red", "blue"], charts: ["blue", "amber"], radii: ["0", "0.5", "0.625"], fonts: ["Geist", "DM Sans"] };
const defaults = { cliente: "", cor: "blue", graficos: "blue", raio: "0.625", fonte: "Geist", titulos: "" };
const flamengo = { cliente: "Flamengo", cor: "red", graficos: "amber", raio: "0.5", fonte: "DM Sans", titulos: "Geist" };

describe("parâmetros da URL", () => {
  it("serializa na ordem fixa", () => {
    expect(choicesToSearch(flamengo)).toBe("cliente=Flamengo&cor=red&graficos=amber&raio=0.5&fonte=DM+Sans&titulos=Geist");
  });
  it("ida e volta preserva as escolhas, inclusive fonte com espaço", () => {
    expect(choicesFromSearch(choicesToSearch(flamengo), options, defaults)).toEqual(flamengo);
  });
  it("aceita ? inicial", () => {
    expect(choicesFromSearch(`?${choicesToSearch(flamengo)}`, options, defaults)).toEqual(flamengo);
  });
  it("valor ausente ou inválido volta ao padrão", () => {
    expect(choicesFromSearch("cor=roxo&raio=9&fonte=Comic&titulos=Comic", options, defaults)).toEqual(defaults);
  });
  it("corta o nome do cliente em 80 caracteres, sem espaços nas pontas", () => {
    expect(choicesFromSearch(`cliente=  ${"a".repeat(100)}  `, options, defaults).cliente).toBe("a".repeat(80));
  });
});

describe("themeFileName", () => {
  it("kebab-case sem acentos", () => expect(themeFileName("Flamengo Sócio")).toBe("flamengo-socio.css"));
  it("sem nome", () => expect(themeFileName("")).toBe("tema-mosaico.css"));
  it("só símbolos", () => expect(themeFileName("*/!!")).toBe("tema-mosaico.css"));
});

describe("themeFile", () => {
  const editUrl = "http://localhost:3001/create?cliente=Flamengo&cor=red";
  it("monta cabeçalho e corpo", () => {
    expect(themeFile({ cliente: "Flamengo", editUrl, css: ":root {\n  --radius: 0.5rem;\n}", date: "2026-11-13" })).toBe(
      [
        "/*",
        " * Tema Mosaico: Flamengo",
        ` * Editar: ${editUrl}`,
        " * Gerado em 2026-11-13",
        " *",
        " * Carregue este arquivo depois do globals.css do projeto.",
        " */",
        ":root {\n  --radius: 0.5rem;\n}",
        "",
      ].join("\n"),
    );
  });
  it("sem nome, o título é só 'Tema Mosaico'", () => {
    expect(themeFile({ cliente: "", editUrl, css: "", date: "2026-11-13" })).toContain(" * Tema Mosaico\n");
  });
  it("nome com */ ou quebra de linha não fecha o comentário", () => {
    const file = themeFile({ cliente: "A */ b\nc", editUrl, css: "", date: "2026-11-13" });
    expect(file.indexOf("*/")).toBe(file.lastIndexOf("*/"));
    expect(file).toContain(" * Tema Mosaico: A b c\n");
  });
});

describe("editUrlFromFile", () => {
  it("lê o link do arquivo gerado", () => {
    const file = themeFile({ cliente: "X", editUrl: "https://a.b/create?cor=red", css: "", date: "2026-11-13" });
    expect(editUrlFromFile(file)).toBe("https://a.b/create?cor=red");
  });
  it("arquivo sem cabeçalho do Mosaico", () => expect(editUrlFromFile(":root { --primary: red; }")).toBeNull());
  it("aceita CRLF", () => expect(editUrlFromFile("/*\r\n * Editar: https://a.b/create?cor=red\r\n */")).toBe("https://a.b/create?cor=red"));
});

it("link de outra origem: só os parâmetros contam", () => {
  const url = new URL("http://localhost:3001/create?cor=red&raio=0.5");
  expect(choicesFromSearch(url.search, options, defaults)).toEqual({ ...defaults, cor: "red", raio: "0.5" });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `pnpm --filter docs test`
Expected: FAIL, `create-theme-file` não existe.

- [ ] **Step 4: Implementar `apps/docs/lib/create-theme-file.ts`**

`URLSearchParams` para ler e escrever (o `+` para espaço vem dele). `themeFileName`: `normalize("NFD")`, remover marcas diacríticas, minúsculas, trocar tudo que não é `[a-z0-9]` por `-`, colapsar e aparar hífens. No cabeçalho, o nome passa por: remover `*/`, trocar quebras de linha por espaço, colapsar espaços. O arquivo termina com `\n`. Quando `css` é vazio, a linha do corpo fica vazia.

- [ ] **Step 5: Rodar e ver passar**

Run: `pnpm --filter docs test`
Expected: PASS em todos.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/lib/create-theme-file.ts apps/docs/lib/create-theme-file.test.ts apps/docs/package.json pnpm-lock.yaml
git commit -m "feat(docs): funções do arquivo de tema do /create, com testes"
```

---

### Task 2: Escolhas na URL e campo "Nome do cliente"

**Files:**
- Modify: `apps/docs/components/create-customizer.tsx` (`CreateCustomizer`, linhas ~128–240)

**Interfaces:**
- Consumes: `ThemeChoices`, `ChoiceOptions`, `choicesToSearch`, `choicesFromSearch` (Task 1).
- Produces: dentro de `CreateCustomizer`, `const [choices, setChoices] = React.useState<ThemeChoices>(defaults)` e `const editUrl: string` (= `${window.location.origin}/create?${choicesToSearch(choices)}`, calculado no cliente). A Task 3 usa `choices`, `setChoices`, `editUrl` e o `css` que já existe.

- [ ] **Step 1: Trocar os cinco `useState` por `choices`**

`defaults = { cliente: "", cor: DEFAULT_COLOR, graficos: DEFAULT_COLOR, raio: DEFAULT_RADIUS, fonte: defaultFont.name, titulos: SAME_FONT }`. `options` vem de `COLORS`, `CHART_COLORS`, `RADII` e `fonts` (nomes). Cada `Picker`/`ColorRow` passa a chamar `setChoices((c) => ({ ...c, <campo>: valor }))`. O resto do componente lê de `choices`.

- [ ] **Step 2: Ler a URL ao montar e escrever a cada mudança**

Um efeito de montagem lê `window.location.search` com `choicesFromSearch` e marca `ready = true`. Um segundo efeito, só quando `ready`, chama `window.history.replaceState(null, "", "?" + choicesToSearch(choices))`. O Next sincroniza `replaceState` com o roteador (`node_modules/next/dist/docs/01-app/02-guides/single-page-applications.md`, "Native History API"). Não usar `useSearchParams`, que exige `Suspense` na página estática.

- [ ] **Step 3: Campo "Nome do cliente"**

`Field` + `Label` + `Input` do `@multiclubes/ui`, primeiro item do painel, acima de "Cor". Placeholder `Ex.: Flamengo`, `maxLength={80}`.

- [ ] **Step 4: Verificar no navegador**

Run: `pnpm --filter docs dev`, abrir `http://localhost:3001/create?cliente=Flamengo&cor=red&raio=0.5&fonte=DM+Sans`.
Expected: a página abre com nome "Flamengo", cor red, raio 0.5 e fonte DM Sans; a URL não volta para o padrão. Trocar a cor atualiza a URL; o botão Voltar do navegador sai da página em vez de desfazer a cor. Abrir `/create` sem parâmetros mostra o tema padrão.

- [ ] **Step 5: Lint e tipos**

Run (raiz): `pnpm lint && pnpm check-types`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/components/create-customizer.tsx
git commit -m "feat(docs): escolhas do /create na URL e nome do cliente"
```

---

### Task 3: Baixar e abrir o arquivo de tema, e documentação

**Files:**
- Modify: `apps/docs/components/create-customizer.tsx` (`ThemeDialog` e a raiz `data-slot="create"`)
- Modify: `apps/docs/content/docs/installation.mdx` (seção `## Tema e temas de cliente`, linhas 59–75)

**Interfaces:**
- Consumes: `choices`, `setChoices`, `editUrl`, `css` (Task 2); `themeFile`, `themeFileName`, `editUrlFromFile`, `choicesFromSearch` (Task 1).

- [ ] **Step 1: Botão "Baixar tema" no diálogo**

`ThemeDialog` recebe `cliente`, `editUrl` e `css`. O botão monta `themeFile({ cliente, editUrl, css, date })` (`date` no formato `AAAA-MM-DD`, data local) e baixa com `Blob` (`text/css`) + `<a download={themeFileName(cliente)}>`. A descrição do diálogo passa a ser: "Salve o arquivo no projeto do cliente e carregue-o depois do globals.css. O link no começo do arquivo reabre este tema aqui." O trecho de CSS mostrado vira o arquivo inteiro, com título `themeFileName(cliente)`. O trecho do `layout.tsx` continua como hoje.

- [ ] **Step 2: "Abrir tema" e soltar arquivo**

Botão **Abrir tema** (`variant="outline"`) ao lado de **Usar este tema**, com `<input type="file" accept=".css,text/css" hidden>`. A raiz `data-slot="create"` aceita `dragover`/`drop` de um arquivo. Os dois caminhos chamam a mesma função: ler o texto, `editUrlFromFile`, e então `setChoices(choicesFromSearch(new URL(url).search, options, defaults))`. Se `editUrlFromFile` devolver `null` ou a URL for inválida, mostrar abaixo dos botões, com `role="alert"`, o texto exato `Este arquivo não foi gerado pelo Mosaico. Abra um tema baixado do /create.`. A mensagem some na próxima abertura bem-sucedida.

- [ ] **Step 3: Verificar no navegador**

Run: `pnpm --filter docs dev`.
Expected:
- Nome "Flamengo Sócio", cor red e raio 0.5 → **Baixar tema** baixa `flamengo-socio.css` com o cabeçalho e o link de edição.
- Voltar ao `/create` sem parâmetros, soltar esse arquivo → as escolhas voltam (nome, cor, raio).
- Soltar um `.css` qualquer → a mensagem aparece e as escolhas não mudam.
- Com tema padrão, o arquivo tem o cabeçalho e `/* Tema padrão: não há nada para sobrescrever. */`.

- [ ] **Step 4: Documentação**

Na seção `## Tema e temas de cliente` de `installation.mdx`, depois do exemplo de CSS, um parágrafo: gere o arquivo no [/create](/create) com o nome do cliente e **Baixar tema**; salve no projeto (no Portal, em `src/themes/<cliente>/`); carregue depois do `globals.css`; para ajustar, abra o link `Editar:` do cabeçalho ou arraste o arquivo para o `/create`.

- [ ] **Step 5: Checagem completa**

Run (raiz): `pnpm lint && pnpm check-types && pnpm test && pnpm build`
Expected: tudo passa.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/components/create-customizer.tsx apps/docs/content/docs/installation.mdx
git commit -m "feat(docs): baixar e reabrir o tema de cliente no /create"
```
