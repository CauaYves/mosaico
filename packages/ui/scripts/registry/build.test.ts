import { join } from "node:path";
import { assertCssPartsHaveItems, buildRegistry } from "./build.ts";

test("marcador de CSS sem item correspondente falha com o nome do marcador", () => {
  expect(() =>
    assertCssPartsHaveItems({ theme: "", "brand-loadr": "x" }, new Set(["brand-loader"])),
  ).toThrow(/brand-loadr/);
  expect(() =>
    assertCssPartsHaveItems({ theme: "", "brand-loader": "x" }, new Set(["brand-loader"])),
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

test("um item por arquivo de src, mais o tema", () => {
  expect(json.items).toHaveLength(1 + 76 + 2 + 2);
  expect(json.items[0]?.name).toBe("theme");
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
  expect(Object.keys(byName("brand-loader").css ?? {})).toContain("@keyframes brand-loader-draw");
});
