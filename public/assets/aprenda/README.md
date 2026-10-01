# Imagens da página Aprenda

Coloque os arquivos WebP nas pastas abaixo, mantendo os nomes exatos. Os espaços já estão dimensionados; enquanto os arquivos não existem, ficam vazios, sem ícones, textos de placeholder ou imagens quebradas. No desenvolvimento, atualize a página após adicionar um arquivo. Em produção, os assets entram no próximo build/deploy.

## Banners (`banners/`)

| Arquivo | Referência de tamanho | Composição |
| --- | --- | --- |
| primeiros-passos-desktop.webp | 2752 × 1536 px | Fundo da seção dos três guias; não colocar texto na arte. |
| primeiros-passos-mobile.webp | 1200 × 4000 px | Fundo vertical; área superior de 192 px na tela reservada antes dos cards. |
| continue-aprendendo-desktop.webp | 1717 × 916 px | Imagem à direita, área livre à esquerda para título, texto e botão. |
| continue-aprendendo-mobile.webp | 900 × 1200 px | Texto acima, imagem abaixo. |

Os tamanhos são os dos assets originais do Haux. A página usa recorte responsivo; o texto e os botões são HTML.

## Povos (`povos/`)

Formato de referência: **512 × 768 px** (2:3). A imagem ocupa uma faixa de 112 px à esquerda de cada entrada. Nomes:

- apurina.webp
- caboclo.webp
- huni-kuin.webp
- katukina.webp
- kuntanawa.webp
- nukini.webp
- puyanawa.webp
- shanenawa.webp
- shawadawa.webp
- yawanawa.webp

## Guias (`guias/`)

Cada uma destas pastas recebe **passo-01.webp**, **passo-02.webp** e **passo-03.webp**:

- primeiro-rape/
- escolher-aplicador/
- preparar-com-cuidado/

Referência: **1200 × 800 px**. No desktop, o slot ocupa 38% da largura do card, acompanhando a altura do texto. No celular, o recorte é 16:9. Mantenha o assunto principal próximo do centro.

## Produtos (`produtos/`)

Os cards continuam consultando produtos, preços e links do catálogo. Nesta superfície, as fotos só aparecem quando existe o arquivo **SLUG-DO-PRODUTO.webp** nesta pasta. Exemplo: `rape-apurina-awiry.webp` para um produto cujo endereço termina em `/product/rape-apurina-awiry/`. Use o slug real indicado no link de cada card. Referência: **900 × 900 px**.

Essa regra só se aplica a Aprenda; as imagens do restante da loja permanecem como estão.

## Tipografia

Aprenda usa Proxima Nova pelo sistema Adobe Fonts do projeto. Os arquivos Open Sans em `fonts/` são da referência original e não são carregados pelas páginas.

O código de leitura dos slots está em `components/learn-image-slot.tsx`. Os arquivos antes reaproveitados de Haux em `public/assets/learn/` não são mais usados nestas páginas.
