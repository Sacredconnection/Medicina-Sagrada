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

Playwright usa Chrome headless, um worker, sem paralelismo e timeout de 60s. Inicia Woo simulado em **4010** e frontend em **3017**, com `.next-e2e` e URLs locais. `reuseExistingServer: false`: portas precisam estar livres. Resultados e traces de falha ficam em diretórios ignorados pelo Git.

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

## Problemas comuns

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

## Evidência da revisão documental

Em 06/10/2026 foram lidos código/contratos e amostradas home, Aprenda e Primeiro Rapé em 1440/390px. Verificação documental inclui links, rotas, scripts, sidecar JSON e correspondência de tokens. Resultados antigos de check/build/E2E não são apresentados como executados nesta revisão.
