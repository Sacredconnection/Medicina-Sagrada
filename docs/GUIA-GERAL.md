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

## 3. Cores globais referenciadas

Verde principal oficial: **`#1a4020`**, confirmado por Danilo em 26/10/2026.
O token `--forest-800` aplica esse valor aos elementos de verde principal.
Logo, favicon, barra do header e tema do navegador seguem a mesma cor.
Os verdes profundos/de apoio e a paleta contextual dos povos são distintos.
Fundos verdes de seções também usam `#1a4020`. Na entrada do Ritual Finder,
a camada sobre a textura deriva desse mesmo verde, com 88% de opacidade;
não usa mais o gradiente de verdes escuros anterior.
Laranja principal oficial: **`#ef4929`**, confirmado na mesma data e aplicado
a `--brand-orange`, `--cta-accent`, logo e transparências de ação.

Valores extraídos de `app/globals.css`. “Referenciado” significa que existe uso de `var()` no código; não comprova que todo seletor aparece nas páginas atuais. Não excluir uma cor só porque ela não aparece na primeira tela.

| Token CSS | HEX | Papel / referência |
| --- | --- | --- |
| `--forest-950` | `#0b261d` | Verde profundo, títulos, ações e superfícies |
| `--forest-900` | `#12372a` | Apoio em títulos de intenções e mídia contextual |
| `--forest-800` | `#1a4020` | Compra, links, preços e ações de guias |
| `--forest-650` | `#3b6f52` | Apoio, foco, bordas e texto contextual |
| `--leaf-400` | `#9bb978` | Seleção de texto e destaques de apoio |
| `--clay-500` | `#ef4929` | Ícones de benefícios e acento de comunidade; também há referência em `.brand-name em` |
| `--paper` | `#ffffff` | Fundo do body |
| `--white` | `#ffffff` | Superfícies, textos invertidos e componentes |
| `--header-white` | `#ffffff` | Branco específico do header |
| `--paper-deep` | `#ebe7d9` | Fundos leves e controles secundários |
| `--line` | `#d9d6c7` | Bordas e divisórias |
| `--ink` | `#14251d` | Texto principal |
| `--muted` | `#68736b` | Texto secundário |
| `--brand-orange` | `#ef4929` | Destaques de marca e editoriais |
| `--cta-accent` | `#ef4929` | Ações editoriais, interação e foco |
| `--cta-on-accent` | `#06140f` | Texto sobre o acento de ação |
| `--brand-text` | `#ef4929` | Labels e texto de acento |

Os dois tokens de laranja compartilham o HEX oficial, com papéis de marca e
ação distintos. Os três tokens brancos também compartilham HEX e mantêm seus
papéis. `brand-text`, `clay-500` e os acentos locais usam o mesmo laranja oficial. Sombras e efeitos discretos mantêm a transparência existente.

### Cores locais e estados

A paleta global não cobre todas as cores existentes. Há literais locais e transparências que pertencem ao componente:

| Contexto | Valores de referência |
| --- | --- |
| Barra do header | `#1a4020` |
| Erro comercial | `#9e3329`, `#fff4f1`, `#7a2820` |
| Sucesso e apoio da sacola | `#edf4ee` |
| Imagem e resumo da sacola | `#f5f6f3`, `#f4f6f2` |
| Navegação de intenções | `#f6f8f6`, `#edf3ef` |
| Categorias circulares | Gradiente `#fffdf7` / `#eee7d7` |
| Ritual Finder | Entre outros, `#cbc8bb`, `#f3f0e7`, `#59645d`, `#ece9df` |
| Conexão Ancestral | Fundo `#1a4020` pelo alias `--ancestral-green`; apoios `#cfe1ae`, `#dc251e`, `#b91f19`, `#17351f` |
| Mídia de produto e avaliações | `#f4f2ec`, `#ef4929` |

Lista completa de declarações de cor e tipografia dos dois arquivos CSS: [inventário visual](INVENTARIO-VISUAL.json). Inclui RGBA, `color-mix()`, transparências e regras que podem ser sobrescritas. Cores embutidas em imagens, SVGs e fontes remotas ficam fora desse inventário.

### Paleta contextual dos povos

Fonte: `lib/ethnicity-colors.ts`. Foreground é a cor de texto quando o acento serve de fundo.

| Identificação | Acento | Foreground |
| --- | --- | --- |
| Apurinã | `#83bc43` | `#000000` |
| Caboclo | `#997052` | `#000000` |
| Huni Kuin | `#bfa771` | `#000000` |
| Katukina | `#79bc43` | `#000000` |
| Kuntanawa | `#606161` | `#ffffff` |
| Nukini | `#dc9c41` | `#000000` |
| Puyanawa | `#ba9b80` | `#000000` |
| Shanenawa | `#0568a7` | `#ffffff` |
| Shawãdawa | `#ec2326` | `#000000` |
| Yawanawá | `#2f2f2a` | `#ffffff` |

Não inferir povo por texto livre nem apresentar essas associações cromáticas como simbolismo cultural oficial. Caboclo é uma identidade regional ampla, não uma única nação indígena.

## 4. Tipografia

Família principal: **Proxima Nova**, via Adobe Fonts, kit `vjh7vll`. O componente `AdobeFontsStylesheet` insere a folha de estilo no cliente e oferece alternativa `noscript`. Fallbacks, nesta ordem: Segoe UI, Avenir Next, Arial e sans-serif. O carregamento real depende da rede e das condições do kit.

**Exceção atual:** títulos principais, títulos dos cards e navegação anterior/próximo de `/intencoes/` usam **Georgia**, com Times New Roman e serif como alternativas. O restante conserva a base Proxima Nova.

As equivalências em px abaixo assumem raiz de 16px; `rem` permanece relativo às preferências do navegador.

| Papel | Valor CSS | Referência em px |
| --- | --- | --- |
| Corpo | `1rem` | 16 |
| Corpo menor | `0.9375rem` | 15 |
| Interface | `0.875rem` | 14 |
| Label / ação | `0.8125rem` | 13 |
| Legenda / ação compacta | `0.75rem` | 12 |
| Corpo editorial | `1.125rem` | 18 |
| Título de produto | `1.05rem` | 16,8 |
| Título de seção, token | `clamp(2.35rem, 3.3vw, 3.25rem)` | 37,6–52 |
| Subtítulo, token | `clamp(1.45rem, 2.3vw, 2.2rem)` | 23,2–35,2 |
| h1 global | `clamp(2.75rem, 5.5vw, 5.5rem)` | 44–88 |
| h2 global | `clamp(2.15rem, 4vw, 4rem)` | 34,4–64 |
| h1 de intenções | `clamp(3rem, 8vw, 6.75rem)` | 48–108 |

Pesos globais referenciados: 400, 500, 600, 700, 800 e 900. Corpo: 400 e entrelinha 1,55. h1 global: 800, entrelinha 0,94; títulos globais usam tracking `-0.035em`. h1 de intenções: Georgia 400, entrelinha 0,98 e tracking `-0.055em`. Preços e quantidades usam números tabulares onde definido.

O token de título de seção não equivale a todo h2. Hero, Aprenda e componentes têm substituições locais. [Design de Aprenda](../app/aprenda/DESIGN.md).

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

O primeiro comando regenera o inventário; o segundo detecta divergência com o código sem escrever arquivos. Depois revise o guia e DESIGN quando necessário. O script não altera CSS, cores ou componentes.

Nesta revisão saíram da paleta e escala de uso os tokens sem referência: `--sun-400`, `--weight-thin`, `--weight-light` e `--group-space-small`. As declarações permanecem no CSS, registradas como não referenciadas no inventário; eliminá-las do código é uma limpeza diferente da atualização documental. Rampas OKLCH sintetizadas do sidecar também foram retiradas, pois não são cores implementadas.

Método: leitura de código, referências, rotas, configuração e contratos; inventário automatizado e verificações de consistência. Não houve nesta revisão inspeção renderizada de todas as páginas, auditoria de seletores mortos, consulta administrativa à loja ou homologação de integrações. Capturas e testes anteriores preservam suas datas.
