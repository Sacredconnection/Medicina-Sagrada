# Fundo da seção de kits

Salve as duas artes finais nesta pasta com os nomes exatos:

- `medicina-sagrada-kits-background-desktop.webp`
- `medicina-sagrada-kits-background-mobile.webp`

Especificações para desktop:

- Dimensão: 2400 × 1400 px
- Proporção: 12:7
- Formato: WebP com transparência
- Perfil de cor: sRGB
- Peso recomendado: até 600 KB

Especificações para mobile:

- Dimensão: 1080 × 2400 px
- Proporção: 9:20
- Formato: WebP com transparência
- Perfil de cor: sRGB
- Peso recomendado: até 500 KB

Cor-base da seção: `#0B261D` (`--forest-950`).

A cor verde já é aplicada pelo CSS. Portanto, não inclua um fundo verde opaco na
arte: exporte apenas o pattern, a textura ou outros elementos decorativos com
transparência. Assim a imagem ficará sobre a cor atual e poderá ser ajustada sem
criar diferenças de tom.

Direção de composição:

- Não inclua títulos, textos, botões ou imagens dos cards na arte.
- Evite detalhes muito contrastados atrás do título e dos cards.
- Ajuste a composição de cada arquivo à sua orientação. A versão desktop deve
  funcionar horizontalmente; a versão mobile deve ser pensada como uma arte
  vertical longa.
- Na versão mobile, mantenha o pattern principal na faixa inferior da arte e
  preserve a metade superior com baixa interferência visual para o título e os
  cards.
- Mantenha os elementos importantes próximos ao centro e deixe as bordas
  preparadas para cortes.
- Prefira textura orgânica, grafismos sutis ou elementos com baixa opacidade.

O site usa `background-size: cover` e `background-position: center`. A imagem
mobile entra automaticamente em telas de até 900 px. Ao salvar os dois WebPs com
os nomes indicados, cada versão aparecerá no tamanho correto sem alteração no código.

Durante o desenvolvimento local, o site verifica alterações nesses dois arquivos
a cada 750 ms. Você pode sobrescrever o WebP mantendo o mesmo nome: a nova versão
será pré-carregada e aplicada automaticamente, sem atualizar a página.
