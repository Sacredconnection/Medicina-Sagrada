# Imagens do Ritual Finder

## Banner de fundo da seção

Adicione o banner WebP desta seção com o nome exato:

- `medicina-sagrada-ritual-finder-background.webp`

Especificação recomendada: **2400 × 1600 px**, WebP, sRGB, preferencialmente
até **700 KB**. A imagem ocupa toda a seção com `background-size: cover` e
posição central. Preserve o assunto principal no centro e deixe as bordas como
área segura, porque elas serão cortadas de maneira diferente no desktop e no
mobile.

Este arquivo fica reservado caso o banner de fundo seja reativado no futuro.
Atualmente, a seção externa do Ritual Finder usa fundo branco puro e não carrega
essa imagem.

## Fundo do painel verde de entrada

Adicione as imagens que ficarão sobre o verde do painel “Descubra sua Medicina
de Hoje” usando os nomes exatos:

- Desktop: `medicina-sagrada-ritual-finder-intro-background.webp`
- Mobile: `medicina-sagrada-ritual-finder-intro-background-mobile.webp`

Especificação recomendada para desktop: **2400 × 1600 px**. Para mobile, use
**1080 × 1920 px**. Exporte ambas em WebP, sRGB, preferencialmente até **700 KB**
cada. Não inclua textos, botões ou logotipos dentro das imagens. Preserve áreas
livres para o título, a descrição e o botão.

O painel aplica uma camada verde escura sobre a imagem para preservar a identidade
visual e a leitura dos textos. Como o arquivo será recortado com
`background-size: cover`, deixe margem segura ao redor do assunto principal.
No mobile, o CSS usa exclusivamente o arquivo terminado em `-mobile.webp`.
Enquanto um dos WebPs não estiver presente, o verde atual permanece como
fallback naquele formato de tela.

## Imagem do card de entrada

Adicione as imagens que ficarão dentro do círculo claro do card de entrada
usando os nomes exatos:

- Desktop: `medicina-sagrada-ritual-finder-intro.webp`
- Mobile: `medicina-sagrada-ritual-finder-intro-mobile.webp`

Especificação recomendada para cada arquivo: **1200 × 1200 px**, WebP com fundo
transparente, sRGB e preferencialmente até **500 KB**. Mantenha o elemento
principal centralizado e preserve uma margem segura ao redor. A imagem usa
`background-size: cover`, preenchendo todo o círculo. No mobile, o círculo é
ampliado e recortado pelas
bordas do card, portanto componha a arte mobile considerando principalmente a
metade superior do arquivo. O CSS troca automaticamente para a versão mobile em
telas de até 600 px.

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
