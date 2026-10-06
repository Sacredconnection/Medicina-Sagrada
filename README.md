# Medicina Sagrada — frontend headless

Vitrine e experiência editorial em Next.js integradas ao WordPress e ao WooCommerce existentes. O frontend apresenta catálogo, produtos, artigos, guias e sacola; conta, pedidos, frete definitivo e pagamento ficam no WooCommerce.

Documentação revisada em **06/10/2026**, com base no código desta cópia. Disponibilidade remota, instalação de plugins e homologação financeira dependem de verificação no ambiente correspondente.

## Começar no Windows

Requer Node.js **22.18 ou superior**, npm e Google Chrome instalado para E2E. A stack é Next.js 16, React 19 e TypeScript 6. Versões resolvidas estão no `package-lock.json`; `package.json` define os intervalos permitidos.

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd run dev
```

`setup` cria `.env.local`, gera segredo de revalidação e preserva qualquer arquivo existente. Confira a porta no terminal e mantenha `NEXT_PUBLIC_SITE_URL` coerente com a URL acessada.

Abra `/` para a home, `/busca/` para catálogo, `/aprenda/` para guias, `/cart/` para sacola e `/diagnostico-api/` para diagnóstico em desenvolvimento.

## Documentação

Comece pelo **[índice completo](docs/README.md)**.

| Assunto | Documento |
| --- | --- |
| Propósito, público e compromissos | [PRODUCT](PRODUCT.md) |
| Cores, tipografia, composição e componentes | [DESIGN](DESIGN.md) |
| Estrutura e fluxo de dados | [Arquitetura](docs/ARQUITETURA.md) |
| Páginas, parâmetros e contratos HTTP | [Rotas e APIs](docs/ROTAS-E-APIS.md) |
| Ambiente, variáveis e diagnóstico | [Configuração](docs/CONFIGURACAO.md) |
| Textos, imagens e arquivos públicos | [Conteúdo e assets](docs/CONTEUDO-E-ASSETS.md) |
| Alterações, testes e solução de problemas | [Manutenção](docs/MANUTENCAO.md) |
| Homologação, SEO, publicação e rollback | [Publicação](docs/PUBLICACAO.md) |
| Checkout, complemento WordPress e Pagar.me | [Pagamentos](docs/PAGAMENTOS.md) |
| Cotação na página de produto | [Frete](docs/FRETE.md) |
| Rede e hospedagem | [Conexão](docs/CONEXAO-HOSPEDAGEM.md) |
| Ritmo das seções e áreas de toque | [Espaçamento](docs/ESPACAMENTO.md) |

## Verificações

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

`check` executa lint, tipos e unitários. E2E usa WooCommerce simulado, sem pagamento real; alguns cenários exigem fixture específica, descrita em [Manutenção](docs/MANUTENCAO.md).

Para problemas externos, `npm.cmd run check:connection` gera `artifacts/connection-report.json`. `npm.cmd run check:woocommerce` consulta APIs administrativas somente quando há credenciais configuradas no servidor.

## Situação e continuidade

Estão implementados catálogo com filtros e ordenação, variações, sacola com cupons e painel lateral, transferência de sessão ao checkout, frete estimado, avaliações, Ritual Finder, Aprenda, blog, metadados e revalidação autenticada. Isso não confirma disponibilidade remota nem cobrança homologada. Veja [Publicação](docs/PUBLICACAO.md).

Preserve slugs, URLs públicas, identidade, textos aprovados e contratos dos assets. Leia `AGENTS.md`, `PRODUCT.md` e os documentos da superfície antes de alterar. Para código Next.js, consulte o guia pertinente em `node_modules/next/dist/docs/`, conforme `AGENTS.md`.
