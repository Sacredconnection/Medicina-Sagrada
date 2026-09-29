# Fotos dos produtos do Ritual Finder

Fotos reais do catálogo, armazenadas localmente para que a recomendação não
dependa do servidor WordPress para exibir a imagem.

- Formato: JPEG, até 600 px de largura.
- Arquivo: `<slug-do-produto>.jpg`.
- `manifest.json`: relaciona cada slug ao arquivo local e à URL original.
- `variations.json`: relaciona os IDs reais dos cinco modelos de aplicador às
  suas fotos específicas. Arquivos `variation-<id>.jpg`, JPEG de 600 × 600 px.
  A seleção troca a foto imediatamente, independentemente da consulta de preço.
- Uso: `components/product-matcher.tsx`, apenas quando a URL da foto do produto
  corresponde à origem registrada. Fotos específicas de variações são preservadas.
- Origem: imagens públicas do próprio catálogo, recuperadas em 2026-09-29
  pelo cache de imagens do WordPress (`i0.wp.com`).

Para substituir uma foto, atualize o JPEG e a origem correspondente no manifesto.
Este diretório não contém preços nem dados de estoque; esses dados vêm do WooCommerce.
