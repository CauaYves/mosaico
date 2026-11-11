// Sincroniza a documentação dos componentes a partir do repositório do shadcn/ui (MIT).
//
// Para cada componente do @multiclubes/ui (e as páginas compostas listadas em EXTRA_PAGES):
// - copia o MDX de apps/v4/content/docs/components/base para content/docs/components;
// - troca a seção "Installation" pela instalação do kit e remove seções sem equivalente aqui
//   (RTL, Changelog);
// - copia os demos usados pelos <ComponentPreview> para examples/, reescrevendo os imports
//   para @multiclubes/ui. Demos que dependem de código interno do site do shadcn são
//   descartados, junto com o <ComponentPreview> que os usava;
// - insere antes de "Installation" a nota mantida à mão em content/mosaico-notas/<nome>.mdx,
//   quando existe (o que o Mosaico muda em relação ao shadcn);
// - gera examples/__index__.ts com o carregamento de cada demo.
//
// Uso: pnpm --filter docs sync:shadcn

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = "https://github.com/shadcn-ui/ui.git";
const EXTRA_PAGES = ["data-table", "date-picker", "typography"];
const DROPPED_SECTIONS = new Set(["RTL", "Changelog"]);

// Demos que não funcionam com as versões usadas aqui.
const SKIPPED_DEMOS = {
  "calendar-hijri": "usa react-day-picker/persian, que não existe no react-day-picker 10",
};

// Correções em demos do upstream que geram erro no console. Se o trecho não for
// encontrado (o upstream mudou), o sync avisa para revisar o patch.
const DEMO_PATCHES = {
  "input-group-button": [
    // O trigger é renderizado como <div> (InputGroupAddon), então o Base UI precisa
    // saber que não é um <button> nativo.
    [
      "<PopoverTrigger render={<InputGroupAddon />}>",
      "<PopoverTrigger render={<InputGroupAddon />} nativeButton={false}>",
    ],
  ],
};

// Pacotes que os demos podem importar (precisam estar nas dependências do app docs).
const ALLOWED_PACKAGES = new Set([
  "react",
  "react-dom",
  "next",
  "lucide-react",
  "@tabler/icons-react",
  "@phosphor-icons/react",
  "@base-ui/react",
  "@shadcn/react",
  "@multiclubes/ui",
  "@tanstack/react-table",
  "chrono-node",
  "cn",
  "date-fns",
  "embla-carousel-autoplay",
  "input-otp",
  "react-day-picker",
  "react-textarea-autosize",
  "recharts",
  "sonner",
  "zod",
]);

// Arquivos do site do shadcn que os demos usam e que copiamos para o app docs.
const LOCAL_FILES = {
  "@/hooks/use-copy-to-clipboard": "hooks/use-copy-to-clipboard.ts",
  "@/hooks/use-media-query": "hooks/use-media-query.tsx",
};

const docsDir = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = join(docsDir, "..", "..");
const uiDir = join(repoRoot, "packages", "ui", "src");
const cacheDir = join(docsDir, ".shadcn-upstream");
const upstream = join(cacheDir, "apps", "v4");

const contentDir = join(docsDir, "content", "docs", "components");
const sourcesDir = join(docsDir, "content", "sources");
const examplesDir = join(docsDir, "examples");

const git = (args, cwd) => execFileSync("git", args, { cwd, stdio: "pipe" }).toString().trim();

function cloneUpstream() {
  rmSync(cacheDir, { recursive: true, force: true });
  git(["clone", "--depth", "1", "--filter=blob:none", "--sparse", UPSTREAM, cacheDir]);
  git(
    [
      "sparse-checkout",
      "set",
      "--skip-checks",
      "apps/v4/content/docs/components/base",
      "apps/v4/examples/base",
      "apps/v4/hooks",
      "apps/v4/app/(app)/examples/tasks/components",
    ],
    cacheDir,
  );
  return git(["log", "-1", "--format=%h %cs"], cacheDir);
}

const kitComponents = readdirSync(join(uiDir, "components"))
  .filter((file) => file.endsWith(".tsx") && !file.includes(".test."))
  .map((file) => file.replace(/\.tsx$/, ""));
const kitFiles = {
  components: new Set(kitComponents),
  hooks: new Set(readdirSync(join(uiDir, "hooks")).map((f) => f.replace(/\.tsx?$/, ""))),
  lib: new Set(readdirSync(join(uiDir, "lib")).map((f) => f.replace(/\.tsx?$/, ""))),
};

// --- Imports -------------------------------------------------------------------------------

const IMPORT_REWRITES = [
  [/^@\/styles\/base-[a-z]+\/ui\/(.+)$/, "components"],
  [/^@\/registry\/bases\/base\/ui\/(.+)$/, "components"],
  [/^@\/registry\/new-york-v4\/ui\/(.+)$/, "components"],
  [/^@\/registry\/bases\/base\/hooks\/(.+)$/, "hooks"],
  [/^@\/registry\/bases\/base\/lib\/(.+)$/, "lib"],
  [/^@\/hooks\/(use-mobile)$/, "hooks"],
  [/^@\/lib\/(utils)$/, "lib"],
  [/^@\/components\/ui\/(.+)$/, "components"],
];

function packageRoot(specifier) {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** Reescreve um import. Retorna { specifier } ou { error }. */
function rewriteSpecifier(specifier) {
  for (const [pattern, kind] of IMPORT_REWRITES) {
    const match = specifier.match(pattern);
    if (!match) continue;
    const name = match[1];
    if (!kitFiles[kind].has(name)) return { error: `${specifier} (sem equivalente no kit)` };
    return { specifier: `@multiclubes/ui/${kind}/${name}` };
  }
  if (specifier.startsWith("@/examples/base/")) {
    return {
      specifier: `./${specifier.slice("@/examples/base/".length)}`,
      demo: basename(specifier),
    };
  }
  if (specifier in LOCAL_FILES) return { specifier, local: specifier };
  if (specifier.startsWith("@/") || specifier.startsWith(".")) {
    return { error: `${specifier} (interno do site do shadcn)` };
  }
  if (!ALLOWED_PACKAGES.has(packageRoot(specifier))) {
    return { error: `${specifier} (pacote não permitido)` };
  }
  return { specifier };
}

const SPECIFIER_PATTERN = /(\bfrom\s+|\bimport\s*\(?\s*)(["'])([^"']+)\2/g;

/** Reescreve os imports de um arquivo. Retorna { code, errors, demos, packages, locals }. */
function rewriteImports(code) {
  const errors = [];
  const demos = new Set();
  const packages = new Set();
  const locals = new Set();
  const rewritten = code.replace(SPECIFIER_PATTERN, (full, prefix, quote, specifier) => {
    const result = rewriteSpecifier(specifier);
    if (result.error) {
      errors.push(result.error);
      return full;
    }
    if (result.demo) demos.add(result.demo);
    if (result.local) locals.add(result.local);
    if (!result.specifier.startsWith(".") && !result.specifier.startsWith("@/")) {
      packages.add(packageRoot(result.specifier));
    }
    return `${prefix}${quote}${result.specifier}${quote}`;
  });
  return { code: rewritten, errors, demos, packages, locals };
}

// --- Demos ---------------------------------------------------------------------------------

const demoCache = new Map();

/** Carrega um demo do upstream e resolve suas dependências. Retorna null se não for portável. */
function loadDemo(name, trail = []) {
  if (demoCache.has(name)) return demoCache.get(name);
  if (name in SKIPPED_DEMOS) {
    demoCache.set(name, { name, errors: [SKIPPED_DEMOS[name]] });
    return demoCache.get(name);
  }
  const file = join(upstream, "examples", "base", `${name}.tsx`);
  if (!existsSync(file)) {
    demoCache.set(name, { name, errors: ["arquivo não encontrado no upstream"] });
    return demoCache.get(name);
  }
  const result = rewriteImports(readFileSync(file, "utf8"));
  const demo = { name, ...result };
  demoCache.set(name, demo);
  for (const dependency of result.demos) {
    if (trail.includes(dependency)) continue;
    const loaded = loadDemo(dependency, [...trail, name]);
    if (loaded.errors.length) demo.errors.push(`depende de ${dependency}, que não é portável`);
  }
  return demo;
}

// Dados de exemplo (avatares, nomes, e-mails) trocados pela identidade da Multiclubes.
const IDENTITY_REWRITES = [
  ["https://github.com/shadcn.png", "/avatars/multiclubes.svg"],
  ["/avatars/shadcn.jpg", "/avatars/multiclubes.svg"],
  ["https://avatar.vercel.sh/shadcn1", "https://avatar.vercel.sh/multiclubes1"],
  ["shadcn@example.com", "multiclubes@example.com"],
  ["shadcn@vercel.com", "multiclubes@example.com"],
  ["https://x.com/shadcn", "https://example.com/multiclubes"],
  ["https://ui.shadcn.com/docs/installation", "https://example.com/docs/installation"],
  [
    '<div className="leading-none font-medium">shadcn/ui</div>',
    '<div className="leading-none font-medium">Multiclubes UI</div>',
  ],
  ['username: "shadcn"', 'username: "multiclubes"'],
  ['name: "shadcn"', 'name: "Multiclubes"'],
  ['alt="@shadcn"', 'alt="@multiclubes"'],
  ['alt="shadcn"', 'alt="multiclubes"'],
  ['"@shadcn"', '"@multiclubes"'],
  ["Ping @shadcn", "Ping @multiclubes"],
  ['alt: "@shadcn"', 'alt: "@multiclubes"'],
];

function applyIdentity(text) {
  return IDENTITY_REWRITES.reduce((result, [from, to]) => result.replaceAll(from, to), text);
}

function writeDemo(demo, written) {
  if (written.has(demo.name)) return;
  written.add(demo.name);
  let code = applyIdentity(demo.code);
  // Os demos são renderizados a partir de Server Components, então todos precisam ser
  // client components. A marca permite esconder a linha ao exibir o código.
  if (!/^\s*["']use client["']/.test(code)) code = `"use client" // sync-shadcn\n\n${code}`;
  for (const [from, to] of DEMO_PATCHES[demo.name] ?? []) {
    if (code.includes(from)) code = code.replace(from, to);
    else console.warn(`  Patch de ${demo.name} não se aplica mais; revise DEMO_PATCHES.`);
  }
  writeFileSync(join(examplesDir, `${demo.name}.tsx`), code);
  for (const dependency of demo.demos) writeDemo(demoCache.get(dependency), written);
}

// --- MDX -----------------------------------------------------------------------------------

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { frontmatter: "", body: source };
  return { frontmatter: match[0], body: source.slice(match[0].length) };
}

/** Divide o corpo em seções de nível 2, ignorando "##" dentro de blocos de código. */
function splitSections(body) {
  const sections = [{ title: null, lines: [] }];
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const heading = !inFence && line.match(/^## (.+)$/);
    if (heading) sections.push({ title: heading[1].trim(), lines: [] });
    sections.at(-1).lines.push(line);
  }
  return sections;
}

const PREVIEW_PATTERN = /<ComponentPreview\b[\s\S]*?\/>/g;
const SOURCE_PATTERN = /<ComponentSource\b[\s\S]*?\/>/g;
const attribute = (element, name) => element.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

/** Nota do Mosaico para a página (content/mosaico-notas/<nome>.mdx), se houver. */
function mosaicoNote(name) {
  const file = join(
    fileURLToPath(new URL("../content/mosaico-notas/", import.meta.url)),
    `${name}.mdx`,
  );
  return existsSync(file)
    ? `${readFileSync(file, "utf8").trim()}
`
    : "";
}

function installationSection(name, original) {
  if (kitFiles.components.has(name)) {
    return `## Installation\n\n<Installation name="${name}" />\n`;
  }
  // Páginas compostas (data-table, date-picker…) mantêm o texto original.
  return original;
}

/** Reescreve <ComponentSource>. Arquivos do kit são lidos direto de packages/ui. */
function rewriteComponentSource(element, page) {
  const src = attribute(element, "src");
  const title = attribute(element, "title");
  if (!src) return "";
  const kitMatch = src.match(/^\/registry\/bases\/base\/(hooks|lib|ui)\/([^/.]+)\.tsx?$/);
  if (kitMatch) {
    const kind = kitMatch[1] === "ui" ? "components" : kitMatch[1];
    if (!kitFiles[kind].has(kitMatch[2])) return "";
    return `<ComponentSource kit="${kind}/${kitMatch[2]}"${title ? ` title="${title}"` : ""} />`;
  }
  const file = join(upstream, src);
  if (!existsSync(file)) return "";
  // Só é exibido como código, então imports sem equivalente no kit não impedem a cópia.
  const { code } = rewriteImports(readFileSync(file, "utf8"));
  const target = `${page}--${basename(src)}`;
  writeFileSync(join(sourcesDir, target), code);
  return `<ComponentSource src="${target}"${title ? ` title="${title}"` : ""} />`;
}

function rewriteLinks(text) {
  return text.replace(/\]\(\/docs\/([^)\s]*)\)/g, (_, path) => {
    const match = path.match(/^components\/(?:base\/|radix\/)?([^#/]+)(#.*)?$/);
    if (match && pages.has(match[1])) return `](/docs/components/${match[1]}${match[2] ?? ""})`;
    return `](https://ui.shadcn.com/docs/${path})`;
  });
}

function rewriteCode(text) {
  return applyIdentity(text)
    .replaceAll("@/components/ui/", "@multiclubes/ui/components/")
    .replaceAll('"@/lib/utils"', '"@multiclubes/ui/lib/utils"')
    .replaceAll('"@/hooks/use-mobile"', '"@multiclubes/ui/hooks/use-mobile"')
    .replace(/npx shadcn@latest add [a-z0-9 -]+/g, "pnpm add @multiclubes/ui");
}

function convertPage(name, report) {
  const file = join(upstream, "content", "docs", "components", "base", `${name}.mdx`);
  if (!existsSync(file)) {
    report.missingPages.push(name);
    return;
  }
  const { frontmatter, body: rawBody } = splitFrontmatter(readFileSync(file, "utf8"));
  // Imports no MDX (ícones usados em <Callout icon>) não funcionam aqui: os ícones vêm
  // do mapa de componentes em components/mdx-components.tsx.
  const body = rawBody.replace(/^import \{[^}]+\} from "[^"]+"\r?\n/gm, "");
  const output = [];

  for (const section of splitSections(body)) {
    if (section.title && DROPPED_SECTIONS.has(section.title)) continue;
    let text = section.lines.join("\n");
    if (section.title === "Installation") {
      const note = mosaicoNote(name);
      if (note) output.push(note);
      output.push(installationSection(name, text));
      continue;
    }

    text = text.replace(PREVIEW_PATTERN, (element) => {
      const demoName = attribute(element, "name");
      const demo = demoName && loadDemo(demoName);
      if (!demo || demo.errors.length) {
        report.skippedDemos.set(demoName, demo?.errors ?? ["sem nome"]);
        return "";
      }
      report.demos.add(demoName);
      return element.replace(/\s+(styleName|direction)="[^"]*"/g, "");
    });
    text = text.replace(SOURCE_PATTERN, (element) => rewriteComponentSource(element, name));
    output.push(rewriteCode(rewriteLinks(text)));
  }

  const content = `${frontmatter}${output.join("\n").replace(/\n{3,}/g, "\n\n")}`;
  writeFileSync(join(contentDir, `${name}.mdx`), content);
  report.pages.push(name);
}

// --- Execução ------------------------------------------------------------------------------

const pages = new Set([...kitComponents, ...EXTRA_PAGES]);

console.log("Baixando o shadcn/ui…");
const revision = cloneUpstream();
console.log(`  revisão ${revision}`);

// Esvazia em vez de apagar o diretório: no Windows, apagar falha se algum processo
// (terminal, servidor de dev) estiver com ele aberto.
for (const dir of [contentDir, sourcesDir, examplesDir]) {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) rmSync(join(dir, entry), { recursive: true, force: true });
}

const report = { pages: [], missingPages: [], demos: new Set(), skippedDemos: new Map() };
for (const name of [...pages].sort()) convertPage(name, report);

const written = new Set();
const packages = new Set();
const locals = new Set();
for (const name of report.demos) {
  const demo = demoCache.get(name);
  writeDemo(demo, written);
}
for (const name of written) {
  const demo = demoCache.get(name);
  for (const p of demo.packages) packages.add(p);
  for (const l of demo.locals) locals.add(l);
}

for (const specifier of locals) {
  const target = LOCAL_FILES[specifier];
  mkdirSync(join(docsDir, target, ".."), { recursive: true });
  writeFileSync(join(docsDir, target), readFileSync(join(upstream, target), "utf8"));
}

// A maioria dos demos usa export nomeado; o componente é o primeiro export em PascalCase.
function demoEntry(name) {
  const code = demoCache.get(name).code;
  if (/^export default/m.test(code)) return `  "${name}": () => import("./${name}"),`;
  // Ancorado no início da linha para ignorar código de exemplo dentro de strings.
  const exported = code.match(/^export (?:function|const) ([A-Z]\w*)/m)?.[1];
  if (!exported) throw new Error(`Demo ${name} não exporta um componente`);
  return `  "${name}": () => import("./${name}").then((m) => ({ default: m.${exported} })),`;
}

const entries = [...written].sort().map(demoEntry).join("\n");
writeFileSync(
  join(examplesDir, "__index__.ts"),
  `// Gerado por scripts/sync-shadcn.mjs a partir do shadcn/ui ${revision}. Não edite.\n` +
    `import type * as React from "react"\n\n` +
    `export const Examples: Record<string, () => Promise<{ default: React.ComponentType }>> = {\n${entries}\n}\n`,
);

console.log(`\nPáginas: ${report.pages.length}`);
if (report.missingPages.length)
  console.log(`Sem página no upstream: ${report.missingPages.join(", ")}`);
console.log(`Demos: ${written.size} (${report.skippedDemos.size} descartados)`);
for (const [name, errors] of report.skippedDemos) console.log(`  - ${name}: ${errors.join("; ")}`);
console.log(`Pacotes usados pelos demos: ${[...packages].sort().join(", ")}`);
