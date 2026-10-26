---
name: Medicina Sagrada
description: Sistema visual extraído da vitrine e experiência editorial existentes.
colors:
  forest-950: "#0b261d"
  forest-900: "#12372a"
  forest-800: "#1a4020"
  forest-650: "#3b6f52"
  leaf-400: "#9bb978"
  clay-500: "#ef4929"
  paper: "#ffffff"
  paper-deep: "#ebe7d9"
  line: "#d9d6c7"
  ink: "#14251d"
  muted: "#68736b"
  white: "#ffffff"
  header-white: "#ffffff"
  brand-orange: "#ef4929"
  cta-accent: "#ef4929"
  cta-on-accent: "#06140f"
  brand-text: "#ef4929"
  apurina: "#83bc43"
  caboclo: "#997052"
  huni-kuin: "#bfa771"
  katukina: "#79bc43"
  kuntanawa: "#606161"
  nukini: "#dc9c41"
  puyanawa: "#ba9b80"
  shanenawa: "#0568a7"
  shawadawa: "#ec2326"
  yawanawa: "#2f2f2a"
typography:
  display:
    fontFamily: '"proxima-nova", "Segoe UI", "Avenir Next", Arial, sans-serif'
    fontSize: "clamp(2.75rem, 5.5vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  intention-display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(3rem, 8vw, 6.75rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.055em"
  section-title:
    fontSize: "clamp(2.35rem, 3.3vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.02
  subsection-title:
    fontSize: "clamp(1.45rem, 2.3vw, 2.2rem)"
    fontWeight: 600
    lineHeight: 1.08
  card-title:
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: "-0.015em"
  body:
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontSize: "0.9375rem"
  editorial-body:
    fontSize: "1.125rem"
  ui:
    fontSize: "0.875rem"
  label:
    fontSize: "0.8125rem"
  caption:
    fontSize: "0.75rem"
  action:
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.06em"
rounded:
  surface: "0.75rem"
  commerce: "0.25rem"
  field: "0.2rem"
  product-action: "0.45rem"
  pill: "999px"
spacing:
  page-gutter: "clamp(1rem, 2.5vw, 2rem)"
  section-compact: "clamp(3rem, 4.5vw, 4rem)"
  section-standard: "clamp(4rem, 6vw, 5.5rem)"
  section-major: "clamp(4.5rem, 7vw, 6.5rem)"
  home-section-gap: "clamp(1rem, 2vw, 1.5rem)"
  group-medium: "1.5rem"
  group-large: "2.5rem"
components:
  editorial-button:
    backgroundColor: "transparent"
    textColor: "{colors.forest-950}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.35rem"
    typography: "{typography.action}"
  editorial-button-hover:
    backgroundColor: "{colors.cta-accent}"
    textColor: "{colors.cta-on-accent}"
  commerce-button:
    backgroundColor: "{colors.forest-800}"
    textColor: "{colors.white}"
    rounded: "{rounded.commerce}"
    padding: "0.85rem 1.3rem"
  commerce-button-hover:
    backgroundColor: "{colors.forest-950}"
  product-action:
    backgroundColor: "{colors.forest-800}"
    textColor: "{colors.white}"
    rounded: "{rounded.product-action}"
    padding: "0.7rem 0.9rem"
  product-action-hover:
    backgroundColor: "{colors.cta-accent}"
    textColor: "{colors.cta-on-accent}"
  product-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.surface}"
  commerce-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.7rem"
---

# Design System: Medicina Sagrada

## Overview

Revisão do código em **26/10/2026**, a partir de globals.css, aprenda.css e
componentes atuais. O [guia geral](docs/GUIA-GERAL.md) reúne cores, tipografia
e operação; o [inventário visual](docs/INVENTARIO-VISUAL.json) registra referências
extraídas automaticamente. Na atualização das cores oficiais, catálogo e
Aprenda foram conferidos em 1440px e 390px, incluindo estados de ação.
A paleta e a tipografia vigentes estão consolidadas no guia dedicado.
As seções seguem o [formato DESIGN.md](https://raw.githubusercontent.com/google-labs-code/design.md/main/docs/spec.md).

**Creative North Star: "Floresta, origem e clareza"**

Este nome é uma síntese documental provisória, não uma nova direção aprovada.
A vitrine combina fotografias, superfícies verdes profundas e áreas brancas de
leitura. A descoberta é editorial; escolhas comerciais usam controles diretos,
preços legíveis e feedback explícito. Proxima Nova é a base; títulos de intenções usam Georgia.

**Key Characteristics:**

- Fotografia como contexto de origem e descoberta.
- Verdes estruturais com acentos quentes em ações editoriais.
- Leitura clara e controles comerciais previsíveis.
- Acentos de etnias ligados ao conteúdo correspondente.

PRODUCT mantém os fatos e compromissos de marca. Uma associação cromática não
é simbolismo cultural oficial. Regras particulares de uma página não devem
ser promovidas automaticamente a regra de toda a loja.

## Colors

As duas cores principais fixas são **verde #1A4020** e **laranja #EF4929**.
Não aproximar, substituir ou criar variações dessas cores principais sem nova
orientação explícita de Danilo. Todos os outros verdes e as cores das etnias
são apoios aplicados aos contextos existentes.

O frontmatter registra tokens globais com referência de uso e os acentos dos
povos. Tokens com o mesmo HEX são aliases de função, não cores adicionais.
Menus do header usam o verde principal; pequenos títulos de seção, inclusive
“Recomendações da Medicina Sagrada”, usam o laranja principal.

A documentação geral completa está em [Paleta e tipografia](docs/PALETA-E-TIPOGRAFIA.md):
cores principais, apoios, neutros, estados locais, vetores e tipografia efetiva.
Fórmulas de transparência e ocorrências: [inventário](docs/INVENTARIO-VISUAL.json).

**The Contextual Accent Rule.** A cor de etnia é um apoio exclusivo do povo
explicitamente identificado nos dados; preservar seu foreground canônico.

**The Action Context Rule.** Compra e CTAs verdes de produto usam #1A4020.
Os estados laranja usam #EF4929. Preservar os estados específicos de cada
componente e os apoios já aplicados. Não tornar todo botão laranja.

## Typography

Família principal: Proxima Nova, com fallbacks Segoe UI, Avenir Next, Arial e
sans-serif. Adobe Fonts: kit vjh7vll. Georgia, com Times New Roman e serif como
alternativas, é apoio editorial para títulos, cards e navegação de intenções.

Corpo global: 1rem, peso 400, entrelinha 1,55. Pesos em uso: 400, 500, 600,
700, 800 e 900. Os tamanhos fluidos e overrides de cada superfície estão no
[guia de paleta e tipografia](docs/PALETA-E-TIPOGRAFIA.md), extraídos do CSS.
O título da página individual de intenção usa sua escala local, diferente do índice.
Aprenda mantém Proxima Nova e seus labels locais de 0,6875rem.

**The Shared Voice Rule.** Reutilizar as famílias e os papéis existentes.
Fallback técnico não é família adicional de marca. Não criar escala ou fonte
com base em explorações antigas. Preços e quantidades usam números tabulares
onde implementado.

## Layout

Container global limita-se a 80rem com duas margens page-gutter; leitura usa
68ch quando o componente aplica reading-width. O espaçamento interno usa
section-compact/standard/major. Intervalo externo da home usa home-section-gap.
Hero e faixa de benefícios são a exceção encostada documentada em
[Espaçamento](docs/ESPACAMENTO.md).

Catálogo desktop combina sidebar de 14rem, gap de 2.5rem e três colunas de
produtos; reduz colunas e adapta filtros nas media queries existentes.
Grade geral de produtos tem quatro colunas em desktop, com overrides por
superfície. Sacola usa conteúdo e resumo de 23rem antes de empilhar.
Breakpoints são por componente, não uma escala Tailwind.

Aprenda e seus guias usam o mesmo container de 80rem do header,
com as margens responsivas page-gutter. Cards dos povos passam de
uma para duas colunas em 640px e três em 1024px. Guias internos compactos têm
três passos lado a lado a partir de 1024px e empilhados no mobile. O
[design local](app/aprenda/DESIGN.md) registra os overrides atuais.

**The Section Rhythm Rule.** Separe margem externa entre seções de padding
interno; preserve a exceção explícita do hero sem acumular margens avulsas.

## Elevation & Depth

Sistema híbrido: fundos e fotografia criam profundidade editorial; bordas e
superfícies distinguem campos/compra; sombras aparecem em cards fotográficos,
produtos interativos e diálogos. Não é um sistema global sem sombras.

O token shadow é uma sombra ampla e suave (0 1.25rem 3rem rgba(11, 38, 29, 0.09)).
Produto em hover usa sombra menor (0 0.85rem 1.8rem rgba(11, 38, 29, 0.1)).
Esses valores e sombras de overlays estão no sidecar como extensões.
Rampas OKLCH sintetizadas foram retiradas do sidecar: não pertencem à paleta
implementada. Cores locais e transparências permanecem no inventário CSS.

## Shapes

Cards compartilham raio surface; ações editoriais são pílulas; compra e campos
usam cantos menores. Fotos de categorias usam círculos, produtos usam mídia
quadrada e seções específicas usam recortes próprios. Aprenda usa cantos locais
e etiqueta de nome com curvas sobre a foto. Preserve overflow/recorte do
componente; não padronize todos os raios com um valor único.

## Components

- **Botão editorial:** contorno laranja, preenchimento por pseudo-elemento,
  hover/foco com scale de 1.05 e texto escuro sobre acento. Variantes sobre
  fundo escuro usam texto branco antes da interação.
- **Compra:** verde sólido, altura mínima 3rem, peso 600 e raio commerce;
  hover verde profundo; disabled com opacidade 0.5 e cursor not-allowed.
- **Produto:** card inteiro clicável, imagem quadrada, categoria, nome, preço
  e CTA na base. Em dispositivos com hover, levanta discretamente e muda CTA
  para laranja. Foco tem indicação própria, independentemente de hover.
- **Campos:** label visível, borda line, branco, altura mínima 3rem e foco
  visível. Mensagens distinguem erro, sucesso e indisponibilidade.
- **Filtros:** parâmetros na URL, opções de categoria/estoque/oferta/preço,
  chips removíveis e reset. Grupo vazio não reserva espaço.
- **Navegação:** Header branco, marca existente, categorias com menus e
  controles de busca/conta/sacola; navegação mobile usa apresentação própria.
- **Sacola:** página completa e drawer em dialog, overlay e ações de
  quantidade/remoção. Preservar semântica/foco e áreas de toque de 2.75rem.
- **Ritual Finder:** sequência de intenção/experiência, resultado e seleção
  de opções reais; imagem contextual não substitui validação comercial.
- **Aprenda:** cards de guia com CTA verde, povos estáticos com acento por
  contexto e slots locais, sem expansores.
- **Intenções:** índice de sete temas, títulos Georgia, páginas individuais,
  filtros e produtos associados aos atributos públicos do WooCommerce.

Foco global usa outline de 0.2rem no acento com offset de 0.25rem. Algumas
superfícies têm foco local. Movimento usa transições e transforms pontuais;
prefers-reduced-motion reduz efeitos nos seletores existentes. Não afirmar
cobertura completa sem revisar o alvo; detalhes estão no sidecar.

## Do's and Don'ts

### Do

- Do reutilizar tokens, fonte e componentes da superfície existente.
- Do conferir CTA em repouso, hover, foco e mobile antes de alterar sua cor.
- Do usar acento de etnia somente com identificação explícita e foreground canônico.
- Do respeitar nomes de assets e separar textos HTML de imagens de fundo.
- Do provar recortes e comportamento nas larguras relevantes.

### Don't

- Don't tornar todos os CTAs laranja por uma regra genérica.
- Don't inventar origem, efeitos ou simbolismo cultural para sustentar o visual.
- Don't transformar divergência documental ou captura de loading em regra visual.
- Don't estender uma composição local de Aprenda ao resto da loja automaticamente.
