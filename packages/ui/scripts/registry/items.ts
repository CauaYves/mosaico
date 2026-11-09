// Monta um item do registry shadcn a partir de um arquivo de src/: dependências npm (com a faixa
// do package.json do ui), dependências internas (endereço completo + tema) e destino.
import { IMPORT_PREFIX, REGISTRY_REPO, TARGET_DIR } from "./config.ts";

type Dir = keyof typeof IMPORT_PREFIX;

export type SourceFile = { dir: Dir; file: string; code: string };
export type Meta = { title?: string; description?: string };
export type ItemType = "registry:ui" | "registry:hook" | "registry:lib";
export type RegistryItem = {
  name: string;
  type: ItemType;
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: { path: string; type: ItemType; target: string }[];
  css?: Record<string, unknown>;
};

const TYPE_BY_DIR: Record<Dir, ItemType> = {
  components: "registry:ui",
  hooks: "registry:hook",
  lib: "registry:lib",
};

/** Pacotes que o projeto de quem instala já tem (peer). */
const IGNORED = new Set(["react", "react-dom"]);

function specifiers(code: string): string[] {
  const found = new Set<string>();
  const pattern = /(?:\bfrom\s+|\bimport\s+|\bimport\s*\(\s*)(["'])([^"']+)\1/g;
  for (const match of code.matchAll(pattern)) found.add(match[2] as string);
  return [...found];
}

function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? `${parts[0]}/${parts[1]}` : (parts[0] as string);
}

function titleCase(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildItem(
  src: SourceFile,
  versions: Record<string, string>,
  meta: Meta,
): RegistryItem {
  const name = src.file.replace(/\.tsx?$/, "");
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>([`${REGISTRY_REPO}/theme`]);

  for (const specifier of specifiers(src.code)) {
    const internal = Object.values(IMPORT_PREFIX).find((prefix) =>
      specifier.startsWith(`${prefix}/`),
    );
    if (internal) {
      registryDependencies.add(`${REGISTRY_REPO}/${specifier.slice(internal.length + 1)}`);
      continue;
    }
    if (specifier.startsWith(".")) {
      // O CLI não reescreve relativos e o arquivo importado não entraria como dependência.
      throw new Error(
        `${src.dir}/${src.file}: import relativo "${specifier}"; use o formato ${IMPORT_PREFIX[src.dir]}/<nome>`,
      );
    }
    const pkg = packageName(specifier);
    if (IGNORED.has(pkg)) continue;
    const range = versions[pkg];
    if (!range) {
      throw new Error(`${src.dir}/${src.file}: o pacote "${pkg}" não está no package.json do ui`);
    }
    dependencies.add(`${pkg}@${range}`);
  }

  const type = TYPE_BY_DIR[src.dir];
  return {
    name,
    type,
    title: meta.title ?? titleCase(name),
    description: meta.description ?? "",
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    files: [
      { path: `src/${src.dir}/${src.file}`, type, target: `${TARGET_DIR[src.dir]}/${src.file}` },
    ],
  };
}
