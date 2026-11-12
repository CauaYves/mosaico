// Gera packages/ui/registry.json (registry shadcn do Mosaico) a partir do código de src/.
//   node scripts/registry/build.ts          escreve o arquivo
//   node scripts/registry/build.ts --check  falha se o arquivo estiver desatualizado (usado na CI)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTRY_REPO } from "./config.ts";
import { buildThemeItem, cssToRegistry, splitByItem } from "./css.ts";
import { buildItem, type Meta, type SourceFile } from "./items.ts";

const DIRS = ["components", "hooks", "lib"] as const;

/** title/description do frontmatter da página do componente no docs. */
function readMeta(docsContentRoot: string, name: string): Meta {
  for (const section of ["components", "components-multiclubes"]) {
    const path = join(docsContentRoot, section, `${name}.mdx`);
    if (!existsSync(path)) continue;
    const frontmatter = readFileSync(path, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
    const field = (key: string) => {
      const value = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
      return value?.replace(/^(["'])(.*)\1$/, "$2");
    };
    return { title: field("title"), description: field("description") };
  }
  return {};
}

/** Falha se um marcador /* @registry <item> *\/ do globals.css não tiver item: o CSS sumiria. */
export function assertCssPartsHaveItems(parts: Record<string, string>, names: Set<string>) {
  const orphans = Object.keys(parts).filter((key) => key !== "theme" && !names.has(key));
  if (orphans.length) {
    throw new Error(
      `globals.css: marcador @registry sem item correspondente: ${orphans.join(", ")}`,
    );
  }
}

/** Skills instaladas pela base, em packages/ui/skills: as regras do kit e o ciclo de protótipo. */
const SKILLS: Record<string, string[]> = {
  "mosaico-ui": ["SKILL.md", "references/principios.md"],
  "mosaico-prototipo": [
    "SKILL.md",
    "references/conferencia.md",
    "references/revisao.md",
    "references/armadilhas.md",
  ],
};

/**
 * Base para `npx shadcn init CauaYves/mosaico/base`. Com `extends: none`, o init não traz os padrões
 * do shadcn oficial (lucide-react e components/ui/button): configura Phosphor, aplica o tema e
 * instala as skills do kit em .claude/skills: mosaico-ui, para o Claude seguir as regras do kit no
 * projeto, e mosaico-prototipo, com o ciclo para construir e lapidar uma tela.
 * As skills ficam dentro de packages/ui porque o CLI recusa caminhos com "../" no registry.
 */
export function buildBaseItem(
  uiRoot: string,
  versions: Record<string, string>,
  dep: (name: string) => string,
) {
  const phosphor = versions["@phosphor-icons/react"];
  if (!phosphor)
    throw new Error('base: o pacote "@phosphor-icons/react" não está no package.json do ui');
  return {
    name: "base",
    type: "registry:base",
    extends: "none",
    title: "Base do Mosaico",
    description:
      "Configura um projeto para o Mosaico: ícones Phosphor, tema Multiclubes, utilitários e as skills do kit para o Claude (.claude/skills/mosaico-ui e mosaico-prototipo).",
    config: {
      style: "base-luma",
      iconLibrary: "phosphor",
      tailwind: { baseColor: "neutral" },
    },
    dependencies: [`@phosphor-icons/react@${phosphor}`],
    registryDependencies: [dep("theme"), dep("utils")],
    files: Object.entries(SKILLS).flatMap(([skill, files]) =>
      files.map((file) => ({
        path: `skills/${skill}/${file}`,
        type: "registry:file",
        target: `~/.claude/skills/${skill}/${file}`,
        content: readFileSync(join(uiRoot, "skills", skill, file), "utf8").replace(/\r\n/g, "\n"),
      })),
    ),
  };
}

/**
 * `ref` só existe para testar uma branch antes do merge (REGISTRY_REF, ver smoke.ts): fixa as
 * dependências internas nela. O registry publicado é gerado sem ref.
 */
export function buildRegistry(uiRoot: string, docsContentRoot: string, ref?: string): string {
  const pkg = JSON.parse(readFileSync(join(uiRoot, "package.json"), "utf8"));
  const versions: Record<string, string> = { ...pkg.devDependencies, ...pkg.dependencies };
  const cssParts = splitByItem(readFileSync(join(uiRoot, "src/styles/globals.css"), "utf8"));

  const items = [];
  for (const dir of DIRS) {
    for (const file of readdirSync(join(uiRoot, "src", dir)).sort()) {
      if (!/\.tsx?$/.test(file) || file.includes(".test.")) continue;
      const src: SourceFile = {
        dir,
        file,
        code: readFileSync(join(uiRoot, "src", dir, file), "utf8"),
      };
      const item = buildItem(
        src,
        versions,
        dir === "components" ? readMeta(docsContentRoot, file.replace(/\.tsx?$/, "")) : {},
      );
      const css = cssParts[item.name];
      if (css) item.css = cssToRegistry(css);
      if (ref) item.registryDependencies = item.registryDependencies.map((dep) => `${dep}#${ref}`);
      items.push(item);
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  assertCssPartsHaveItems(cssParts, new Set(items.map((item) => item.name)));

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "mosaico-ui",
    homepage: "https://github.com/CauaYves/mosaico",
    items: [
      buildThemeItem(cssToRegistry(cssParts.theme ?? ""), versions),
      buildBaseItem(uiRoot, versions, (name) =>
        ref ? `${REGISTRY_REPO}/${name}#${ref}` : `${REGISTRY_REPO}/${name}`,
      ),
      ...items,
    ],
  };
  return `${JSON.stringify(registry, null, 2)}\n`;
}

if (import.meta.main) {
  const uiRoot = join(import.meta.dirname, "../..");
  const target = join(uiRoot, "registry.json");
  const expected = buildRegistry(
    uiRoot,
    join(uiRoot, "../../apps/docs/content/docs"),
    process.env.REGISTRY_REF,
  );
  if (process.argv.includes("--check")) {
    const current = existsSync(target) ? readFileSync(target, "utf8").replace(/\r\n/g, "\n") : "";
    if (current !== expected) {
      console.error(
        'O registry está desatualizado. Rode "pnpm --filter @multiclubes/ui registry".',
      );
      process.exit(1);
    }
    console.log("Registry em dia.");
  } else {
    writeFileSync(target, expected);
    console.log(`Escrito: ${target}`);
  }
}
