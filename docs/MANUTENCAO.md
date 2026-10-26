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

## Evidência da revisão atual

Atualização de marca em **26/10/2026**: verde principal `#1a4020` e laranja
principal `#ef4929`. Tokens, logo, favicon, barra do header, transparências e
tema do navegador foram alinhados. Catálogo e Aprenda foram conferidos em
1440px e 390px com WooCommerce simulado; cores computadas confirmadas em
menus, barra, preços, filtro e ações dos guias. Hover/foco de CTA de produto
confirmou o laranja oficial; hover comercial manteve o verde profundo de apoio.
Catálogo sem overflow nas duas larguras. Capturas em
`output/playwright/brand-colors/`, fora do Git. Essa conferência não é uma
homologação da loja real.

Na complementação da mesma revisão, todos os CTAs dos cards passaram a usar
`#1a4020` em repouso, incluindo relacionados; hover/foco compartilham `#ef4929`.
Fundos verdes de seções e painéis institucionais foram alinhados. Home e
Aprenda tiveram cores de fundo computadas conferidas em 1440px e 390px.
No Ritual Finder, o gradiente antigo foi substituído por uma camada do verde
oficial com 88% de opacidade sobre a textura. Capturas específicas:
`matcher-1440.png` e `matcher-390.png`, na mesma pasta de evidências.

Em **26/10/2026**, revisão documental: `npm.cmd run check` aprovou lint,
TypeScript e **90 testes unitários**. O inventário foi gerado e
`npm.cmd run docs:visual:check` confirmou correspondência com o código.
Links locais da documentação foram verificados. Não foram repetidos build,
E2E ou consultas à loja real. A inspeção visual posterior das cores está
registrada acima.

Para manter cores e tipografia documentadas:

```powershell
npm.cmd run docs:visual
npm.cmd run docs:visual:check
```

O inventário lê fontes locais e distingue tokens referenciados de declarações
sem referência; não detecta seletores mortos nem comprova aparência renderizada.

## Evidência da revisão de 22/10/2026

Em 22/10/2026, `npm.cmd run check` aprovou lint, TypeScript e 85 testes
unitários; `npm.cmd run test:e2e` aprovou 29 cenários e ignorou 2 que exigem o
fixture dedicado do Ritual Finder; `npm.cmd run build` concluiu o build de
produção. A suíte E2E usa WooCommerce simulado e não homologa integrações reais.

## Evidência da revisão documental anterior

Em 06/10/2026 foram lidos código/contratos e amostradas home, Aprenda e Primeiro Rapé em 1440/390px. Verificação documental inclui links, rotas, scripts, sidecar JSON e correspondência de tokens. Resultados antigos de check/build/E2E não são apresentados como executados nesta revisão.
