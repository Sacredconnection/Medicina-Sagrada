# Organização de assets

Esta pasta recebe somente arquivos finais usados pelo site. Arquivos editáveis
de produção, como PSD, AI, INDD e TIFF, devem permanecer fora de `public` para
não aumentar o deploy.

## Estrutura

- `logo/`: marcas e assinaturas visuais.
- `home/hero/`: banner principal da página inicial.
- `home/categories/`: imagens circulares das categorias.
- `home/editorial/`: banners editoriais da página inicial.
- `home/story/`: imagem da seção institucional da página inicial.
- `catalog/products/`: imagens locais de fallback do catálogo.
- `pages/`: imagens exclusivas de páginas internas, separadas por slug.
- `ui/icons/`: ícones vetoriais da interface.
- `placeholders/`: imagens usadas quando o conteúdo não possui mídia.

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
