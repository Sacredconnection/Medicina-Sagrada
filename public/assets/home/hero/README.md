# Hero da página inicial

## Desktop

- Arquivo: `medicina-sagrada-home-hero-desktop.webp`
- Dimensão recomendada: 2560 x 1440 px
- Proporção: 16:9
- Formato: WebP, sRGB
- Peso recomendado: até 800 KB
- Uso no site: `/assets/home/hero/medicina-sagrada-home-hero-desktop.webp`

## Mobile

- Arquivo: `medicina-sagrada-home-hero-mobile.webp`
- Dimensão recomendada: 1080 x 1440 px
- Proporção: 3:4
- Formato: WebP, sRGB
- Peso recomendado: até 500 KB
- Uso no site: `/assets/home/hero/medicina-sagrada-home-hero-mobile.webp`

## Segundo banner — acessórios, kuripes e tepis

### Desktop

- Arquivo: `medicina-sagrada-home-hero-02-desktop.webp`
- Dimensão recomendada: 2560 x 1440 px
- Proporção: 16:9
- Formato: WebP, sRGB
- Peso recomendado: até 800 KB

### Mobile

- Arquivo: `medicina-sagrada-home-hero-02-mobile.webp`
- Dimensão recomendada: 1080 x 1440 px
- Proporção: 3:4
- Formato: WebP, sRGB
- Peso recomendado: até 500 KB

Enquanto esses arquivos não estiverem na pasta, o segundo banner usa a imagem
do primeiro como fallback. Não inclua texto, logotipo ou CTA na arte.

## Atualização durante a edição

Com `npm run dev` aberto, substitua e salve qualquer um dos WebPs mantendo os
nomes indicados. A página verifica alterações nos dois arquivos a cada 750 ms,
pré-carrega a nova versão e atualiza o hero automaticamente, sem reiniciar o
servidor. Em produção, a troca continua dependendo de um novo deploy.

Os banners usam `background-size: cover`, portanto ainda podem sofrer pequenos
recortes conforme a proporção da tela. No desktop, mantenha o ponto focal entre
45% e 65% da largura. No mobile, priorize a área central e mantenha a região sob
o título visualmente mais calma. Não inclua textos, logotipo ou CTA nas imagens.
