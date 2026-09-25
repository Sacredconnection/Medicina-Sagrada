# Fundos da seção de incensos

Coloque nesta pasta os dois fundos finais da seção de incensos usando
exatamente estes nomes:

- `medicina-sagrada-incensos-background-desktop.webp`
- `medicina-sagrada-incensos-background-mobile.webp`

## Desktop

- Dimensão recomendada: **2400 × 900 px**.
- Proporção: **8:3**, horizontal.
- Formato: **WebP sRGB**.
- Peso recomendado: **até 450 KB**.
- Área segura: mantenha elementos importantes dentro dos **70% centrais**.
- Composição: deixe a região do texto à esquerda e o centro dos três círculos
  com baixo contraste e poucos detalhes.

## Mobile

- Dimensão recomendada: **900 × 1800 px**.
- Proporção: **1:2**, vertical.
- Formato: **WebP sRGB**.
- Peso recomendado: **até 400 KB**.
- Área segura: mantenha elementos importantes dentro dos **70% centrais**.
- Composição: preserve áreas calmas no topo para o título e o texto e na base
  para o CTA. Concentre a imagem principal na faixa central livre entre esses
  dois blocos.

## Aplicação

O CSS já referencia esses arquivos e troca automaticamente para a versão
mobile em telas de até 600 px. A imagem usa `background-size: cover` e
`background-position: center`, ficando acima da cor creme `--paper-deep`.

No mobile, a seção mantém uma proporção vertical próxima ao arquivo de
**900 × 1800 px**. O texto fica no topo, o CTA na base e a área central fica
reservada para a imagem principal do WebP.

Se um arquivo ainda não estiver presente, a seção continua exibindo apenas o
fundo creme.
