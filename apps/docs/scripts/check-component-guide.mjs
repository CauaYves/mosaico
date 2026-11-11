// Confere o guia "qual componente usar" (lib/component-guide.ts) nos dois sentidos:
// - todo componente do kit (packages/ui/src/components) e toda página de componente tem entrada;
// - toda entrada corresponde a um componente ou página que existe;
// - toda entrada é item do registry (packages/ui/registry.json) ou diz como montar (`build`).
//   node scripts/check-component-guide.mjs --check  falha nomeando o que está errado (usado na CI)
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  missingGuideEntries,
  staleGuideEntries,
  uninstallableGuideEntries,
} from "../lib/component-guide.ts";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const uiRoot = join(docsRoot, "..", "..", "packages", "ui");
const componentsDir = join(uiRoot, "src", "components");
const pageDirs = ["components", "components-multiclubes"].map((dir) =>
  join(docsRoot, "content", "docs", dir),
);

const files = readdirSync(componentsDir)
  .filter((file) => file.endsWith(".tsx") && !file.includes(".test."))
  .map((file) => file.replace(/\.tsx$/, ""));
const pages = pageDirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, "")),
);

const registryItems = JSON.parse(readFileSync(join(uiRoot, "registry.json"), "utf8")).items.map(
  (item) => item.name,
);

const missingFiles = missingGuideEntries(files);
const missingPages = missingGuideEntries(pages).filter((slug) => !missingFiles.includes(slug));
const stale = staleGuideEntries([...files, ...pages]);
const uninstallable = uninstallableGuideEntries(registryItems);

const problems = [
  ...missingFiles.map(
    (slug) => `  - ${slug}: sem entrada (packages/ui/src/components/${slug}.tsx)`,
  ),
  ...missingPages.map((slug) => `  - ${slug}: sem entrada (página de componente no docs)`),
  ...stale.map((slug) => `  - ${slug}: entrada sem componente nem página; remova ou renomeie`),
  ...uninstallable.map(
    (slug) => `  - ${slug}: não é item do registry; diga como montar no campo build`,
  ),
];

if (problems.length) {
  console.error(
    `Guia de componentes (apps/docs/lib/component-guide.ts) desatualizado:\n${problems.join("\n")}\nCada entrada tem need e useWhen, escritos a partir do .tsx e da página .mdx.`,
  );
  process.exit(1);
}
console.log(`Guia de componentes em dia (${new Set([...files, ...pages]).size} componentes).`);
