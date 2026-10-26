---
name: Medicina Sagrada — Aprenda
description: Registro atual do índice Aprenda, cards de povos e três guias locais.
colors:
  learn-forest: "#1a4020"
  learn-ink: "#14251d"
  learn-sand: "#ebe7d9"
  learn-line: "#d9d6c7"
  white: "#ffffff"
  brand-text: "#ef4929"
typography:
  display:
    fontFamily: '"proxima-nova", "Segoe UI", "Avenir Next", Arial, sans-serif'
    fontSize: "clamp(2.5rem, 4.5vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-.04em"
  guide-display:
    fontSize: "clamp(2.25rem, 4vw, 3.5rem)"
    fontWeight: 700
  headline:
    fontSize: "clamp(2rem, 3.5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-.04em"
  people-name:
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-.03em"
  guide-step-title:
    fontSize: "1.5rem"
    lineHeight: 1.2
    letterSpacing: "-.025em"
  body:
    fontSize: "1rem"
    lineHeight: 1.75
  label:
    fontSize: ".6875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: ".12em"
rounded:
  action: ".5rem"
  surface: ".75rem"
  people-card: "1rem"
spacing:
  grid-gap: "1rem"
  desktop-guide-gap: "1.25rem"
  people-gap: "1.5rem"
components:
  guide-action:
    backgroundColor: "{colors.learn-forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: ".75rem 1.5rem"
---

# Design System: Medicina Sagrada — Aprenda

## Overview

Revisão de código: **26/10/2026**. Escopo: `/aprenda/` e seus três guias.
Fontes: `aprenda.css`, páginas, `lib/learn-content.ts`, `learn-people-grid.tsx`
e `learn-image-slot.tsx`. Esta revisão substitui descrições antigas de expansores,
faixas laterais e passos amplos. Na atualização das cores oficiais, o índice
foi conferido em 1440px e 390px; ações verdes confirmadas como `#1a4020`.

## Colors

Tokens `--learn-*` são aliases dos globais, não uma paleta independente.
Introdução do índice: verde principal `forest-800` (`#1a4020`), título branco e destaque
`brand-orange`. Guias: fundo claro e destaque `learn-forest`.
Labels usam `brand-text`; textos secundários usam `muted`.
Fundos claros combinam sand e branco por `color-mix()`.

Cards dos povos recebem `--person-accent` e `--person-foreground` de
`lib/ethnicity-colors.ts`. Acento aparece na borda, etiqueta, divisor e ação.
Kuntanawa, Shanenawa e Yawanawá usam texto branco sobre o acento; os demais,
preto. Paleta completa no [guia geral](../../docs/GUIA-GERAL.md).

## Typography

Proxima Nova em toda esta superfície. Corpo: 1rem/1,75. O h1 do índice usa
o papel display; nos guias compactos, guide-display prevalece. Etiquetas de
povos têm 1,25rem e peso 800, sem escala fluida. Cards de guia usam título
de 1,875rem/1,15; passos compactos usam 1,5rem/1,2; checklist compacto usa
1,25rem. Corpo de passo compacto: 0,9375rem/1,7.

Labels e ações dos guias usam 0,6875rem, peso 700, caixa alta e tracking
0,12em. Ação dos povos usa 0,75rem e tracking 0,06em. Títulos h2 com `em`
usam peso 400 e verde; o itálico depende da marcação e da cascata.

## Layout

Container: mesmo `80rem` do projeto e mesmas margens `page-gutter`.
Povos: uma coluna abaixo de 640px, duas a partir de 640px e três em 1024px.
Cards de guia: uma coluna na base, três em 1024px. São cards estáticos.

Guias compactos: introdução com padding vertical 2rem; checklist antes
dos passos; grid de passos com gap 1rem e três colunas em 1024px.
Bloco final com foto e CTA: duas colunas em 768px; há ordem específica
de foto antes da ação no mobile quando `.learn-photo-before-cta` é aplicado.

## Elevation & Depth

Bordas e fundos claros estruturam a superfície. Cards de guia mudam borda
e sobem 1px em hover; links de povos também têm pequeno deslocamento.
Não adicionar a todos os cards a sombra global de produtos.

## Shapes

Card de povo com raio 1rem e foto 16:10 com raio 0,75rem. Nome sobre a foto
em etiqueta recortada, fundo de acento e foreground canônico. Cards de guia
têm raio 0,75rem e canto triangular verde. Ações dos guias: raio 0,5rem;
ação dos povos: pílula. Imagens dos passos compactos: 16:9.

## Components

- **Povos:** foto, nome, resumo, contexto e link; não há acordeão ou painel expansível.
- **Slots de imagem:** respeitam caminhos locais e existência dos arquivos;
  não pressupor que todas as fotos estejam ausentes nem preenchidas.
- **Primeiro Rapé:** passo 2 usa contain sobre branco; passo 3 usa posição `center 28%`.
- **Guia:** checklist, três passos e convite de coleção; preservar overrides finais do CSS.
- **Foco:** contorno verde 2px com offset 3px dentro de Aprenda.
- **Movimento reduzido:** remove transições e deslocamentos dos seletores definidos.

## Do's and Don'ts

- Do preservar Proxima Nova, tokens globais e cores contextuais dos povos.
- Do conferir o fim de `aprenda.css`: regras compactas substituem regras anteriores.
- Do usar [contratos de assets](../../public/assets/aprenda/README.md) como especificações de produção e conferir recortes no CSS.
- Don't reconstruir expansores ou faixas descritos em versões antigas.
- Don't aplicar a geometria de Aprenda a toda a loja.
- Don't inventar atribuições de origem, efeitos ou significados culturais para as cores.
