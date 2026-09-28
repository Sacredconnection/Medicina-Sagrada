# Organização de assets

Esta pasta recebe somente arquivos finais usados pelo site. Arquivos editáveis
de produção, como PSD, AI, INDD e TIFF, devem permanecer fora de `public` para
não aumentar o deploy.

## Estrutura

- `logo/`: marcas e assinaturas visuais.
- `home/hero/`: banners desktop e mobile da página inicial.
- `home/categories/`: imagens circulares das categorias.
- `home/matcher/`: fundos e imagens do Ritual Finder.
- `home/incense/background/`: fundos da seção de incensos.
- `home/applicators/`: imagens e fundos da seção de aplicadores.
- `home/kits/`: imagens e fundos da seção de kits.
- `home/story/pillars/`: imagens dos pilares institucionais.

## Padrão de nomes

Use letras minúsculas, palavras separadas por hífen e sem acentos:

`medicina-sagrada-[pagina]-[secao]-[descricao].[formato]`

Exemplo: `medicina-sagrada-home-hero.webp`.

## Formatos

- Fotografias e banners: WebP em sRGB.
- Transparência fotográfica: WebP com alpha.
- Logos e ícones vetoriais: SVG otimizado.
- PNG: somente quando o WebP não atender ao uso técnico.
- Evitar JPG, GIF e arquivos editáveis dentro de `public`.

Ao substituir um asset, mantenha exatamente o nome recomendado. Assim o código
continua funcionando sem criar versões como `final`, `final-2` ou `novo`.
