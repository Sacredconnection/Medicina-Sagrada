# Visão geral e handoff técnico

Revisão documental: **26/10/2026**. Resultados de integração e testes abaixo
mantêm suas datas originais. Nesta revisão, `check` passou com 90 unitários;
build, E2E e serviços externos não foram revalidados.

Para identidade visual, cores, tipografia, componentes e navegação pelos
documentos, comece pelo [Guia geral](GUIA-GERAL.md). A implementação inclui
também `/intencoes/` e as sete páginas de tema, filtros e classificação
editorial dos produtos: [Intenções WooCommerce](INTENCOES-WOOCOMMERCE.md).

Este documento apresenta o estado atual do projeto para continuidade entre o
frontend e o responsável pelo backend. Ele descreve somente o que existe nesta
cópia do repositório. Disponibilidade de serviços, plugins instalados, credenciais,
cache, webhooks e pagamentos precisam ser confirmados no ambiente correspondente.

## Resumo do projeto

Medicina Sagrada é um frontend headless em Next.js para a loja e o conteúdo
editorial existentes. O Next.js renderiza a experiência pública; WordPress e
WooCommerce permanecem como fontes de conteúdo, catálogo, estoque, conta,
pedidos e checkout.

Stack principal:

- Next.js 16 com App Router;
- React 19 e TypeScript 6;
- CSS próprio, sem Tailwind;
- WordPress REST API e WooCommerce Store API;
- Playwright para E2E e Node test runner para testes unitários;
- plugin complementar em `wordpress/medicina-sagrada-headless/`.

## Estado atual

| Área | Estado nesta cópia | Responsabilidade seguinte |
| --- | --- | --- |
| Home, header, footer e navegação | Implementados | Frontend |
| Catálogo, busca, filtros e paginação | Implementados com Store API | Homologar dados reais |
| Produto, galeria e variações | Implementados | Homologar catálogo real |
| Sacola headless | Implementada com Cart-Token HttpOnly | Homologar sessão e cache |
| Transferência ao checkout | Implementada no Next | Instalar/validar complemento WordPress |
| Conta e pedidos | Redirecionam ao WooCommerce | Backend/WooCommerce |
| Frete na página do produto | Adaptador implementado | Homologar Melhor Envio real |
| Pagamentos | Não processados pelo Next | WooCommerce/Pagar.me |
| Leitura de avaliações | Implementada | Confirmar disponibilidade real |
| Envio de avaliações | Retorna `401` e direciona à conta | Definir autenticação com o backend |
| Newsletter | Interface e estados implementados | Criar `POST /api/newsletter/` |
| Revalidação de conteúdo | Endpoint autenticado implementado | Configurar segredo e webhook WordPress |
| SEO, sitemap, robots e schemas | Implementados localmente | Homologar domínio e indexação |
| Diagnóstico | Disponível somente em desenvolvimento | Usar na integração |

## Divisão de responsabilidade

### Frontend

- interface, responsividade e acessibilidade;
- páginas e componentes Next.js;
- validação local de formulários e estados de carregamento/erro/vazio;
- adaptadores server-side presentes em `app/api/`;
- sanitização do HTML editorial;
- SEO técnico gerado pelo frontend;
- testes unitários, E2E e build.

### Backend e infraestrutura

- WordPress, WooCommerce e banco de dados;
- credenciais, usuários, autenticação e permissões;
- conta, histórico de pedidos e sessão WooCommerce;
- instalação e ativação do complemento WordPress;
- Pagar.me, Pix, cartão, boleto, webhooks e estornos;
- Melhor Envio e regras definitivas de frete;
- endpoint e provedor da newsletter;
- cache/CDN, DNS, HTTPS, logs e monitoramento;
- homologação de integrações reais.

### Validação compartilhada

- URLs públicas e origem do WordPress após o corte de domínio;
- política de CORS/origem para chamadas do frontend;
- transferência da sacola para o checkout;
- retorno do checkout e limpeza da sacola;
- revalidação após mudanças no CMS;
- cenários de falha e mensagens públicas;
- SEO e analytics depois da publicação.

## Contratos que o backend deve preservar

### Origens e variáveis

Os nomes oficiais estão em `.env.example` e [Configuração](CONFIGURACAO.md).
Segredos nunca recebem prefixo `NEXT_PUBLIC_`.

- `NEXT_PUBLIC_SITE_URL`: origem pública do Next;
- `WORDPRESS_SITE_URL`: origem do WordPress/WooCommerce;
- `WORDPRESS_API_URL`: base `/wp-json`;
- `WOOCOMMERCE_STORE_API_URL`: Store API;
- `WOOCOMMERCE_CHECKOUT_URL`: checkout nativo WooCommerce;
- `WOOCOMMERCE_ACCOUNT_URL`: conta nativa WooCommerce;
- `REVALIDATION_SECRET`: segredo compartilhado com o complemento WordPress.

Checkout e conta não podem apontar para a própria origem do Next. Credenciais
Pagar.me, Melhor Envio, WordPress e WooCommerce ficam apenas no servidor.

### APIs já presentes no Next

| Rota | Papel |
| --- | --- |
| `GET/POST /api/cart/` | Sessão e mutações da sacola |
| `POST /api/checkout/` | Prepara transferência ao checkout WooCommerce |
| `POST /api/shipping/` | Solicita estimativa de frete ao WordPress |
| `GET /api/reviews/` | Lê avaliações públicas |
| `POST /api/reviews/` | Atualmente retorna `401`; envio depende da estratégia de autenticação |
| `GET /api/ritual-recommendation/` | Confirma recomendação e disponibilidade |
| `GET /api/ritual-variation/` | Confirma variação do Ritual Finder |
| `POST /api/revalidate/` | Revalidação autenticada de páginas e tags |
| `/api/diagnostico/` e `/api/commerce-status/` | Diagnóstico somente em desenvolvimento |

Contratos completos, entradas e status HTTP estão em
[Rotas e APIs](ROTAS-E-APIS.md).

### Newsletter pendente

O componente envia JSON para `POST /api/newsletter/`, mas essa rota não existe
nesta cópia. O backend deve implementar o contrato documentado em
[Newsletter](NEWSLETTER.md), incluindo validação, consentimento, honeypot, limite
de tentativas e resposta explícita `subscribed` ou `pending`.

### Avaliações pendentes

A leitura pública está pronta. O formulário visual ainda reúne nota, comentário,
usuário e senha, mas o handler atual não processa o corpo: `POST /api/reviews/`
responde `401` com link para `/account/`. Portanto, o envio não está funcional.
O backend deve definir como a sessão autenticada do WooCommerce será reconhecida;
depois, o frontend deve ser alinhado ao contrato escolhido. Não armazenar nem
registrar senha de cliente no Next.

### WordPress e checkout

O plugin complementar local está na versão 1.0.1. Sua presença no repositório
não comprova instalação. O responsável pelo backend deve:

1. gerar o ZIP com `npm.cmd run package:wordpress`;
2. instalar ou atualizar o mesmo plugin em homologação;
3. confirmar `/wp-json/ms-headless/v1/status`;
4. configurar `MS_HEADLESS_URL` e `MS_REVALIDATION_SECRET`;
5. excluir sessões, carrinho, checkout e Store API do cache;
6. testar a transferência e a limpeza da sacola.

Detalhes e checklist financeiro estão em [Pagamentos](PAGAMENTOS.md).

## Estrutura principal

| Caminho | Conteúdo |
| --- | --- |
| `app/` | Rotas, layouts, páginas, metadata e estilos globais/Aprenda |
| `app/api/` | Adaptadores e contratos HTTP do Next |
| `components/` | Componentes e seções da interface |
| `lib/` | Configuração, tipos, validações e integração de dados |
| `public/assets/` | Imagens finais e contratos de exportação |
| `public/files/` | Materiais públicos para download |
| `wordpress/` | Complemento PHP do WordPress |
| `scripts/` | Setup, diagnóstico, empacotamento e smoke tests |
| `tests/` | Unitários, E2E e WooCommerce simulado |
| `docs/` | Documentação técnica e operacional |

## Como rodar

Requisitos: Windows 11 ou ambiente equivalente, Node.js 22.18+ e npm.

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd run dev
```

O setup cria `.env.local` sem sobrescrever um arquivo existente. Nunca versionar
segredos, cookies, credenciais ou URLs de checkout contendo `session`.

## Validação local

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Resultado registrado em 22/10/2026:

- `check`: lint, TypeScript e **85 testes unitários aprovados**;
- `test:e2e`: **29 aprovados e 2 ignorados** por exigirem o fixture dedicado do
  catálogo do Ritual Finder;
- `build`: build de produção concluído com sucesso.

Os E2E usam um WooCommerce simulado. Esses resultados não comprovam WordPress,
frete, conta, checkout, pagamento, webhook ou newsletter em produção.

## Checklist para o handoff do backend

- [ ] Confirmar URLs definitivas de frontend, WordPress, Store API, checkout e conta.
- [ ] Configurar variáveis e segredos em homologação sem expô-los ao navegador.
- [ ] Confirmar WordPress/WooCommerce por HTTPS e sem cache em rotas privadas.
- [ ] Instalar e ativar o complemento WordPress 1.0.1.
- [ ] Configurar e testar a revalidação WordPress → Next.
- [ ] Implementar e homologar `POST /api/newsletter/`.
- [ ] Definir autenticação para o envio de avaliações.
- [ ] Homologar frete real com produtos simples e variáveis.
- [ ] Homologar transferência de sacola, checkout e cliente logado.
- [ ] Homologar Pix, cartão, boleto, recusas, callbacks e estornos.
- [ ] Confirmar que webhooks não duplicam pedido, cobrança ou estoque.
- [ ] Validar cache/CDN, logs, monitoramento e plano de rollback.
- [ ] Executar novamente check, E2E, build e smoke tests no ambiente final.

## Ordem de leitura recomendada

1. este documento;
2. [CSS e direção visual](CSS-E-DIRECAO-VISUAL.md);
3. [Configuração](CONFIGURACAO.md);
4. [Arquitetura](ARQUITETURA.md);
5. [Rotas e APIs](ROTAS-E-APIS.md);
6. [Pagamentos](PAGAMENTOS.md), [Frete](FRETE.md) e [Newsletter](NEWSLETTER.md);
7. [Publicação](PUBLICACAO.md).

