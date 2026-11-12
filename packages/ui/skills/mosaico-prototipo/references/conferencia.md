# Receitas de conferência

Scripts curtos com `playwright-core`, que usa o navegador já instalado na máquina (`channel: "msedge"` ou `"chrome"`), sem baixar outro. Guarde-os numa pasta `e2e/` do projeto e rode com `node e2e/<arquivo>.mjs`, com o servidor no ar.

```bash
pnpm add -D playwright-core
```

Todas as receitas partem deste começo:

```js
import { chromium } from "playwright-core";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge" });
```

## Capturas nas duas larguras

Uma captura por cenário e por largura, da página inteira. Espere a tela assentar: captura no meio de uma animação de entrada sai borrada.

```js
const sizes = [
  { name: "celular", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  { name: "computador", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
];

for (const scenario of ["padrao", "vazio", "erro"]) {
  for (const { name, ...options } of sizes) {
    const page = await browser.newPage({ ...options, colorScheme: "light" });
    await page.goto(`${base}/?cenario=${scenario}`);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `e2e/shots/${scenario}-${name}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
```

Abra cada imagem e olhe. A lista de arquivos gerados não confere nada.

## Borda ampliada

Recorte a região e amplie com pixels duros. O fator 1 é o pior caso: cada pixel da tela é um pixel do desenho. Compare a borda suspeita com uma borda do kit na mesma captura, como o canto de um botão.

```js
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await page.goto(base);
const box = await page.locator("[data-slot='card']").first().boundingBox();
const clip = { x: box.x - 8, y: box.y - 8, width: 80, height: 80 };
const shot = await page.screenshot({ clip });

const view = await browser.newPage({ viewport: { width: 640, height: 640 } });
await view.setContent(
  `<body style="margin:0"><img src="data:image/png;base64,${shot.toString("base64")}" style="width:640px;image-rendering:pixelated"></body>`,
);
await view.screenshot({ path: "e2e/shots/borda.png" });
```

## Animação quadro a quadro

Pause as animações e percorra a linha do tempo: a captura deixa de depender do relógio da máquina. Vale para animação de CSS, de `element.animate()` e de transição de visualização.

```js
await page.getByRole("button", { name: "Confirmar" }).click();
await page.locator("[data-estado='concluido']").waitFor();

for (const time of [0, 100, 250, 400, 600, 1000]) {
  await page.evaluate((t) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = t;
    }
  }, time);
  await page.screenshot({ path: `e2e/shots/quadro-${String(time).padStart(4, "0")}.png` });
}
```

## Tamanho medido em tempo real

Registre a caixa do elemento a cada quadro, do clique até o fim. Uma mudança contínua aparece como uma sequência de valores próximos; um salto, como dois valores sem nada entre eles.

```js
await page.evaluate(() => {
  window.__sizes = [];
  const tick = () => {
    const el = document.querySelector("[data-medir]");
    if (el) window.__sizes.push(Math.round(el.getBoundingClientRect().height));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await page.getByRole("button", { name: "Confirmar" }).click();
await page.waitForTimeout(1500);
console.log((await page.evaluate(() => [...new Set(window.__sizes)])).join(" → "));
```

## Rolagem horizontal e console

Rode em 360, 768, 1024 e 1440 de largura. As duas listas vazias são a condição de passagem.

```js
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => message.type() === "error" && errors.push(message.text()));

await page.goto(base);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
if (overflow > 0) errors.push(`rolagem horizontal de ${overflow}px`);
console.log(errors.length ? errors.join("\n") : "sem erros");
```

## Fluxo de ponta a ponta

Um script percorre cada caminho como a pessoa faria, pelo nome dos controles (`getByRole`, `getByLabel`), e espera o texto do estado seguinte. Ele confere duas coisas de uma vez: que o fluxo fecha e que os controles têm nome para o leitor de tela. Rode-o depois de cada rodada de mudanças, na build de produção.

## Mostrar no celular da pessoa

Um túnel (`ngrok http <porta>`, ou equivalente) dá um endereço público para o servidor local. O endereço muda a cada vez que o túnel é religado: confira que ele responde e avise a pessoa quando mudar.
