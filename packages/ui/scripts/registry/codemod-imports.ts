// Troca os imports entre arquivos do kit pelo formato do registry shadcn (ver config.ts).
//   node scripts/registry/codemod-imports.ts   aplica em src/ (uso único, não roda na CI)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { IMPORT_PREFIX } from "./config.ts";

type Dir = keyof typeof IMPORT_PREFIX;

export function rewriteInternalImports(code: string, fileDir: Dir): string {
  return code
    .replace(
      /(["'])@multiclubes\/ui\/(components|hooks|lib)\/([\w-]+)\1/g,
      (_, quote, dir: Dir, name) => `${quote}${IMPORT_PREFIX[dir]}/${name}${quote}`,
    )
    .replace(
      /(from\s+)(["'])\.\/([\w-]+)\2/g,
      (_, from, quote, name) => `${from}${quote}${IMPORT_PREFIX[fileDir]}/${name}${quote}`,
    );
}

if (import.meta.main) {
  const src = join(import.meta.dirname, "../../src");
  for (const dir of ["components", "hooks", "lib"] as const) {
    for (const file of readdirSync(join(src, dir))) {
      if (!/\.tsx?$/.test(file) || file.includes(".test.")) continue;
      const path = join(src, dir, file);
      const code = readFileSync(path, "utf8");
      const next = rewriteInternalImports(code, dir);
      if (next !== code) {
        writeFileSync(path, next);
        console.log(`Alterado: ${dir}/${file}`);
      }
    }
  }
}
