import { rewriteInternalImports } from "./codemod-imports.ts";
import { IMPORT_PREFIX } from "./config.ts";

test("pacote do kit vira o prefixo do registry", () => {
  expect(
    rewriteInternalImports(
      'import { Button } from "@multiclubes/ui/components/button";',
      "components",
    ),
  ).toBe(`import { Button } from "${IMPORT_PREFIX.components}/button";`);
  expect(
    rewriteInternalImports(
      'import { useIsMobile } from "@multiclubes/ui/hooks/use-mobile";',
      "components",
    ),
  ).toBe(`import { useIsMobile } from "${IMPORT_PREFIX.hooks}/use-mobile";`);
  expect(
    rewriteInternalImports(
      'import { loadHighlighter } from "@multiclubes/ui/lib/highlighter";',
      "hooks",
    ),
  ).toBe(`import { loadHighlighter } from "${IMPORT_PREFIX.lib}/highlighter";`);
});

test("relativo da mesma pasta vira o prefixo da pasta", () => {
  expect(rewriteInternalImports('import { Seal } from "./seal";', "components")).toBe(
    `import { Seal } from "${IMPORT_PREFIX.components}/seal";`,
  );
});

test("imports de fora do kit não mudam", () => {
  const code = 'import { cn } from "cn";\nimport type * as React from "react";';
  expect(rewriteInternalImports(code, "components")).toBe(code);
});
