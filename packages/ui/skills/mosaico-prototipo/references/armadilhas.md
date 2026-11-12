# Armadilhas

Defeitos que o código não mostra: aparecem na build de produção ou no aparelho. Cada um traz o sintoma, a causa e a saída.

## Build

- **A animação funciona em desenvolvimento e some na build.** O minificador reduz a `animation: none` uma declaração `animation` sem nome, escrita para receber o `animation-name` em outra regra. Escreva a declaração inteira, com o nome, em cada regra.
- **A conferência final vale na build de produção.** Rode `build` e `start` antes das últimas capturas: o servidor de desenvolvimento não minifica.

## Recortes e máscaras

- **A borda curva ou diagonal sai em degraus.** Um gradiente com corte seco (`#0000 97%, #000`) não é suavizado. Use como máscara uma forma em SVG (`url("data:image/svg+xml,…")`): o navegador a desenha na resolução da tela e suaviza a borda.
- **O recorte aparece como uma mancha clara.** Um disco pintado com a cor do fundo, por cima do elemento, não recebe a sombra que o elemento projeta em volta. Faça um furo de verdade: subtraia a forma da máscara com `mask-composite: exclude`.
- **A sombra some ou é cortada.** `box-shadow` é cortada pela máscara do próprio elemento. Ponha `filter: drop-shadow()` num elemento de fora: ela acompanha o recorte.

## Altura e posição

- **Animar até `height: auto`.** O CSS não interpola até uma altura que desconhece. A grade de `0fr` a `1fr` resolve o caso simples, mas abre um vão quando o filho tem altura mínima. Meça a altura de chegada num `useLayoutEffect` e anime com `element.animate()`.
- **Um elemento dá lugar a outro de tamanho diferente.** Trocar um pelo outro salta. O que entra parte do tamanho e da posição do que saiu (meça antes da troca) e cresce até o seu.
- **A imagem estica durante a transição de visualização.** O instantâneo de um elemento nomeado é esticado até o tamanho novo. Deixe a transição só esmaecer a tela e anime o tamanho no elemento real.
- **`100vw` é mais largo que a tela no computador.** Ele inclui a barra de rolagem. Um elemento que vai de ponta a ponta com `100vw` pede `overflow-x: clip` no contêiner da página.

## Campos

- **O iOS dá zoom ao focar o campo.** Texto de campo com menos de 16px. Use 16px nos campos de formulário.
- **O campo preenchido pelo navegador muda de cor.** O navegador impõe o fundo com `!important`. Uma transição muito longa de `background-color` na pseudoclasse `:autofill` mantém a cor do tema.

## Kit e projeto

- **`shadcn add` regrava o CSS global e atualiza componentes já instalados.** Confira o `git diff` depois de cada instalação e mantenha o que é do projeto num arquivo de tema separado.
- **O instalador fica parado.** Ele espera uma confirmação de sobrescrita. Rode com `--yes --overwrite` e a entrada vinda de `/dev/null`.
- **As dependências quebram depois de mover a pasta.** O pnpm liga os pacotes por caminho absoluto no Windows. Apague `node_modules` e a pasta da build e instale de novo.
