// Instala itens do registry do Mosaico num projeto Next novo, com o shadcn oficial já instalado, e
// confere o resultado.
//   node scripts/registry/smoke.ts [item...]            instala da main
//   node scripts/registry/smoke.ts --ref <branch> [...]  instala de uma branch gerada com
//                                                        REGISTRY_REF=<branch> (teste antes do merge)
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REGISTRY_REPO } from "./config.ts";

const args = process.argv.slice(2);
const refIndex = args.indexOf("--ref");
const ref = refIndex >= 0 ? args.splice(refIndex, 2)[1] : undefined;
const items = args.length
  ? args
  : ["dialog", "sidebar", "date-field", "theme-toggle", "brand-loader"];

const failures: string[] = [];
const fail = (check: string, detail: string) => failures.push(`${check}: ${detail}`);

function run(command: string, cwd: string) {
  console.log(`$ ${command}`);
  execSync(command, { cwd, stdio: "inherit", env: { ...process.env, CI: "1" } });
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function hashes(dir: string): Map<string, string> {
  return new Map(
    walk(dir).map((file) => [file, createHash("sha1").update(readFileSync(file)).digest("hex")]),
  );
}

const root = mkdtempSync(join(tmpdir(), "mosaico-smoke-"));
const app = join(root, "app");
run(
  "npx --yes create-next-app@latest app --ts --tailwind --app --eslint=false --use-npm --yes",
  root,
);
run("npx --yes shadcn@latest init --defaults --yes", app);

const uiDir = join(app, "components", "ui");
const before = hashes(uiDir);

for (const item of items) {
  const address = `${REGISTRY_REPO}/${item}${ref ? `#${ref}` : ""}`;
  for (let i = 0; i < 2; i++) run(`npx --yes shadcn@latest add ${address} --yes`, app);
}

// 1. components/ui intacto
const after = hashes(uiDir);
for (const [file, hash] of before) {
  if (after.get(file) !== hash) fail("components/ui mudou", file);
}
for (const file of after.keys()) if (!before.has(file)) fail("components/ui ganhou arquivo", file);

// 2. imports reescritos
for (const dir of ["components/mosaico", "hooks/mosaico", "lib/mosaico"]) {
  for (const file of walk(join(app, dir))) {
    const code = readFileSync(file, "utf8");
    if (code.includes("@multiclubes/ui") || code.includes("@/registry/")) {
      fail("import não reescrito", file);
    }
  }
}

// 3. cores Multiclubes
const css = readFileSync(join(app, "app", "globals.css"), "utf8");
const block = (selector: string) =>
  css.match(new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`, "m"))?.[1] ?? "";
if (!block(":root").includes("--primary: oklch(0.44 0.213 263)")) fail("--primary", ":root");
if (!block(".dark").includes("--primary: oklch(0.62 0.2 263)")) fail("--primary", ".dark");

// 4. nada duplicado ao rodar add duas vezes
const count = (pattern: RegExp) => css.match(pattern)?.length ?? 0;
if (count(/@keyframes brand-loader-draw\s*\{/g) > 1)
  fail("duplicado", "@keyframes brand-loader-draw");
if (count(/^:root\s*\{/gm) > 1) fail("duplicado", ":root");
if (count(/^\.dark\s*\{/gm) > 1) fail("duplicado", ".dark");

// 5. o projeto compila
try {
  run("npx tsc --noEmit", app);
  run("npx next build", app);
} catch {
  fail("compilação", app);
}

if (failures.length) {
  console.error(`\nFalhou:\n${failures.map((line) => `- ${line}`).join("\n")}\nProjeto: ${app}`);
  process.exit(1);
}
console.log(`\n5 checagens ok (${items.join(", ")})`);
