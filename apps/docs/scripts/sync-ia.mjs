// Gera references/principios.md das skills a partir de content/docs/para-ia.mdx:
// skills/mosaico-design (materiais fora do código) e packages/ui/skills/mosaico-ui (projetos com o kit,
// instalada pelo item "base" do registry).
//   node scripts/sync-ia.mjs          escreve os arquivos
//   node scripts/sync-ia.mjs --check  falha se algum estiver desatualizado (usado na CI)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { skillReference } from "../lib/ia.ts";

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["mosaico-design", "mosaico-ui"].map((skill) =>
  join(
    docsRoot,
    "..",
    "..",
    ...(skill === "mosaico-ui" ? ["packages", "ui"] : []),
    "skills",
    skill,
    "references",
    "principios.md",
  ),
);
const expected = skillReference(docsRoot);

if (process.argv.includes("--check")) {
  const stale = targets.filter((target) => {
    let current = "";
    try {
      current = readFileSync(target, "utf8");
    } catch {}
    return current.replace(/\r\n/g, "\n") !== expected;
  });
  if (stale.length) {
    console.error(
      `Referência de skill desatualizada: ${stale.join(", ")}. Rode "pnpm --filter docs sync:ia".`,
    );
    process.exit(1);
  }
  console.log("Referências das skills em dia.");
} else {
  for (const target of targets) {
    writeFileSync(target, expected);
    console.log(`Escrito: ${target}`);
  }
}
