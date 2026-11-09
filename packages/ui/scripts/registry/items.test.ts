import { IMPORT_PREFIX, TARGET_DIR } from "./config.ts";
import { buildItem, type SourceFile } from "./items.ts";

const versions = {
  "@base-ui/react": "^1.4.0",
  "@phosphor-icons/react": "^2.1.10",
  cn: "^0.5.0",
  shiki: "^4.5.0",
};

const dialog: SourceFile = {
  dir: "components",
  file: "dialog.tsx",
  code: [
    '"use client";',
    'import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";',
    `import { Button } from "${IMPORT_PREFIX.components}/button";`,
    'import { XIcon } from "@phosphor-icons/react/dist/ssr";',
    'import { cn } from "cn";',
    'import type * as React from "react";',
  ].join("\n"),
};

test("dependências npm com faixa, sem react, subcaminho vira raiz", () => {
  expect(buildItem(dialog, versions, {}).dependencies).toEqual([
    "@base-ui/react@^1.4.0",
    "@phosphor-icons/react@^2.1.10",
    "cn@^0.5.0",
  ]);
});

test("dependências internas com endereço completo e o tema", () => {
  expect(buildItem(dialog, versions, {}).registryDependencies).toEqual([
    "CauaYves/mosaico/button",
    "CauaYves/mosaico/theme",
  ]);
});

test("import type de arquivo do kit também conta", () => {
  const src: SourceFile = {
    dir: "components",
    file: "x.tsx",
    code: `import type { ButtonProps } from "${IMPORT_PREFIX.components}/button";`,
  };
  expect(buildItem(src, versions, {}).registryDependencies).toContain("CauaYves/mosaico/button");
});

test("caminho relativo a packages/ui e target na pasta do Mosaico", () => {
  expect(buildItem(dialog, versions, {}).files).toEqual([
    {
      path: "src/components/dialog.tsx",
      type: "registry:ui",
      target: `${TARGET_DIR.components}/dialog.tsx`,
    },
  ]);
});

test("hook e lib ganham o tipo certo", () => {
  expect(buildItem({ dir: "hooks", file: "use-mobile.ts", code: "" }, versions, {}).type).toBe(
    "registry:hook",
  );
  expect(
    buildItem(
      {
        dir: "lib",
        file: "highlighter.tsx",
        code: 'import { createHighlighterCore } from "shiki/core";',
      },
      versions,
      {},
    ).dependencies,
  ).toEqual(["shiki@^4.5.0"]);
});

test("título e descrição: do meta, ou o nome em Title Case e descrição vazia", () => {
  expect(buildItem(dialog, versions, { title: "Dialog", description: "Janela." })).toMatchObject({
    title: "Dialog",
    description: "Janela.",
  });
  expect(
    buildItem({ dir: "components", file: "chart-donut.tsx", code: "" }, versions, {}),
  ).toMatchObject({ title: "Chart Donut", description: "" });
});

test("pacote fora do package.json falha com arquivo e pacote", () => {
  const src: SourceFile = { dir: "components", file: "x.tsx", code: 'import z from "zod";' };
  expect(() => buildItem(src, versions, {})).toThrow(/x\.tsx.*zod/);
});
