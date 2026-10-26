# Guia geral — Medicina Sagrada

Revisão: **26/10/2026**. Retrato do código desta cópia do projeto. Este guia reúne identidade, interface, conteúdo e operação; as referências técnicas detalhadas ficam nos documentos vinculados. Não é um manual de marca para impressão: cores são valores digitais sRGB, sem conversões CMYK ou Pantone aprovadas.

## 1. Produto e responsabilidades

Medicina Sagrada é uma loja com experiência editorial sobre medicinas, arte e cultura dos povos indígenas e tradicionais do Brasil. A interface está em português do Brasil.

| Camada | Responsabilidade |
| --- | --- |
| Frontend Next.js | Home, navegação, catálogo, produto, sacola, guias, intenções e apresentação editorial |
| WordPress | Conteúdo editorial e páginas provenientes do CMS |
| WooCommerce | Produtos, variações, preços, estoque, sessão, conta e pedidos |
| Checkout WooCommerce | Endereço, frete definitivo e pagamento |
| Equipe responsável pelo backend | Configuração e homologação dos serviços externos |

Fatos e limites de marca: [PRODUCT](../PRODUCT.md). Situação das integrações: [handoff](VISAO-GERAL-E-HANDOFF.md). A existência de uma interface ou adaptador não comprova serviço remoto homologado.

## 2. Identidade e logo

O sistema combina verdes profundos, branco, fotografia e acentos laranja. Cores de povos são contextuais, vinculadas à identificação explícita do conteúdo.

O logo horizontal está em `public/assets/logo/medicina-sagrada-logo-01.svg`. O contrato recomenda SVG transparente, texto em curvas e prancheta 1200 × 300; isso é especificação de exportação, não medição do arquivo. Preserve proporção e nome para manter a integração do header. [Contrato do logo](../public/assets/logo/README.md).

## 3. Paleta de cores

As duas cores principais fixas do site são **verde #1A4020** e **laranja #EF4929**.
Os demais verdes e as cores dos povos são apoios. Não substituir nem aproximar
as cores principais sem nova orientação explícita de Danilo.

A fonte geral para cores, aliases, aplicações, estados locais e vetores é
[Paleta de cores e tipografia](PALETA-E-TIPOGRAFIA.md). Esse documento é gerado
a partir do código atual, sem tokens globais sem referência de uso.

## 4. Tipografia

**Proxima Nova** é a família principal. **Georgia** é apoio editorial em intenções.
Fallbacks, pesos, tamanhos, entrelinhas, tracking e escalas por superfície estão
no mesmo [documento geral](PALETA-E-TIPOGRAFIA.md#6-famílias-tipográficas).

## 5. Composição, espaçamento e formas

| Elemento | Valor |
| --- | --- |
| Container principal | `80rem` (1280px na raiz de 16px) |
| Leitura editorial | `68ch` quando aplicado |
| Margens horizontais | `clamp(1rem, 2.5vw, 2rem)` |
| Padding de seção compacta | `clamp(3rem, 4.5vw, 4rem)` |
| Padding padrão | `clamp(4rem, 6vw, 5.5rem)` |
| Padding amplo | `clamp(4.5rem, 7vw, 6.5rem)` |
| Intervalo entre seções da home | `clamp(1rem, 2vw, 1.5rem)` |
| Intervalos internos referenciados | `1.5rem` e `2.5rem` |
| Raio de superfície | `0.75rem` |
| Raio de compra / campo / CTA de produto | `0.25rem` / `0.2rem` / `0.45rem` |
| Ação editorial | Pílula, `999px` |
| Sombra global | `0 1.25rem 3rem rgba(11, 38, 29, 0.09)` |

Hero e faixa de benefícios ficam encostados; demais seções usam o intervalo da home. Produtos têm mídia quadrada; categorias usam círculos. Preserve recorte e `object-fit` próprios de cada superfície. [Espaçamento](ESPACAMENTO.md).

Responsividade é por componente. Header passa ao menu mobile até 1000px. Aprenda usa duas colunas de povos em 640px e três em 1024px; passos dos guias passam a três colunas em 1024px. As condições completas de `@media` estão no inventário, sem convertê-las em uma escala global artificial.

## 6. Componentes e estados

| Componente | Contrato atual |
| --- | --- |
| Header | Branco, sticky, logo horizontal, navegação e menus desktop/mobile |
| Botão editorial `.button` | Contorno, preenchimento por pseudo-elemento e estados locais; variantes sobre fundo escuro |
| Botão comercial `.commerce-button` | Verde `forest-800`, texto branco, mínimo 3rem; hover `forest-950`; disabled com opacidade 0,5 |
| Card de produto | Card clicável, imagem quadrada, categoria, nome, preço e CTA na base; intenções quando cadastradas |
| CTA de produto | Verde principal `#1a4020` em repouso; laranja `#ef4929` e texto escuro em hover/foco; regra compartilhada por home, catálogo e relacionados |
| Campos | Label, borda, foco e feedback; estados de erro/sucesso/indisponibilidade |
| Filtros | URL com busca, ordem, categoria, preço, estoque, oferta e intenção; chips e limpeza |
| Sacola | Página e drawer; quantidade, remoção, cupom, resumo e encaminhamento ao checkout |
| Galeria | Imagem ampliável e diálogo; navegação e fechamento por controles próprios |
| Ritual Finder | Intenção, experiência, recomendação e opções de compra; depende de dados comerciais válidos |
| Aprenda | Três guias e glossário de cards estáticos; sem painéis expansíveis |
| Intenções | Índice de sete temas, páginas individuais, produtos associados e navegação contextual |
| Newsletter | E-mail, consentimento e feedback; endpoint esperado `/api/newsletter/` sem handler local implementado |

O foco global tem contorno `0.2rem` em `cta-accent`, offset `0.25rem`; alguns componentes substituem esse tratamento. Há regras de movimento reduzido e hover condicionado. A conferência documental não certifica cobertura integral de acessibilidade.

## 7. Páginas, conteúdo e arquivos

Mapa completo: [Rotas e APIs](ROTAS-E-APIS.md). Principais superfícies: home, busca/catálogo, categorias, produto, sacola, Aprenda/guias, intenções, blog/artigos e páginas institucionais.

| Alteração desejada | Onde procurar |
| --- | --- |
| Tokens e estilos globais | `app/globals.css` |
| Aprenda e guias | `app/aprenda/`, `lib/learn-content.ts`, `components/learn-*` |
| Textos e imagens da home | `app/page.tsx`, `lib/home-content.ts`, componentes `home-*` |
| Menus | `components/header-navigation.tsx`, `header.tsx`, `footer.tsx` |
| Produtos, preços e estoque | WooCommerce; adaptadores em `lib/woocommerce.ts` |
| Conteúdo editorial | WordPress; adaptadores em `lib/wordpress.ts` |
| Intenções | `lib/intencoes.ts`, `lib/woocommerce.ts`, `app/intencoes/` |
| SEO | `lib/seo.ts`, `lib/config.ts`, metadata, sitemap e robots |
| Fotos e vetores finais | `public/assets/` e README de cada pasta |
| Downloads públicos | `public/files/` |

Imagens: preferir WebP sRGB; vetores: SVG; nomes minúsculos com hífens, sem acentos. PSD, AI, INDD e TIFF editáveis ficam fora de `public`. Não embutir textos de interface em fundos. Dimensões recomendadas e nomes estão nos [contratos de assets](CONTEUDO-E-ASSETS.md).

A home pode recorrer a `demoProducts` se a consulta falhar ou retornar vazia. Essa apresentação não comprova estoque ou compra disponível. Intenções editoriais não são promessas de efeito ou orientações de segurança. [Integração de intenções](INTENCOES-WOOCOMMERCE.md).

## 8. Execução e manutenção

Stack declarada: Next.js `^16.3.6`, React/React DOM `^19.2.8`, TypeScript `^6.0.2`, CSS próprio, sem Tailwind. Requer Node.js 22.18+. `package-lock.json` determina as versões instaladas por `npm ci`.

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd run dev
```

O setup cria `.env.local` se ausente. Variáveis permitidas e configuração: [Configuração](CONFIGURACAO.md). Nunca copiar credenciais para documentação ou código público.

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

`check` reúne lint, tipos e unitários. E2E usa WooCommerce simulado; não valida pagamentos reais. Build pode consultar serviços externos. Histórico de resultados fica em [Manutenção](MANUTENCAO.md), sempre com a data original.

Indexação depende de `isProductionSite` em `lib/config.ts`: ambiente de produção, condição Vercel e URL canônica `https://medicinasagrada.com.br`. Uma build local não prova indexação ou publicação.

## 9. Atualizar a documentação sem acumular regras antigas

```powershell
npm.cmd run docs:visual
npm.cmd run docs:visual:check
```

O primeiro comando regenera o inventário e o documento de paleta e tipografia; o segundo detecta divergência com o código sem escrever arquivos. Depois revise o guia e DESIGN quando necessário. Os scripts não alteram CSS, cores ou componentes e verificam os HEX fixos das duas cores principais.

O inventário e a documentação vigente incluem somente tokens globais com referência de uso. Não documentar explorações cromáticas nem escalas tipográficas sem implementação.

Método: leitura de código, referências, rotas, configuração e contratos; inventário automatizado e verificações de consistência. Não houve nesta revisão inspeção renderizada de todas as páginas, auditoria de seletores mortos, consulta administrativa à loja ou homologação de integrações. Capturas e testes anteriores preservam suas datas.
