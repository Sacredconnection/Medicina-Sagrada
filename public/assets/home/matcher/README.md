# Imagens do Ritual Finder

## Fundo da seção de entrada

Adicione as imagens que ficarão sobre o verde do painel “A Medicina ideal para
sua intenção.” usando os nomes exatos:

- Desktop: `medicina-sagrada-ritual-finder-intro-background.webp`
- Mobile: `medicina-sagrada-ritual-finder-intro-background-mobile.webp`

Especificação recomendada para desktop: **2880 × 1216 px**. Para mobile, use
**750 × 992 px**. Exporte ambas em WebP, sRGB, preferencialmente até **700 KB**
cada. Não inclua textos, botões ou logotipos dentro das imagens. Preserve áreas
livres para o título, a descrição e o botão.

As imagens ocupam a seção inteira, sem card. A seção aplica uma camada verde escura
sobre a imagem para preservar a identidade
visual e a leitura dos textos. Como o arquivo será recortado com
`background-size: cover`, deixe margem segura ao redor do assunto principal.
No mobile, o CSS prioriza o arquivo terminado em `-mobile.webp`; se ele estiver
temporariamente indisponível, a versão desktop permanece como fallback. Em
desenvolvimento, salvar por cima de qualquer um dos arquivos atualiza a imagem
visível automaticamente, sem recarregar a página ou reiniciar o servidor.

## Círculos de intenção da abertura

Os cinco slots circulares acima do texto usam arquivos separados dos cards
verticais. Coloque as imagens em `intro-intentions/` seguindo o contrato descrito
no README dessa pasta.

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
