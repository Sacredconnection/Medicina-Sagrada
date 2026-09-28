# Banners de kits da página inicial

- Dimensão: 1600 x 1600 px
- Proporção: 1:1
- Formato: WebP, sRGB
- Peso recomendado: até 400 KB por imagem

Arquivos finais:

- `medicina-sagrada-kit-4-elementos.webp`
- `medicina-sagrada-kit-10-tribos.webp`
- `medicina-sagrada-kit-forca-amazonica.webp`

Não aplique título, botão ou chamada na arte. O nome do kit e a ação são
inseridos em HTML sobre a imagem para manter legibilidade, acessibilidade e
responsividade.

O banner de 4 Elementos já usa o WebP local. Os banners de 10 Tribos e Força
Amazônica usam provisoriamente imagens do WordPress. Quando os dois WebPs
finais estiverem prontos, salve-os com os nomes acima e atualize as entradas
`tenTribes` e `amazonianStrength` em `lib/home-content.ts` para os caminhos
locais. Se o WooCommerce fornecer a foto do produto, ela permanece como
fallback visual desses cards.
