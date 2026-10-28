# Manutenção e validação

## Fluxo de mudança

1. Leia AGENTS, PRODUCT, DESIGN e documentação do assunto.
2. Confira `git status -sb` e diff para preservar trabalho existente.
3. Localize causa, dados, componente e estilos antes de editar.
4. Faça alteração localizada e atualize documentação afetada.
5. Confira comportamento e apresentação nas larguras pertinentes; mudança mobile exige prova mobile.
6. Revise diff final. Commit local e push são ações distintas, executadas quando solicitadas.

Antes de escrever código Next.js, leia o guia pertinente em `node_modules/next/dist/docs/`, conforme AGENTS.

## Testes

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Check combina ESLint, TypeScript sem emissão e unitários Node. Unitários cobrem queries, validação comercial, frete, diagnóstico, HTML, etnias, CTAs, avaliações, variações e seleção de rituais. Não substituem prova visual.

Playwright usa Chrome headless localmente e Chromium no CI, um worker, sem paralelismo e timeout de 60s. Inicia Woo simulado em **4010** e frontend em **3017**, com `.next-e2e` e URLs locais. `reuseExistingServer: false`: portas precisam estar livres. Resultados e traces de falha ficam em diretórios ignorados pelo Git. Rodar build e E2E em sequência: ambos regeneram tipos de rota e uma execução simultânea pode interromper a leitura desses arquivos no Windows.

Há cenários de catálogo, sacola, checkout, galeria, avaliações, frete e resiliência editorial. `ritual-catalog.spec.ts` é skipped sem fixture dedicada:

```powershell
$env:RITUAL_CATALOG_FIXTURE = '1'
npm.cmd run test:e2e -- tests/e2e/ritual-catalog.spec.ts
Remove-Item Env:RITUAL_CATALOG_FIXTURE
```

A variável alimenta também o servidor simulado. Skipped não significa aprovado. E2E não homologa pagamentos reais. Build pode consultar serviços reais; confirme ambiente antes de executá-lo. `npm.cmd run start` serve o build criado.

## Prova visual

Use 1440px desktop, 768px tablet quando pertinente e 390px mobile. Confira overflow, recorte, alinhamento, texto, foco, toque, loading/erro/vazio e estados interativos. Aguarde conteúdo final antes de capturar: loading não prova o layout concluído.

Etnias: compare estado inicial e hover/foco com PRODUCT e ethnicity-colors.ts. CTAs: confira seletor exato, pois verde/laranja coexistem por função. Capture rota, largura e estado em artifacts ou output/playwright, fora do Git.

## Diagnóstico e smoke

| Ferramenta | Uso |
| --- | --- |
| `npm.cmd run check:connection` | Relatório de rede/endpoints |
| `npm.cmd run check:woocommerce` | Consultas administrativas opcionais |
| `npm.cmd run package:wordpress` | ZIP local; não instala no WordPress |
| scripts/smoke-shopping-ux.mjs | Conferência de UX; consultar argumentos/condições |
| scripts/smoke-live-commerce.mjs | Sessão comercial real; consultar flags e limpeza |
| scripts/smoke-live-shipping.mjs | Cotação real com flag `--allow-live-quote`; ver FRETE |

Scripts live não são simulação isolada. Consulte seu código antes de operar loja real. Esta revisão documental não criou pedido nem cobrança.

## Proteções e ajustes da auditoria de 23/10/2026

- `MONTHLY_PRODUCT_SLUG` define manualmente o produto do mês. Vazio mostra a próxima escolha como "Em breve". O destaque não anuncia preço nem desconto automático. Trocas exigem novo deploy.
- As APIs de carrinho, checkout, frete, catálogo auxiliar, newsletter e relatórios CSP têm limite de requisições. Sem Redis, o limite é local ao processo. Em múltiplas instâncias, configure `RATE_LIMIT_REDIS_URL` e `RATE_LIMIT_REDIS_TOKEN` com Redis REST compatível com Upstash. Falha do serviço configurado retorna 503.
- A Vercel usa seu cabeçalho de IP. Em hospedagem própria, `RATE_LIMIT_IP_HEADER` deve nomear um cabeçalho sempre sobrescrito pelo proxy. Nunca confie em um cabeçalho que o visitante possa definir. Sem IP confiável, há limite por sessão e limite anônimo compartilhado.
- CSP bloqueia atributos de script inline e envia violações a `/api/csp-report/`. O coletor aceita corpos limitados e registra somente diretiva e origem bloqueada. A política completa de scripts permanece em Report-Only para preservar ISR e scripts do Next. Revisar os logs antes de promover essa política; nonces exigem renderização dinâmica.
- Checkout copia itens e cupons via Store API `/batch`, em blocos de até 20 operações sequenciais. Requer suporte a esse endpoint na hospedagem WooCommerce. A adição do ritual só troca a sessão após confirmar todos os itens; falha mantém a sacola original.
- Avaliações encaminham à página original do produto no WordPress, onde a autenticação é mantida. O frontend não coleta senhas. A home carrega seções de forma independente e não substitui falhas do catálogo por preços ou avaliações de demonstração.
- Next, sharp e sanitize-html foram atualizados. A auditoria ainda aponta a cadeia de desenvolvimento `braces → micromatch → fast-glob → @next/eslint-plugin-next`, sem versão corrigida de braces disponível na data. Não aplicar downgrade automático do eslint-config-next; acompanhar atualização e repetir `npm audit`.

## Diagnóstico de problemas

| Sintoma | Conferir / ação |
| --- | --- |
| Timeout remoto | check:connection, DNS, firewall e hospedagem; falha não significa catálogo vazio |
| Origem não permitida | URL acessada/configurada, Origin e reinício após env |
| Checkout bloqueado | Origem Woo distinta, sessão, estoque/preços e gateway |
| Sacola indisponível | Cache HIT, exclusões LiteSpeed/CDN e validade da sessão |
| Frete falha | CEP, variação, quantidade, WordPress e AJAX Melhor Envio |
| Asset não aparece | Nome/pasta, existência no slot, estilos computados; produção exige deploy |
| Fonte diferente | Kit Adobe, rede/domínio e fallback |
| E2E não inicia | Portas 3017/4010, Chrome e processos em `.next-e2e` |
| EPERM no Windows | Identificar processo; não apagar diretório em uso; isolar build manual |

Build isolado, se necessário:

```powershell
$env:NEXT_DIST_DIR = '.next-production-qa'
npm.cmd run build
Remove-Item Env:NEXT_DIST_DIR
```

E2E fixa `.next-e2e` no próprio config: variável no terminal não substitui esse valor. Não aplicar npm audit fix automaticamente nem reescrever módulos inteiros para um problema localizado.

## Evidência da revisão atual

Em 28/10/2026, lint/TypeScript e 101 testes unitários passaram. Os 47 cenários E2E passaram, incluindo os dois de Ritual Finder com fixture dedicada. A execução inicial teve falhas de sincronização/seletores nos testes; os cenários afetados foram corrigidos e repetidos. O resumo consolidado está em `artifacts/release-e2e-summary.json`. No Windows, o encerramento dos servidores Playwright precisou ser interrompido após registrar todos os resultados.

O build de produção concluiu 29 páginas pré-geradas. O teste no build com catálogo real confirmou Cidoca a R$ 24–116 em vitrine/PDP/schema, arquivos de temas, compatibilidade de uploads e ausência de erros JavaScript/overflow nos layouts amostrados. Evidências: `artifacts/release-browser-qa.json` e capturas `artifacts/release-*.png`. A auditoria de dependências de produção retornou zero vulnerabilidades (`artifacts/release-npm-audit.json`).

A variação Cidoca 10 g também foi adicionada a uma sacola nova para conferir o valor real: preço e total de R$ 24,00, iguais ao anúncio. O item foi removido e a sacola vazia foi confirmada; nenhum checkout, pedido ou pagamento foi iniciado nesse teste. Evidência: `artifacts/release-live-price-check.json`.

A comparação sequencial com o inventário público verificou 338 URLs: 333 páginas responderam corretamente e duas tiveram os redirecionamentos esperados de conta/checkout. As três ausências correspondem somente aos artigos de demonstração já excluídos pelos IDs 10184, 500 e 492. Nenhum caminho comercial do inventário ficou ausente. Inclui 137 produtos, 30 categorias de produtos e 121 arquivos de temas; há caminhos compartilhados entre grupos. Relatório: `artifacts/release-slug-audit.json` e `.md`. Isso não representa todos os URLs históricos do Search Console nem paridade de cada campo Rank Math. Respostas de erro em páginas transmitidas progressivamente podem retornar HTTP 200 com conteúdo de erro/noindex; a auditoria confere também o corpo, sem tratar todo 200 como página válida.

`artifacts/release-check.json` registra os bloqueios externos. O subdomínio checkout responde, mas WordPress ainda informa a origem antiga e redireciona checkout vazio a ela; revalidação remota está desativada e Redis não foi configurado. Nenhum deploy, DNS, pedido ou pagamento foi realizado nesta preparação. E2E usa WooCommerce simulado e não homologa liquidação financeira. O workflow de CI foi preparado localmente, mas ainda não executado no GitHub.

## Evidência da revisão documental anterior

Em 06/10/2026 foram lidos código/contratos e amostradas home, Aprenda e Primeiro Rapé em 1440/390px. Verificação documental inclui links, rotas, scripts, sidecar JSON e correspondência de tokens. Resultados antigos de check/build/E2E não são apresentados como executados nesta revisão.
