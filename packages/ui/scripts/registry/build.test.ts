import { join } from "node:path";
import { assertCssPartsHaveItems, buildRegistry } from "./build.ts";

test("marcador de CSS sem item correspondente falha com o nome do marcador", () => {
  expect(() =>
    assertCssPartsHaveItems({ theme: "", "mosaic-loadr": "x" }, new Set(["mosaic-loader"])),
  ).toThrow(/mosaic-loadr/);
  expect(() =>
    assertCssPartsHaveItems({ theme: "", "mosaic-loader": "x" }, new Set(["mosaic-loader"])),
  ).not.toThrow();
});

type Item = {
  name: string;
  description: string;
  registryDependencies?: string[];
  files?: { target: string }[];
  css?: Record<string, unknown>;
};

const uiRoot = join(import.meta.dirname, "../..");
const docsContentRoot = join(uiRoot, "../../apps/docs/content/docs");
const json = JSON.parse(buildRegistry(uiRoot, docsContentRoot)) as { items: Item[] };
const byName = (name: string) => json.items.find((item) => item.name === name) as Item;

test("um item por arquivo de src, mais o tema e a base", () => {
  expect(json.items).toHaveLength(2 + 81 + 2 + 3);
  expect(json.items[0]?.name).toBe("theme");
  expect(json.items[1]?.name).toBe("base");
});

test("a base usa Phosphor, não estende o shadcn oficial e instala as skills do kit", () => {
  const base = byName("base") as Item & {
    extends?: string;
    config?: { iconLibrary?: string };
    dependencies?: string[];
    files?: { target: string; content?: string }[];
  };
  expect(base.extends).toBe("none");
  expect(base.config?.iconLibrary).toBe("phosphor");
  expect(base.dependencies?.some((dep) => dep.startsWith("@phosphor-icons/react@"))).toBe(true);
  expect(base.dependencies?.some((dep) => dep.startsWith("lucide-react"))).toBe(false);
  expect(base.files?.map((file) => file.target)).toEqual([
    "~/.claude/skills/mosaico-ui/SKILL.md",
    "~/.claude/skills/mosaico-ui/references/principios.md",
    "~/.claude/skills/mosaico-prototipo/SKILL.md",
    "~/.claude/skills/mosaico-prototipo/references/conferencia.md",
    "~/.claude/skills/mosaico-prototipo/references/revisao.md",
    "~/.claude/skills/mosaico-prototipo/references/armadilhas.md",
  ]);
  for (const file of base.files ?? []) expect(file.content?.length).toBeGreaterThan(100);
});

test("nenhuma dependência com nome solto e nenhum target em @ui/", () => {
  for (const item of json.items) {
    for (const dep of item.registryDependencies ?? []) {
      expect(dep).toMatch(/^CauaYves\/mosaico\/[a-z0-9-]+$/);
    }
    for (const file of item.files ?? []) expect(file.target.startsWith("@ui/")).toBe(false);
  }
});

test("todo registryDependency existe como item", () => {
  const names = new Set(json.items.map((item) => item.name));
  for (const item of json.items) {
    for (const dep of item.registryDependencies ?? [])
      expect(names).toContain(dep.split("/").at(-1));
  }
});

test("ref de teste fixa as dependências internas na branch; sem ref, nada de #", () => {
  const pinned = JSON.parse(buildRegistry(uiRoot, docsContentRoot, "teste-x")) as { items: Item[] };
  const dialog = pinned.items.find((item) => item.name === "dialog") as Item;
  expect(dialog.registryDependencies).toEqual([
    "CauaYves/mosaico/button#teste-x",
    "CauaYves/mosaico/theme#teste-x",
  ]);
  for (const item of json.items) {
    for (const dep of item.registryDependencies ?? []) expect(dep).not.toContain("#");
  }
});

test("metadado do MDX e CSS próprio", () => {
  expect(byName("button").description).toBe(
    "Displays a button or a component that looks like a button.",
  );
  expect(Object.keys(byName("mosaic-loader").css ?? {})).toContain(
    "@keyframes mosaic-loader-pulse",
  );
});
