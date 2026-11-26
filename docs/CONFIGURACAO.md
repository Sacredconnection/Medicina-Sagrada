# Configuração e ambiente

## Preparação local

Na raiz, com Node.js 22.18+:

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd run dev
```

Use a porta do terminal. Se mudar a porta, alinhe `NEXT_PUBLIC_SITE_URL` em `.env.local` e reinicie. O setup preserva o arquivo existente; não completa variáveis ausentes num arquivo já criado.

## Variáveis

| Nome | Uso / padrão |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origem pública/canônica do frontend; template local `http://localhost:3000` |
| `WORDPRESS_SITE_URL` | Origem WordPress; padrão `https://medicinasagrada.com.br` |
| `WORDPRESS_API_URL` | Base REST `/wp-json`; padrão do domínio atual |
| `WOOCOMMERCE_STORE_API_URL` | Base `/wp-json/wc/store/v1`; sem valor, derivada de `WORDPRESS_API_URL` |
| `WOOCOMMERCE_CHECKOUT_URL` | Checkout; sem valor, `WORDPRESS_SITE_URL` + `/checkout/` |
| `WOOCOMMERCE_ACCOUNT_URL` | Conta; sem valor, `WORDPRESS_SITE_URL` + `/account/` |
| `REVALIDATION_SECRET` | Segredo compartilhado; setup gera 32 bytes aleatórios em hex |
| `CONTENT_REVALIDATE_SECONDS` | Inteiro positivo para consultas públicas; fallback 900 |
| `WORDPRESS_CONSUMER_KEY` / `WORDPRESS_CONSUMER_SECRET` | Opcionais: diagnóstico administrativo WooCommerce |
| `WP_USER` / `WP_PASSWORD` | Opcionais: diagnóstico WordPress; senha de aplicação |
| `NEXT_DIST_DIR` | Diretório alternativo de build; padrão `.next` |
| `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` | Fallbacks fornecidos pela Vercel quando não há URL explícita |
| `RITUAL_CATALOG_FIXTURE` | Ativa cenários E2E dedicados ao catálogo do Ritual Finder |
| `MONTHLY_PRODUCT_SLUG` | Produto escolhido para o mês; vazio mostra "Em breve", sem preço nem desconto |
| `MAILCHIMP_API_KEY` / `MAILCHIMP_AUDIENCE_ID` | Ativam a newsletter; somente servidor; ver [Newsletter](NEWSLETTER.md) |
| `MAILCHIMP_SERVER_PREFIX` | Opcional, como `us21`; fallback: sufixo da chave |
| `RATE_LIMIT_REDIS_URL` / `RATE_LIMIT_REDIS_TOKEN` | Redis REST para limites compartilhados entre instâncias; sem ambos, limites locais |
| `RATE_LIMIT_IP_HEADER` | Fora da Vercel, cabeçalho de IP sobrescrito pelo proxy confiável |

`NODE_ENV` é gerenciado pelo ambiente Next/Node; diagnósticos exigem `development`. O código normaliza `/my-account/` para `/account/` quando a URL corresponde é origem WordPress, por compatibilidade desta loja.

`WORDPRESS_API_URL`, quando ausente, é derivada de `WORDPRESS_SITE_URL` + `/wp-json`. Valores explícitos têm prioridade: na migração, confira todas as URLs. Checkout de origem igual à do frontend é rejeitado. O modelo para `checkout.medicinasagrada.com.br` está em `deploy/production.env.example`; siga [Publicação](PUBLICACAO.md).

Segredos ficam em `.env.local` ou no painel de deploy. Não prefixar chaves, senhas ou segredo com `NEXT_PUBLIC_`. Credenciais Pagar.me e Melhor Envio ficam no WordPress.

## Scripts

| Comando | Resultado |
| --- | --- |
| `npm.cmd run dev` | Desenvolvimento Next |
| `npm.cmd run build` | Build de produção |
| `npm.cmd run start` | Serve build já criado |
| `npm.cmd run setup` | Cria configuração sem sobrescrever |
| `npm.cmd run lint` | ESLint |
| `npm.cmd run typecheck` | TypeScript sem emitir arquivos |
| `npm.cmd test` | Unitários Node |
| `npm.cmd run check` | Lint + tipos + unitários |
| `npm.cmd run test:e2e` | Playwright e fixture local |
| `npm.cmd run check:connection` | DNS/TCP/endpoints e relatório local |
| `npm.cmd run check:woocommerce` | Diagnóstico administrativo opcional |
| `npm.cmd run package:wordpress` | ZIP PHP em `artifacts/` |
| `npm.cmd run prepare:release` | Ambiente e snippet privados, sem alterar ambiente local |
| `npm.cmd run check:release` | Configuração; `--online` verifica serviços remotos |

## Diagnóstico

Em desenvolvimento: `/diagnostico-api/`, `/api/diagnostico/` e `/api/commerce-status/`. Campos comerciais `null` indicam estado remoto não verificado. HTTP 200 isolado não confirma sessão válida: formato, token e sinais de cache são inspecionados.

Para falhas, rode `npm.cmd run check:connection` e consulte [Conexão](CONEXAO-HOSPEDAGEM.md). Não compartilhar segredos, cookies, senha de cliente nem URL com `session`.

## Imagens e fonte

`next.config.ts` permite imagens locais `/assets/**`, uploads da origem WordPress e uploads dos domínios legados da loja. AVIF/WebP e qualidades 75/90 estão configurados. Respostas CMS normalizam mídias para a origem WordPress configurada e links editoriais para caminhos locais. URLs antigas de uploads recebem encaminhamento restrito a `/wp-content/uploads/`, preservando arquivos indexados e referências locais de fallback.

Proxima Nova vem de `https://use.typekit.net/vjh7vll.css`, por Adobe Fonts, com fallback de sistema. Verifique kit e autorização de domínio antes de publicar; não é carregada via `next/font`.
