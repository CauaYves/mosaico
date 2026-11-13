import { describe, expect, it } from "vitest";
import {
  choicesFromSearch,
  choicesToSearch,
  editUrlFromFile,
  replaceSearch,
  searchFromThemeFile,
  themeFile,
  themeFileName,
} from "./create-theme-file";

const options = {
  colors: ["red", "blue"],
  charts: ["blue", "amber"],
  radii: ["0", "0.5", "0.625"],
  fonts: ["Geist", "DM Sans"],
};
const defaults = {
  cliente: "",
  cor: "blue",
  graficos: "blue",
  raio: "0.625",
  fonte: "Geist",
  titulos: "",
};
const flamengo = {
  cliente: "Flamengo",
  cor: "red",
  graficos: "amber",
  raio: "0.5",
  fonte: "DM Sans",
  titulos: "Geist",
};

describe("parâmetros da URL", () => {
  it("serializa na ordem fixa", () => {
    expect(choicesToSearch(flamengo)).toBe(
      "cliente=Flamengo&cor=red&graficos=amber&raio=0.5&fonte=DM+Sans&titulos=Geist",
    );
  });

  it("ida e volta preserva as escolhas, inclusive fonte com espaço", () => {
    expect(choicesFromSearch(choicesToSearch(flamengo), options, defaults)).toEqual(flamengo);
  });

  it("aceita ? inicial", () => {
    expect(choicesFromSearch(`?${choicesToSearch(flamengo)}`, options, defaults)).toEqual(flamengo);
  });

  it("valor ausente ou inválido volta ao padrão", () => {
    expect(
      choicesFromSearch("cor=roxo&raio=9&fonte=Comic&titulos=Comic", options, defaults),
    ).toEqual(defaults);
  });

  it("corta o nome do cliente em 80 caracteres, sem espaços nas pontas", () => {
    const search = new URLSearchParams({ cliente: `  ${"a".repeat(100)}  ` }).toString();
    expect(choicesFromSearch(search, options, defaults).cliente).toBe("a".repeat(80));
  });

  it("link de outra origem: só os parâmetros contam", () => {
    const url = new URL("http://localhost:3001/create?cor=red&raio=0.5");
    expect(choicesFromSearch(url.search, options, defaults)).toEqual({
      ...defaults,
      cor: "red",
      raio: "0.5",
    });
  });
});

describe("themeFileName", () => {
  it("kebab-case sem acentos", () => {
    expect(themeFileName("Flamengo Sócio")).toBe("flamengo-socio.css");
  });

  it("sem nome", () => {
    expect(themeFileName("")).toBe("tema-mosaico.css");
  });

  it("só símbolos", () => {
    expect(themeFileName("*/!!")).toBe("tema-mosaico.css");
  });
});

describe("themeFile", () => {
  const editUrl = "http://localhost:3001/create?cliente=Flamengo&cor=red";

  it("monta cabeçalho e corpo", () => {
    expect(
      themeFile({
        cliente: "Flamengo",
        editUrl,
        css: ":root {\n  --radius: 0.5rem;\n}",
        date: "2026-11-13",
      }),
    ).toBe(
      [
        "/*",
        " * Tema Mosaico: Flamengo",
        ` * Editar: ${editUrl}`,
        " * Gerado em 2026-11-13",
        " *",
        " * Carregue este arquivo depois do globals.css do projeto.",
        " */",
        ":root {\n  --radius: 0.5rem;\n}",
        "",
      ].join("\n"),
    );
  });

  it("sem nome, o título é só 'Tema Mosaico'", () => {
    expect(themeFile({ cliente: "", editUrl, css: "", date: "2026-11-13" })).toContain(
      " * Tema Mosaico\n",
    );
  });

  it.each(["**//", "*/*//", "x**//y"])("nome %s não forma um novo */", (cliente) => {
    const file = themeFile({ cliente, editUrl, css: "", date: "2026-11-13" });
    expect(file.indexOf("*/")).toBe(file.lastIndexOf("*/"));
  });

  it("nome com */ ou quebra de linha não fecha o comentário", () => {
    const file = themeFile({ cliente: "A */ b\nc", editUrl, css: "", date: "2026-11-13" });
    expect(file.indexOf("*/")).toBe(file.lastIndexOf("*/"));
    expect(file).toContain(" * Tema Mosaico: A b c\n");
  });
});

describe("editUrlFromFile", () => {
  it("lê o link do arquivo gerado", () => {
    const file = themeFile({
      cliente: "X",
      editUrl: "https://a.b/create?cor=red",
      css: "",
      date: "2026-11-13",
    });
    expect(editUrlFromFile(file)).toBe("https://a.b/create?cor=red");
  });

  it("arquivo sem cabeçalho do Mosaico", () => {
    expect(editUrlFromFile(":root { --primary: red; }")).toBeNull();
  });

  it("aceita CRLF", () => {
    expect(editUrlFromFile("/*\r\n * Editar: https://a.b/create?cor=red\r\n */")).toBe(
      "https://a.b/create?cor=red",
    );
  });
});

describe("searchFromThemeFile", () => {
  const header = themeFile({
    cliente: "X",
    editUrl: "http://localhost:3001/create?cor=red",
    css: "",
    date: "2026-11-13",
  });

  it("devolve os parâmetros do link Editar:", async () => {
    expect(await searchFromThemeFile(new Blob([header]))).toBe("?cor=red");
  });

  it("lê só o começo de um arquivo grande", async () => {
    const big = new Blob([header, "x".repeat(5_000_000)]);
    const slice = big.slice.bind(big);
    let read = 0;
    big.slice = (...args) => {
      const part = slice(...args);
      read = part.size;
      return part;
    };
    expect(await searchFromThemeFile(big)).toBe("?cor=red");
    expect(read).toBeLessThanOrEqual(4096);
  });

  it("arquivo sem cabeçalho do Mosaico", async () => {
    expect(await searchFromThemeFile(new Blob([":root{}"]))).toBeNull();
  });

  it("link inválido", async () => {
    const file = ["/*", " * Editar: nao-e-url", " */"].join("\n");
    expect(await searchFromThemeFile(new Blob([file]))).toBeNull();
  });

  it("falha de leitura vira null, sem exceção", async () => {
    const broken = new Blob(["x"]);
    broken.slice = () => {
      throw new DOMException("sumiu", "NotFoundError");
    };
    expect(await searchFromThemeFile(broken)).toBeNull();
  });
});

describe("replaceSearch", () => {
  it("escreve a URL preservando o hash", () => {
    const calls: string[] = [];
    replaceSearch({ replaceState: (_s, _t, url) => calls.push(String(url)) }, "cor=red", "#x");
    expect(calls).toEqual(["?cor=red#x"]);
  });

  it("não propaga o erro do navegador (limite do Safari)", () => {
    const history = {
      replaceState: () => {
        throw new DOMException("limite", "SecurityError");
      },
    };
    expect(() => replaceSearch(history, "cor=red", "")).not.toThrow();
  });
});
