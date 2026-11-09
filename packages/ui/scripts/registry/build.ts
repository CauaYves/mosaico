// Gera packages/ui/registry.json (registry shadcn do Mosaico) a partir do código de src/.
//   node scripts/registry/build.ts          escreve o arquivo
//   node scripts/registry/build.ts --check  falha se o arquivo estiver desatualizado (usado na CI)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
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

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "mosaico-ui",
    homepage: "https://github.com/CauaYves/mosaico",
    items: [buildThemeItem(cssToRegistry(cssParts.theme ?? ""), versions), ...items],
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
