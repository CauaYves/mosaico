<!-- Gerado de apps/docs/content/docs/para-ia.mdx por "pnpm --filter docs sync:ia". Não edite aqui. -->

# Princípios do Mosaico para materiais fora do código

## Instruções

Você vai criar material para a **Multiclubes**: relatório, documentação, apresentação, template de e-mail ou o visual de um projeto pequeno. Siga o padrão visual do **Mosaico**, o design system da empresa. O objetivo é que o resultado pareça da mesma empresa que os produtos dela.

### O que é definitivo e o que não é

Não trate tudo como regra fechada.

- **Definitivo:** forma arredondada, hierarquia, tokens semânticos, acessibilidade, tom de movimento e as regras de cada tipo de material abaixo.
- **Cores e fonte:** o **azul `#0540c5`** é a cor principal da interface (ações, foco e links) e o **amarelo `#fee502`** é o destaque. A fonte é a **Geist** (Sans para texto, Mono para código). Os cinzas são neutros de apoio e **não são a identidade de cor da marca**; não use o cinza como se fosse a cor da Multiclubes.

### Marca

- Logo: o símbolo é um "m" feito de arcos, e a wordmark é "Multiclubes" em formas de cantos suaves. Não redesenhe, não distorça, não recolora fora das cores abaixo e não escreva o nome com outra grafia.
- Cores da marca, extraídas da logo: **amarelo `#fee502`** e **azul `#0540c5`**.
- Use o azul para a ação principal e o amarelo para, no máximo, um elemento de destaque por peça. Não invente outras cores de marca.
- Texto sobre amarelo deve ser escuro. Texto sobre azul deve ser claro. Confira o contraste.

### Cores neutras

Use estes valores quando precisar de neutros. Em e-mail e em documentos, use sempre **hexadecimal**.

| Função | Hex | Uso |
| --- | --- | --- |
| Fundo | `#ffffff` | Fundo da página |
| Texto | `#0a0a0a` | Texto principal |
| Texto secundário | `#737373` | Legendas, datas, apoio |
| Superfície suave | `#f5f5f5` | Cards, blocos de destaque |
| Borda | `#e5e5e5` | Divisores e contornos |
| Ação principal | `#0540c5` | Botão principal, com texto claro |
| Erro | `#e7000b` | Erro e alerta destrutivo |

Use cores por **função**, não por aparência. Pense em "texto secundário", e não em "cinza claro".

### Forma

A identidade visual é de **formas suaves**, coerente com a logo.

- Botões são **pílulas**: raio total nas pontas.
- Campos, cards e blocos têm cantos bem arredondados, e os cards mais que os campos.
- Use um raio por tipo de elemento e repita. Elementos aninhados: o raio de dentro é o de fora menos o espaçamento entre eles.
- Evite cantos retos em botões e cards, e evite misturar cantos retos e arredondados na mesma peça.

### Hierarquia

- Uma mensagem principal por tela, página ou e-mail, e uma ação primária.
- Para destacar algo, enfraqueça o resto: texto secundário em `#737373`, e não aumentar tudo.
- Ênfase de ação, da mais forte para a mais fraca: cheia, secundária, contorno, texto. A ação destrutiva é discreta (fundo vermelho bem claro e texto vermelho), e a confirmação mostra a gravidade.
- Prefira espaço, fundo suave e sombra leve a bordas. Use borda só onde ela explica algo, como o contorno de um campo.
- Comece com espaço demais e tire.
- Linhas de texto de 45 a 75 caracteres. Texto menor pede entrelinha maior.

### Tipografia

- A fonte oficial ainda **não está definida**. Use uma sans-serif limpa e legível (`system-ui` ou equivalente) e avise na sua resposta que a fonte é temporária.
- Poucos tamanhos, bem distintos. Corpo de texto de 14 a 16 px. Nunca abaixo de 12 px.
- Peso e cor criam hierarquia junto com o tamanho. Evite preto puro `#000`; use `#0a0a0a`.

### Acessibilidade

- Não use só a cor para comunicar estado: acrescente ícone ou texto.
- Contraste de texto de pelo menos 4,5:1 (3:1 para texto grande).
- Alvos clicáveis de pelo menos 44 px de altura em e-mail e mobile.
- Imagens com texto alternativo. Links com texto que faça sentido fora do contexto (nunca "clique aqui").
- Foco visível em qualquer elemento interativo que você criar.

### Movimento (só para material interativo)

- Menos de 300 ms, com curva de desaceleração (`ease-out`).
- Elementos que aparecem partem de uma escala próxima de 1 (por exemplo 0,95) com opacidade, nunca de zero.
- Animação só onde ajuda a entender o que mudou. Respeite `prefers-reduced-motion`.

## Por tipo de material

### Template de e-mail

Clientes de e-mail são limitados, e a ordem de prioridade é funcionar em todos.

- Layout com **tabelas**, largura máxima de **600 px**, centralizado.
- **CSS inline.** Sem variáveis CSS, sem `oklch`, sem fontes externas confiáveis. Cores em hexadecimal.
- Pilha de fontes segura: `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- Botões "à prova de bala": um link estilizado dentro de uma célula de tabela, com altura mínima de 44 px. O Outlook ignora cantos arredondados em alguns casos e mostra o botão reto. Isso é aceitável, o botão continua funcional.
- Uma ação principal, de preferência acima da dobra.
- Todo conteúdo importante em texto, não em imagem. Imagens com `alt`.
- Logo no topo, rodapé com o nome da empresa e o motivo de a pessoa estar recebendo a mensagem.
- Considere o modo escuro: não coloque texto escuro em imagem transparente e evite fundo branco puro em imagens.

### Relatório e apresentação

- Comece pela conclusão. O título diz o que o leitor deve concluir, não o assunto.
- Um gráfico, uma mensagem. Rotule direto no gráfico, em vez de legenda separada, quando couber.
- Poucas cores: neutros para o contexto e uma cor de destaque para o dado que importa.
- Números alinhados à direita e com o mesmo número de casas decimais.
- Resultados só com dados reais. Nunca invente métrica, percentual ou depoimento. Se faltar o dado, escreva que ele não foi medido.

### Documentação e textos

- Estrutura previsível: objetivo, como usar, exemplos, limites.
- Títulos curtos e que descrevem o conteúdo. Parágrafos curtos.
- Exemplos antes de explicações longas.
- Diga o que **não** está coberto, para o leitor não presumir.

### Projeto web ou protótipo fora do kit

Se o projeto usar React e Tailwind, **não recrie os componentes**. Instale-os pelo registry do Mosaico e use os que já existem, como `Button`, `Input` e `Card`. O `init` configura o tema e os ícones Phosphor:

```bash
npx shadcn@latest init CauaYves/mosaico/base
npx shadcn@latest add CauaYves/mosaico/button
```

Use sempre classes semânticas (`bg-primary`, `text-muted-foreground`, `border-input`), nunca cores fixas. Se não puder usar o kit, siga as seções de forma, hierarquia e acessibilidade acima.

## Como responder

1. Entregue o material pedido, e não uma explicação sobre o padrão.
2. No fim, liste em poucas linhas **as suposições** que você fez: fonte, uso de cores da marca, qualquer coisa que o padrão não define.
3. Se algum pedido do usuário conflitar com as regras acima, siga o pedido e avise qual regra deixou de ser seguida.
4. Não afirme que o resultado "segue o design system oficial". Diga que ele **segue os princípios do Mosaico**, e que o design deve revisar antes de publicar.
