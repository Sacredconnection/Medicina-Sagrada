---
name: Medicina Sagrada — Aprenda
description: Superfície local baseada no Learn Haux, com espaços reservados para assets próprios.
colors:
  learn-forest: "#174b37"
  learn-ink: "#14251d"
  learn-sand: "#ebe7d9"
  blog-action: "#ef492b"
  white: "#ffffff"
  learn-line: "#d9d6c7"
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
    fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-.04em"
  headline:
    fontSize: "clamp(2rem, 3.5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-.04em"
  title:
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-.035em"
  people-name:
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-.035em"
  product-title:
    fontSize: "1.125rem"
    lineHeight: 1.4
    letterSpacing: "-.02em"
  body:
    fontSize: "1rem"
    lineHeight: 1.75
  supporting:
    fontSize: ".875rem"
    lineHeight: "1.5rem"
  navigation:
    fontSize: ".75rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: ".12em"
  label:
    fontSize: ".6875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: ".12em"
rounded:
  action: ".5rem"
  surface: ".75rem"
  checklist-dot: "50%"
spacing:
  section: "clamp(3rem, 5vw, 4.5rem)"
  intro: "clamp(2.5rem, 4vw, 3.5rem)"
  grid-gap: "1rem"
  desktop-guide-gap: "1.25rem"
components:
  guide-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.surface}"
    padding: "1.5rem"
  guide-action:
    backgroundColor: "{colors.learn-forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: ".75rem 1.5rem"
  blog-action:
    backgroundColor: "{colors.blog-action}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: ".75rem 1.5rem"
---

# Design System: Medicina Sagrada — Aprenda

## Overview

Registro exclusivo de `/aprenda/` e seus guias, após a direção de reproduzir o visual das páginas Learn Haux. A tipografia usa Proxima Nova, a fonte do projeto. A composição permanece baseada na referência Haux. Imagens ficam ausentes até Danilo fornecer os arquivos canônicos. Textos continuam em português e respeitam os limites de atribuição de origem e efeitos definidos no projeto.

Evidências: `aprenda.css`, páginas e layout Aprenda, `learn-people-grid.tsx`, `learn-image-slot.tsx` e `public/assets/aprenda/README.md`. Este documento descreve a construção observada, sem tornar possíveis falhas de implementação regras de design.

## Colors

Learn-forest identifica títulos destacados dos guias e suas ações. Labels usam o laranja da marca (#ef4928). A introdução do índice tem fundo verde (#12372a), título branco e destaque laranja. Learn-ink sustenta texto e hover de ações; learn-sand participa de fundos leves, misturado com branco. O botão do blog usa blog-action. Bordas usam learn-line, com variações locais de opacidade; texto secundário usa `--muted` do projeto. As cores locais são aliases dos tokens globais da Medicina Sagrada; não usam mais a paleta Haux.

A paleta canônica de etnias da Medicina Sagrada aparece somente nos destaques contextuais do glossário: borda em hover/aberto, painel e ação “Explorar”. Kuntanawa, Shanenawa e Yawanawá usam branco sobre o acento; os demais, preto. As cores não significam simbolismo cultural oficial.

## Typography

A família é **Proxima Nova**, carregada pelo sistema Adobe Fonts do projeto e aplicada por `var(--font-primary)`. Cabeçalhos, introduções, artigos e títulos dos produtos herdam essa família dentro de Aprenda.

A escala registrada cobre labels e ações pequenas, navegação, apoio, corpo, títulos de produtos e títulos de cards/passos/checklist. Nomes de povos e cabeçalhos usam os clamps do frontmatter. Labels e navegação são maiúsculos; títulos têm tracking negativo. O título principal limita-se a (22ch). Destaques do h1 mantêm desenho normal, em laranja no índice e verde nos guias; destaques do h2 usam peso (400) e itálico. Introdução dos artigos e corpo dos passos têm entrelinha (2rem), enquanto resumos do glossário usam (1.6).

## Layout

O shell principal e os shells dos guias usam o mesmo limite do header, `--max-width` (80rem / 1280px), e as mesmas margens responsivas de `--page-gutter`. O índice tem introdução, três guias, glossário com dez entradas e continuidade para o blog. Banners são fundos de seção com largura total e texto HTML dentro do shell.

A partir de (1024px), guias e linhas do glossário usam três colunas. A introdução do índice tem coluna de texto lateral (420px); nos artigos, (300px). Cards dos povos unem uma faixa de mídia (7rem) ao texto, e o painel aberto ocupa a linha inteira abaixo. Em telas menores, o painel segue imediatamente o card selecionado. Uma entrada fica aberta por vez.

Nos guias internos, o checklist vem **antes** dos três passos. Passos são empilhados no mobile; a partir de (640px), mídia ocupa (38%) e texto o restante. Checklist passa de uma coluna a duas em (640px) e quatro em (1024px). Padding de cards de guia, checklist e corpo dos passos passa de (1.5rem) a (1.75rem) em (640px).

## Elevation & Depth

Cards editoriais e painéis usam superfícies claras e bordas, sem sombras locais. Hover de guia e povo desloca o card discretamente (-1px). Recomendações continuam usando ProductCard compartilhado e seus estados globais; isso não redefine os cards editoriais.

## Shapes

Ações e navegação têm raio action; cards, painéis, notas e checklist têm raio surface. Pontos de checklist usam raio circular. Bordas são geralmente (1px), sem moldura decorativa. Imagens são recortadas pelo slot; o chevron do glossário é construído com duas bordas e gira entre (45deg) e (225deg).

## Components

- **Guias:** card inteiro clicável, título/resumo e ação verde centralizada na base; hover da ação fica escuro.
- **Glossário:** botão com `aria-expanded`, imagem lateral e teaser. Painel contextual separado oferece texto e ação na cor da etnia. Sem faixas de nome inteiramente preenchidas com essa cor.
- **Checklist:** lista informativa com pontos verdes, sem controle de marcação.
- **Navegação:** links em maiúsculas, próxima leitura verde; botão do blog laranja. Foco local em verde (2px), offset (3px), interno no botão do povo (-3px).
- **Slots:** `LearnImageSlot` só renderiza imagem se o arquivo existe em `/assets/aprenda/`; sem arquivo, preserva o espaço sem ícones ou texto de placeholder. Normalmente usa cover; o banner de continuidade mobile usa contain e alinhamento inferior. Se só uma variante do banner existe, ela serve de fallback.
- **Assets:** nomes, dimensões e composição completos em `public/assets/aprenda/README.md`. Banners desktop/mobile ficam em `banners/`; povos em `povos/{slug}.webp`; cada guia em `guias/{slug}/passo-01.webp` até `passo-03.webp`; produtos em `produtos/{slug-real}.webp`. Não reaproveitar fotos antigas de Haux nem fotos do catálogo automaticamente nesta superfície. Atualizar a página em desenvolvimento; produção requer novo build/deploy.
- **Recomendações:** dados, preços e links vêm de WooCommerce; imagens aparecem somente quando há asset local por slug. Até quatro produtos, excluindo kits e itens identificados como fora de estoque. Sem resultados, texto e links de coleção continuam disponíveis.

Motion local está no sidecar. Com preferência por movimento reduzido, transições são removidas e os cards não se deslocam.

## Do's and Don'ts

- **Do** usar a fonte do projeto e preservar as cores e composição de Aprenda aprovadas por Danilo.
- **Do** preservar slots e nomes canônicos para receber as imagens produzidas por Danilo.
- **Do** aplicar cores de etnias exclusivamente ao contexto do povo correspondente.
- **Don't** estender esta direção ao restante da loja automaticamente.
- **Don't** preencher slots com fotos de referência ou inventar origem de produtos e efeitos.
