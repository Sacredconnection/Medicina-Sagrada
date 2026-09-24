# Medicina Sagrada — frontend headless

## Ambiente integrado

Vitrine Next.js conectada ao catálogo real, com sacola persistente, seleção de
variações, quantidades, cupons e transferência para o checkout WooCommerce com
o Pagar.me já configurado. Os dados de cartão ficam no checkout existente.

```bash
npm ci
npm run setup
npm run dev
```

Requer Node 22.18+; validado com Node 24. `npm run setup` cria `.env.local` sem
sobrescrever configurações existentes. A porta é indicada no terminal.
Abrir `/cart/` para a sacola e `/diagnostico-api/` para conferir conexões.

Veja [a configuração e a homologação do pagamento](docs/PAGAMENTOS.md).
O complemento em `wordpress/medicina-sagrada-headless/` está pronto para instalar
na homologação. A ativação no WordPress, ajuste do LiteSpeed e testes de cobranças
Pagar.me ainda precisam ser concluídos antes de publicar para clientes.

Validações: `npm run check`, `npm run test:e2e` (Chrome instalado) e `npm run build`.
Os testes de navegador usam WooCommerce simulado e nunca enviam pagamentos reais.

Fundação do novo frontend da Medicina Sagrada, preparada para consumir o
WordPress e o WooCommerce existentes sem alterar as URLs públicas que já
acumulam autoridade orgânica.

## Decisões de arquitetura

- Next.js App Router, TypeScript e Server Components.
- Renderização no servidor com ISR; o conteúdo principal e os metadados chegam
  no HTML inicial, mesmo sem JavaScript no navegador.
- WordPress REST API para páginas, posts e categorias editoriais.
- WooCommerce Store API para catálogo, categorias e dados públicos de produto.
- `trailingSlash: true` para manter a forma atual das URLs.
- Metadados canônicos por página, Open Graph, Twitter Cards, `robots.txt`,
  sitemap dinâmico e JSON-LD.
- Webhook autenticado para revalidar conteúdo após uma publicação no WordPress.
- Sanitização no servidor para o HTML editorial vindo do CMS.

## Compatibilidade de URL

| Conteúdo atual | Rota headless |
| --- | --- |
| Home | `/` |
| Produto | `/product/{slug}/` |
| Categoria de produto | `/product-category/{pai}/{slug}/` |
| Paginação de produto | `/product-category/{slug}/page/{n}/` |
| Página WordPress | `/{slug}/` ou `/{pai}/{slug}/` |
| Post WordPress | `/{slug}/` |
| Categoria de posts | `/category/{slug}/` |

A rota curinga valida o `link` retornado pelo WordPress antes de renderizar.
Assim, um slug igual em outra hierarquia não cria conteúdo duplicado.

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Ajuste as origens do frontend e do WordPress.
3. Instale as dependências com `npm install`.
4. Rode `npm run dev`.

As credenciais reais devem ficar apenas em `.env.local`, que não é versionado.
O arquivo `.env.example` contém somente nomes e placeholders.

Para conferir a leitura do conteúdo, abra `/diagnostico-api/`. A página faz uma
requisição server-side ao WordPress e à Store API, exibe uma amostra segura e
tem `noindex`. A mesma verificação em JSON fica em `/api/diagnostico/`.

Validações:

```bash
npm run lint
npm run typecheck
npm run build
```

## Separação de domínio no corte

Hoje WordPress e frontend respondem em `https://medicinasagrada.com.br`. Antes
de apontar esse domínio para o Next.js, o WordPress precisa continuar acessível
em outra origem, por exemplo `https://cms.medicinasagrada.com.br`.

No corte:

```dotenv
NEXT_PUBLIC_SITE_URL=https://medicinasagrada.com.br
WORDPRESS_SITE_URL=https://cms.medicinasagrada.com.br
WORDPRESS_API_URL=https://cms.medicinasagrada.com.br/wp-json
WOOCOMMERCE_STORE_API_URL=https://cms.medicinasagrada.com.br/wp-json/wc/store/v1
```

As URLs canônicas e do sitemap continuarão no domínio público. URLs de imagens
podem permanecer na origem do CMS, desde que ela seja pública e esteja
configurada em `next.config.ts`.

## Revalidação pelo WordPress

Envie `POST /api/revalidate/` com:

```http
Authorization: Bearer SEU_REVALIDATION_SECRET
Content-Type: application/json
```

E um dos corpos:

```json
{ "type": "product", "slug": "yawanawa-tsunu" }
```

```json
{ "path": "/sobre-nos/" }
```

O endpoint revalida a rota, o sitemap e as tags de cache. O plugin do WordPress
que disparará esse webhook deve ser adicionado na etapa de integração.

## Checklist obrigatório antes da troca de DNS

- Exportar todas as URLs dos sitemaps atuais e compará-las com o sitemap
  headless.
- Rastrear o ambiente de homologação e corrigir toda resposta diferente de
  `200`, além de canonicals divergentes.
- Preservar slugs; para qualquer URL alterada, criar um redirecionamento `301`
  individual, nunca uma regra genérica para a home.
- Migrar os títulos e descrições personalizados do Rank Math. O endpoint
  público atual não expõe `rankmath/v1/getHead`; será necessário expor esses
  campos via REST ou por um pequeno plugin próprio antes do corte.
- Validar `Product`, `BreadcrumbList`, `Organization`, `WebSite` e `Article` no
  Rich Results Test.
- Confirmar que previews e homologação continuam com `noindex`; somente o
  domínio canônico de produção é liberado no `robots.txt`.
- Conservar Search Console, Google Analytics, Merchant Center e pixels, sem
  duplicar tags.
- Manter o WordPress antigo disponível para rollback durante a estabilização.
- Medir Core Web Vitals em templates de home, categoria, produto e artigo.
- Depois do corte, enviar o sitemap e acompanhar indexação, 404, soft 404,
  canonicals e queda de impressões diariamente.

## Pontos que ainda exigem homologação

A estrutura lê conteúdo real e entrega páginas indexáveis. A sacola, variações
e transferência para checkout estão implementadas; conta e histórico usam o
WooCommerce. A aprovação/recusa e os retornos de Pix, cartão e boleto ainda
dependem de homologação no Pagar.me. O complemento WordPress deve ser instalado
para concluir a sincronização da sacola e a revalidação do catálogo.

Filtros avançados, compra conjunta no curador de rituais, menus administráveis,
campos SEO Rank Math e componentes específicos de shortcodes/Elementor permanecem
como etapas próprias. A migração do domínio depende também do checklist SEO acima.

## Troca de materiais visuais da home

A composição visual da nova home está separada do conteúdo estrutural. Os
materiais provisórios ficam centralizados em `lib/home-content.ts`:

- `homeAssets.hero.image`: imagem principal do hero;
- `homeAssets.story.image`: imagem da seção institucional;
- `homeAssets.categories`: imagens dos cards de categorias;
- `homeAssets.editorial`: imagens dos banners editoriais;
- `demoProducts`: fallback visual usado enquanto a Store API não estiver
  respondendo no ambiente de desenvolvimento.

Quando novos materiais forem produzidos, basta substituir as URLs nesse
arquivo. A proporção recomendada é 16:9 ou 3:2 para hero e banners, 1:1 para
categorias e produtos. Os componentes já aplicam `cover`, lazy loading e
comportamento responsivo sem exigir mudança na estrutura da página.
