---
name: mosaico-prototipo
description: Ciclo para construir e lapidar uma tela ou um fluxo com o Mosaico até ficar pronto para mostrar, com alvo, cenários, conferência por captura e revisão. Use ao criar um protótipo, uma tela ou um fluxo novo, e a cada rodada de retorno visual sobre uma tela.
---

# Protótipo com o Mosaico

As regras do kit estão na skill `mosaico-ui`. Esta é o ciclo de trabalho em volta delas: uma tela fica boa por conferência e corte, mais do que pelo primeiro desenho. Cada passo termina numa condição que dá para verificar.

## Ciclo

1. **Alvo.** Antes do código, escreva em até cinco linhas: para que a tela serve, quem usa e em qual aparelho, o caso mais frequente (o que faz quem volta todo mês?) e o único elemento que deve ficar na memória. Se o pedido não revela o caso mais frequente, pergunte só isso. Pronto quando o alvo está escrito na conversa.

2. **Cenários.** Monte cada estado da tela com dado plausível do domínio (nomes, valores e textos que poderiam ser reais) e dê a cada um o seu endereço, como `?cenario=<nome>`. Inclua os estados fora do caminho feliz: vazio, erro, expirado, texto longo, valor que muda com uma escolha. Pronto quando todo estado que a tela pode mostrar abre por um endereço.

3. **Tela.** Construa com os componentes e os tokens do kit. Um valor fora da escala (raio, espaçamento, cor) entra acompanhado do motivo, num comentário. Pronto quando todo valor solto tem motivo escrito.

4. **Conferência.** Depois de cada mudança visual, tire capturas no celular e no computador e olhe as imagens: só elas mostram o que encosta, o que quebra linha e o que serrilha. Borda se confere ampliada, animação quadro a quadro, tamanho medido. As receitas estão em `references/conferencia.md`. Pronto quando toda mudança tem captura vista nas duas larguras.

5. **Revisão.** Passe as capturas pelas perguntas de `references/revisao.md` e corte: a tela melhora mais pelo que sai do que pelo que entra. Pronto quando cada pergunta foi respondida para cada tela, e cada resposta ruim virou correção ou pendência anotada.

6. **Mostrar.** Entregue o endereço de cada cenário e diga o que foi conferido e como. O que só o aparelho da pessoa revela (o navegador dela, o preenchimento automático, a animação em tempo real) entra na resposta como não conferido.

## Rodada de retorno

Cada ponto que a pessoa levanta passa por quatro etapas, nesta ordem:

1. **Reproduzir.** Capture ou meça o que ela descreveu antes de mexer. "Não está suave" vira a lista de alturas a cada quadro; "está pixelado" vira uma captura ampliada.
2. **Causa.** Explique o defeito pelo que a captura ou a medida mostrou, e corrija ali. Um ajuste que esconde o sintoma volta na rodada seguinte.
3. **Conferir.** Repita a mesma captura ou medida depois da correção e compare com a de antes.
4. **Responder.** Ponto a ponto: o que mudou, como foi conferido e o que ficou de fora.

Quando a pessoa pedir para guardar uma versão, faça um commit com tag anotada (`v1`, `v2`…) antes da mudança seguinte: é o ponto de volta se a nova direção não agradar.

## Armadilhas

Antes de animar uma altura, recortar uma forma com máscara, instalar um componente do kit ou mover a pasta do projeto, leia `references/armadilhas.md`: são defeitos que só aparecem na build ou no aparelho, cada um com a causa e a saída.
