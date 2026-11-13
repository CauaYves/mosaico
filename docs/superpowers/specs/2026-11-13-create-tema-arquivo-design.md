# Tema de cliente em arquivo, gerado no /create: desenho

> Status: aprovado · 2026-11-13 · Branch: `feat/create-tema-arquivo`

## Por quê

A Multiclubes tem mais de 140 clientes, e cada um pode ter uma identidade visual própria. O `/create`
passa a ser a ferramenta que produz essas identidades: monta-se o tema do cliente na página e ela
entrega um arquivo `.css` pronto para usar em outro projeto. Com tantos clientes, um tema criado
hoje precisa poder ser reaberto e ajustado depois.

Hoje o `/create` só mostra, num diálogo, um trecho de CSS e um trecho de `layout.tsx` para copiar.

## Objetivos

- O `/create` gera um arquivo `<cliente>.css` para baixar, com as variáveis que mudam em relação ao
  tema Multiclubes.
- O arquivo traz no cabeçalho um link que reabre o `/create` com as mesmas escolhas.
- As escolhas ficam na URL do `/create`, para compartilhar e reabrir.
- Arrastar um `.css` gerado para a página restaura as escolhas.

## Fora do escopo

- Servidor, endpoint ou deploy do site de docs.
- Guardar temas de clientes no repositório do Mosaico (o repositório é público).
- Item de registry para tema de cliente ou comando `shadcn add` de tema.
- Novas opções de personalização além das que o `/create` já tem (cor, cor dos gráficos, raio,
  fonte do texto, fonte dos títulos).
- Logos, favicon e imagens do cliente.

## Anti-objetivos

- Um tema de cliente que é apagado quando o projeto roda `shadcn add` de um componente. Por isso o
  arquivo nunca vai no `globals.css`.
- Um arquivo gerado que, reaberto, não volta exatamente às mesmas escolhas.

## Abordagens consideradas

| | Abordagem | Por que não |
| --- | --- | --- |
| A | Temas como itens do registry no GitHub (`shadcn add CauaYves/mosaico/tema-<cliente>`) | Expõe a lista de clientes no repositório público |
| B | Código do tema na URL e um endpoint que devolve o arquivo (como o `--preset` do shadcn) | Exige servidor publicado; o preset do shadcn em si não aceita registry de terceiros |
| **C** | **O `/create` gera um `.css` para baixar, com link de edição no cabeçalho** | **Escolhida:** sem servidor, sem expor clientes, e o arquivo é a fonte da verdade |

## Desenho

### Formato do arquivo

```css
/*
 * Tema Mosaico: flamengo
 * Editar: <origem do site>/create?cliente=flamengo&cor=red&graficos=blue&raio=0.5&fonte=inter&titulos=
 * Gerado em 2026-11-13
 *
 * Carregue este arquivo depois do globals.css do projeto.
 */
:root { … }
.dark { … }
```

- O corpo é o mesmo CSS que o `themeCss` do `create-customizer.tsx` já gera (só o que difere do tema
  padrão). Com o tema padrão, o arquivo tem o cabeçalho e o comentário "Tema padrão: não há nada
  para sobrescrever."
- Nome do arquivo: o nome do cliente em kebab-case (`Flamengo Sócio` → `flamengo-socio.css`). Sem
  nome, `tema-mosaico.css`.
- O trecho do `layout.tsx` das fontes continua no diálogo como hoje, porque a fonte é carregada pelo
  app (`next/font`), não pelo CSS.

### Parâmetros da URL

Parâmetros nomeados e legíveis, não um código compactado: `cliente`, `cor`, `graficos`, `raio`,
`fonte`, `titulos`. Valores são os nomes já usados no `/create` (nome da paleta, valor do raio, nome
da fonte). Parâmetro ausente ou inválido volta ao padrão, sem erro.

A URL é atualizada a cada mudança, sem criar entradas no histórico do navegador (`replace`).

### Reabrir pelo arquivo

Soltar um `.css` sobre a página (ou escolher pelo botão **Abrir tema**) lê a linha `Editar:` do
cabeçalho e aplica os parâmetros dela. Se o arquivo não tiver essa linha, a página avisa:
"Este arquivo não foi gerado pelo Mosaico. Abra um tema baixado do /create."

### Interface

- Campo **Nome do cliente** no painel de opções.
- No diálogo **Usar este tema**: botão **Baixar tema** (baixa o `.css`), o trecho de CSS e o trecho
  do `layout.tsx` como hoje, e uma linha explicando que o arquivo vai em separado e é carregado
  depois do `globals.css`.

### Documentação

A página `/docs/installation` ganha a seção "Tema de cliente": gerar no `/create`, salvar o arquivo
no projeto (no Portal, `src/themes/<cliente>/`), carregá-lo depois do `globals.css` e reabrir pelo
link do cabeçalho.

## Restrições

- Tudo roda no navegador; o site de docs continua sem deploy.
- Lint (Biome), tipos, testes e build continuam passando.

## Decisões minhas (para conferir)

- Parâmetros nomeados em português no lugar de um código compactado, para o link ser legível.
- Origem do link de edição: a origem do site em que o `/create` está aberto (hoje `localhost:3001`).
  Quando houver endereço fixo, basta abrir o mesmo link trocando a origem.
- Arrastar o arquivo, além do botão **Abrir tema**.

## Fica a cargo do builder

- Onde ficam as funções puras de serializar e ler os parâmetros e o cabeçalho (sugestão:
  `apps/docs/lib/create-theme-file.ts`, com testes).
- O desenho visual do campo de nome e da área de soltar o arquivo, seguindo o resto da página.
