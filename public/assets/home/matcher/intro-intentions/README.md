# Círculos de intenção da abertura

A abertura apresenta oito círculos. Quatro fotos continuam nesta pasta.
Os outros quatro usam diretamente os arquivos de `public/assets/intentions/`:
`foco-e-clareza.webp`, `energia-e-renovacao.webp`, `oracao-e-cerimonia.webp`
e `limpeza-e-refrescancia.webp`. As substituições desses arquivos também atualizam
os círculos, sem exigir cópias adicionais. Limpeza e refrescância também usa o
mesmo arquivo nos cards da jornada, substituindo a antiga fogueira.

Coloque nesta pasta as quatro imagens quadradas abaixo, mantendo exatamente estes
nomes:

- `aterramento-presenca.webp`
- `forca-coragem.webp`
- `silencio-mental-paz.webp`
- `abertura-coracao.webp`

## Especificação

- Dimensão: **512 × 512 px**
- Formato: **WebP**
- Perfil de cor: **sRGB**
- Peso recomendado: até **100 KB** por arquivo
- Composição: assunto principal centralizado, com 12% a 15% de margem segura

Não inclua o recorte circular nem o traço branco dentro da imagem. O site aplica
o círculo e a borda automaticamente com CSS.

No ambiente local de desenvolvimento, os arquivos são verificados a cada 750 ms.
Assim que uma imagem for adicionada ou substituída com o nome correto, o círculo
correspondente será atualizado sem recarregar a página nem reiniciar o servidor.
No site publicado, a substituição exige um novo deploy.
