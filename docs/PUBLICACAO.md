# Homologação e publicação

## Situação

O repo contém vitrine, compra, transferência de sessão, frete estimado, avaliações, conteúdo, SEO e complemento PHP. Instalação/ativação remota, cache, webhooks e pagamentos devem ser verificados em homologação. Registros antigos em PAGAMENTOS/FRETE são históricos. Esta revisão não publicou o site nem alterou WordPress, DNS ou gateway.

## Origens

Antes de apontar o domínio público ao Next.js, mantenha WordPress/Woo numa origem HTTPS própria. Exemplo proposto, sem confirmação de subdomínio provisionado:

```dotenv
NEXT_PUBLIC_SITE_URL=https://medicinasagrada.com.br
WORDPRESS_SITE_URL=https://cms.medicinasagrada.com.br
WORDPRESS_API_URL=https://cms.medicinasagrada.com.br/wp-json
WOOCOMMERCE_STORE_API_URL=https://cms.medicinasagrada.com.br/wp-json/wc/store/v1
WOOCOMMERCE_CHECKOUT_URL=https://cms.medicinasagrada.com.br/checkout/
WOOCOMMERCE_ACCOUNT_URL=https://cms.medicinasagrada.com.br/account/
```

Checkout na origem do frontend é bloqueado. Configure env do deploy, segredos iguais, origem de imagens e URLs hardcoded em conteúdo local. Confira Adobe Fonts e endereços de retorno/webhook do gateway instalado. Use o endpoint informado pela versão do plugin Pagar.me, sem inventar uma URL.

## Sequência

1. Preparar cópia de homologação, backup WordPress/banco e destinos HTTPS.
2. Conferir conectividade/autenticação sem expor segredos.
3. Empacotar plugin, instalar/ativar e confirmar status. Alinhar MS_HEADLESS_URL e MS_REVALIDATION_SECRET do WordPress com frontend e REVALIDATION_SECRET.
4. Excluir do cache `/cart/`, `/checkout/`, `/account/`, `/wp-json/wc/store/`, `?session=` e sessões Woo; purgar cache REST antigo. PHP não corrige uma resposta já devolvida pelo cache do servidor.
5. Homologar compra/pagamento com ambiente e credenciais de teste apropriados, sem colocar a loja de produção em modo teste.
6. Executar check/E2E/build e prova visual dos templates. Medir performance.
7. Comparar URLs/metadados/schemas com site existente e concluir critérios SEO.
8. Publicar após liberar critérios e registrar versão, ambiente e rollback.

## Compra e webhook

Use checklists de [Pagamentos](PAGAMENTOS.md) e [Frete](FRETE.md): simples/variável, estoque, quantidades, cupons, voltar do checkout e alterar sacola, cliente logado, frete, aprovação/recusa, Pix, boleto, callbacks, e-mails, estorno e limpeza da sacola. Reentrega de webhook não pode duplicar cobrança/pedido/estoque.

Gateway identificado não prova liquidação ou webhook. E2E é fixture. Configurar segredo não prova entrega: WordPress precisa alcançar frontend público; localhost não funciona entre servidores externos.

## SEO

- Exportar sitemaps antigos e comparar URLs headless.
- Preservar slugs/hierarquia; mudança recebe 301 individual, sem regra genérica à home.
- Conferir HTTP, canonical, título, descrição, imagens e paginação.
- Migrar campos Rank Math: uso atual de título/excerpt/dados públicos não garante paridade com o plugin.
- Validar Product, BreadcrumbList, Organization, WebSite e Article antes de liberar.
- Conservar Search Console, analytics, Merchant Center e pixels sem duplicação.
- Proteger preview/homologação; robots sozinho não garante noindex de página já conhecida.

robots.ts libera crawl somente com NODE_ENV production e siteUrl exatamente `https://medicinasagrada.com.br`; nos demais ambientes bloqueia `/`. Exclui APIs/sacola/checkout/conta/diagnóstico. Metadata geral não aplica noindex universal aos previews: conferir proteção do provedor. Sitemap usa origem pública configurada.

## Pendências

Requisitos legais, idade, saúde, consentimento, territórios de venda, representação comunitária e atribuição por produto continuam abertos em PRODUCT. Documentação técnica não resolve essas decisões. Menu administrável, paridade SEO e suporte a todos os blocos/shortcodes CMS também não estão garantidos.

## Rollback e acompanhamento

Guarde versão/build anterior, env e mapa DNS, mantenha WordPress antigo acessível e responsável pelo retorno. Em falha crítica, restaure destino/versão conhecida e confira checkout/sessão. Preserve pedidos criados durante o corte: Woo é o registro de pedidos e pagamentos.

Após publicação, acompanhe APIs, webhook, sacola/checkout, erros, 404/soft 404, canonicals, indexação e Core Web Vitals. Envie sitemap após confirmar estabilidade. Este documento orienta operação e não registra deploy concluído.
