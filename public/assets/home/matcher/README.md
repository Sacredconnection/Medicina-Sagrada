# Imagens do Ritual Finder

## Banner de fundo da seção

Adicione o banner WebP desta seção com o nome exato:

- `medicina-sagrada-ritual-finder-background.webp`

Especificação recomendada: **2400 × 1600 px**, WebP, sRGB, preferencialmente
até **700 KB**. A imagem ocupa toda a seção com `background-size: cover` e
posição central. Preserve o assunto principal no centro e deixe as bordas como
área segura, porque elas serão cortadas de maneira diferente no desktop e no
mobile.

O CSS já referencia esse nome. Enquanto o arquivo não estiver na pasta, a seção
mantém automaticamente o fundo bege atual. Depois de substituir ou inserir o
arquivo, basta atualizar a página local.

## Imagem do card de entrada

Adicione a imagem que ficará dentro do meio círculo branco à direita usando o
nome exato:

- `medicina-sagrada-ritual-finder-intro.webp`

Especificação recomendada: **1200 × 1200 px**, WebP com fundo transparente,
sRGB e preferencialmente até **500 KB**. Mantenha o elemento principal
centralizado. A imagem usa `background-size: contain`, portanto será exibida
inteira dentro da área branca, sem cortes.

## Imagens dos cards

O Ritual Finder usa exclusivamente estes cinco arquivos locais, configurados em
`lib/rituals-data.ts`:

- `aterramento-presenca.webp`
- `forca-coragem.webp`
- `silencio-mental-paz.webp`
- `abertura-coracao.webp`
- `purificacao-limpeza.webp`

Especificação recomendada: 900 × 1200 px, WebP, composição vertical com margem
segura e contraste suficiente na área inferior para os textos brancos. Para
atualizar um card, substitua o arquivo correspondente mantendo exatamente o mesmo
nome; não é necessário alterar o código.
