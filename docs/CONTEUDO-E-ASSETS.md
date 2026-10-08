# Conteúdo e assets

## Fontes

| Conteúdo | Fonte principal |
| --- | --- |
| Produtos, preços, estoque, variações | WooCommerce Store API |
| Páginas, posts, categorias e mídia | WordPress REST API |
| Home e seleções locais | app/page.tsx, lib/home-content.ts, componentes home-* |
| Navegação | components/header-navigation.tsx, Header e Footer |
| Guias e povos | lib/learn-content.ts |
| CTAs editoriais | lib/article-cta.ts |
| Ritual Finder | lib/rituals-data.ts, ritual-recommendation.ts, ritual-product-selection.ts |
| Cores/aliases de etnias | lib/ethnicity-colors.ts e PRODUCT.md |
| Banners de etnias | lib/ethnicity-banner-assets.ts e contrato local |

Parte da apresentação institucional é local, mesmo quando a rota depende de página CMS. Editar WordPress não altera todo texto da interface. O menu não é administrável pelo CMS nesta implementação.

## Limites editoriais

PRODUCT confirma origem autêntica de rapés/aplicadores e registra decisões abertas sobre atribuição por produto, fornecimento, apoio e requisitos legais/de saúde. Preserve nomes, português e textos aprovados. Não invente efeitos, produtor, quantidade de povos ou simbolismo cultural das cores. Caboclo é descrito como identidade regional ampla, não uma única nação indígena.

HTML passa por `lib/html.ts`, com sanitização e preparação de artigos e mídia/shortcodes conhecidos. Isso não garante reprodução completa de Elementor ou de qualquer plugin. Confira artigo renderizado ao alterar essas regras.

## Arquivos finais e contratos

[Contrato geral](../public/assets/README.md): somente finais em public/assets; editáveis PSD/AI/INDD/TIFF fora de public. Fotografias preferencialmente WebP sRGB, vetores SVG, nomes minúsculos com hífens e sem acentos. Preserve nomes canônicos. Não converter/renomear indiscriminadamente arquivos atuais de outros formatos.

| Superfície | Contrato |
| --- | --- |
| Marca | [Logo](../public/assets/logo/README.md) |
| Hero | [Banners](../public/assets/home/hero/README.md) |
| Categorias | [Imagens](../public/assets/home/categories/README.md) |
| Ritual Finder | [Matcher](../public/assets/home/matcher/README.md), [intenções](../public/assets/home/matcher/intro-intentions/README.md), [produtos](../public/assets/home/matcher/products/README.md) |
| Aplicadores | [Imagens](../public/assets/home/applicators/README.md), [fundos](../public/assets/home/applicators/background/README.md) |
| Kits | [Imagens](../public/assets/home/kits/README.md), [fundos](../public/assets/home/kits/background/README.md) |
| Incensos | [Fundos](../public/assets/home/incense/background/README.md) |
| Artesanato | [Imagens](../public/assets/home/crafts/README.md) |
| História | [Pilares](../public/assets/home/story/pillars/README.md) |
| Conexão ancestral | [Imagens](../public/assets/home/conexao-ancestral/README.md) |
| Newsletter | [Fundo transparente desktop](../public/assets/home/newsletter/background/README.md) |
| Etnias | [Cabeçalhos](../public/assets/ethnicity-headers/README.md) |
| Aprenda | [Contrato completo](../public/assets/aprenda/README.md) |
| Parceiros | [Marcas](../public/assets/partners/README.md) |
| PDFs | [Arquivos](../public/files/README.md), [catálogos](../public/files/catalogs/README.md), [guias](../public/files/guides/README.md), [legais](../public/files/legal/README.md) |

## Aprenda atual

Índice e três guias são locais. LearnImageSlot renderiza somente arquivos existentes no caminho canônico; ausência mantém espaço sem placeholder nem reaproveitamento automático de Haux. Produtos nessa superfície dependem da foto local por slug, mesmo com preço/link do catálogo.

Glossário usa cards estáticos com imagem, nome, resumo, contexto e link. Não há painel expansível. Grade: uma coluna abaixo de 640px, duas a partir de 640px e três a partir de 1024px. Borda, divisor e ação usam acento canônico; nome usa person-foreground preto/branco conforme PRODUCT.

Guias têm checklist antes dos passos; passos usam uma coluna no mobile e três a partir de 1024px. Declarações finais de aprenda.css prevalecem sobre regras anteriores. Primeiro Rapé tem recortes próprios nos passos 2/3.

[DESIGN local antigo](../app/aprenda/DESIGN.md) permanece preservado: expansores, faixas laterais e alguns valores tipográficos estão desatualizados. README de assets mantém referências antigas de recorte de povos/passos. Dimensões ali são referência de produção; confira recorte atual no CSS e navegador. Esta revisão não substituiu esses arquivos de referência.

## Caminhos de Aprenda

- Povos: public/assets/aprenda/povos/{slug}.webp.
- Passos: public/assets/aprenda/guias/{guia}/passo-01.webp até passo-03.webp.
- Produtos: public/assets/aprenda/produtos/{slug-real}.webp.
- Primeiro Rapé: banners/continue-aprendendo-foto.webp.
- Aplicadores: banners/escolher-aplicador-foto.webp.
- Preparar com cuidado: banners/preparar-com-cuidado-foto.webp.

Referência dos banners finais: 1600 × 1200 (4:3); passos 1200 × 800; produtos 900 × 900. Isso não afirma dimensões dos arquivos atuais. Foto de incensos é registrada no contrato como 1200 × 1200. Alinhe alt com a foto ao substituir.

## Substituir material

1. Localize superfície, caminho referenciado e README.
2. Exporte final no formato/perfil/proporção previstos, com nome exato.
3. Substitua, confira dimensões reais e alt.
4. Recarregue desenvolvimento e confira desktop/mobile e estados pertinentes.
5. Assets locais em produção exigem novo build/deploy.

A home centraliza caminhos em home-content.ts, mas também há referências nos componentes e CSS. Fallback visual da home não certifica estoque nem compra disponível; dados comerciais continuam vindo do WooCommerce.
