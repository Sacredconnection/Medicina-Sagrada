# Paleta de cores e tipografia — Medicina Sagrada

Referência visual vigente, gerada a partir dos estilos e componentes locais pelo comando de documentação. Aprovação das cores principais: Danilo Gravina Dalla Paula, 26/10/2026.

Leitura: cores principais → apoios e neutros → etnias → tipografia. O [inventário técnico](INVENTARIO-VISUAL.json) concentra declarações CSS, transparências e media queries; ele não define cores adicionais de marca nem comprova que cada seletor está renderizado.

## 1. Cores principais fixas

**Verde principal: #1A4020. Laranja principal: #EF4929.** Estas são as duas cores principais do site e ficam fixadas. Não aproximar o HEX, não substituí-las por tons de apoio e não gerar variantes como novas cores principais. Uma revisão exige nova orientação explícita de Danilo.

| Cor principal | HEX | Tokens em uso |
| --- | --- | --- |
| Verde principal | `#1A4020` | `--forest-800` |
| Laranja principal | `#EF4929` | `--clay-500`, `--brand-orange`, `--cta-accent`, `--brand-text` |

Tokens diferentes com o mesmo HEX são aliases de aplicação, não cores adicionais. Títulos pequenos acima dos títulos principais, incluindo “Recomendações da Medicina Sagrada”, usam o laranja principal. Categorias do header usam o verde principal em repouso. Os indicadores “Deslize para ver mais” e “Deslize para ver os vídeos” mantêm os cinzas de apoio; na seção verde dos kits, o texto mantém branco com transparência. O traço decorativo mantém o laranja principal. Estados de interação conservam as regras do componente.

## 2. Verdes de apoio, neutros e texto

Todos os demais verdes são apoios. Não representam alternativas às duas cores principais e não autorizam recolorir o site. Permanecem somente nos contextos já implementados.

| Token | HEX | Aplicação atual |
| --- | --- | --- |
| `--forest-950` | `#0B261D` | Apoio profundo: títulos, mídia e estados de controles |
| `--forest-900` | `#12372A` | Apoio profundo: títulos de cards de intenções e mídia |
| `--forest-650` | `#3B6F52` | Apoio médio: “relações de respeito.”, newsletter, contornos e foco |
| `--leaf-400` | `#9BB978` | Apoio claro: seleção de texto, marcadores e foco |
| `--paper` | `#FFFFFF` | Neutro: fundo geral |
| `--paper-deep` | `#EBE7D9` | Neutro quente: fundos leves e controles |
| `--line` | `#D9D6C7` | Neutro: bordas e divisórias |
| `--ink` | `#14251D` | Texto principal de apoio |
| `--muted` | `#68736B` | Texto secundário de apoio |
| `--white` | `#FFFFFF` | Neutro: superfícies e texto invertido |
| `--header-white` | `#FFFFFF` | Neutro: fundo do header |
| `--cta-on-accent` | `#06140F` | Texto escuro sobre preenchimento laranja |

Preenchimentos laranja de ações usam o foreground de cada componente; a documentação registra o uso atual, sem afirmar conformidade de contraste para todos os pares.

## 3. Cores de apoio das etnias

| Povo / identidade | Acento de apoio | Texto sobre acento |
| --- | --- | --- |
| Apurinã | `#83BC43` | `#000000` |
| Caboclo | `#997052` | `#000000` |
| Huni Kuin | `#BFA771` | `#000000` |
| Katukina | `#79BC43` | `#000000` |
| Kuntanawa | `#606161` | `#FFFFFF` |
| Nukini | `#DC9C41` | `#000000` |
| Puyanawa | `#BA9B80` | `#000000` |
| Shanenawa | `#0568A7` | `#FFFFFF` |
| Shawãdawa | `#EC2326` | `#000000` |
| Yawanawá | `#2F2F2A` | `#FFFFFF` |

As cores dos povos são contextuais e não são cores principais da Medicina Sagrada. Usar somente quando o povo está explicitamente identificado nos dados. Preservar os pares de texto da tabela. Não inferir origem por descrição livre nem atribuir simbolismo cultural oficial a essas associações.

## 4. Tratamentos locais

Estados de erro e sucesso, fundos de mídia e detalhes de componentes têm regras locais. Consulte o [inventário técnico](INVENTARIO-VISUAL.json) e a cascata do componente quando precisar alterá-los. Essas declarações ficam fora da paleta de marca; não reutilize uma cor isolada como novo token global.

Sombras, overlays fotográficos e fundos discretos também usam RGBA, gradientes e misturas de cores já presentes. Transparência é um tratamento do componente, não uma nova cor principal. Fórmulas exatas: [inventário visual](INVENTARIO-VISUAL.json). Não extrair uma nova paleta das fotografias.

## 5. Vetores referenciados pela interface

| Arquivo | Cores literais presentes |
| --- | --- |
| `public/assets/logo/medicina-sagrada-logo-01.svg` | `#EF4929`, `#1A4020` |
| `public/assets/contato/simbolo-contato-fundo-claro.svg` | `#EF4929`, `#19401F` |
| `public/assets/partners/maya-herbs-logo.svg` | `#CC6632`, `#989836` |
| `public/assets/partners/sacred-connection-logo.svg` | `#268072` |

Somente SVGs com caminho referenciado no código entram nesta tabela; arquivos apenas armazenados em public não entram. As identidades de parceiros e os verdes existentes nos símbolos de contato são apoios dos respectivos assets. Não substituir suas cores pelas da marca. Cores dentro de fotografias, vídeos e bitmaps são conteúdo, não tokens de interface.

## 6. Famílias tipográficas

**Principal: Proxima Nova.** Stack: `"proxima-nova", "Segoe UI", "Avenir Next", Arial, sans-serif`. Adobe Fonts, kit `vjh7vll`, carregado por `components/adobe-fonts-stylesheet.tsx`. Os fallbacks são alternativas técnicas quando a fonte não carrega, não famílias de marca adicionais.

**Apoio editorial: Georgia.** Stack: `Georgia, "Times New Roman", serif`. Aplicação atual: títulos do índice e das páginas de intenções, títulos dos cards de intenção e navegação anterior/próximo. Corpo, catálogo, produto, header e Aprenda mantêm Proxima Nova.

## 7. Tamanhos e pesos em uso

| Token de tamanho | Valor CSS |
| --- | --- |
| `--type-body` | `1rem` |
| `--type-body-small` | `0.9375rem` |
| `--type-ui` | `0.875rem` |
| `--type-label` | `0.8125rem` |
| `--type-caption` | `0.75rem` |
| `--type-card-title` | `1.05rem` |
| `--type-section-title` | `clamp(2.35rem, 3.3vw, 3.25rem)` |
| `--type-subsection-title` | `clamp(1.45rem, 2.3vw, 2.2rem)` |
| `--type-editorial-body` | `1.125rem` |
| `--type-action` | `var(--type-label)` |
| `--type-action-compact` | `var(--type-caption)` |

Os valores em rem acompanham a configuração do navegador. Como referência, 1rem equivale a 16px quando a raiz está em 16px; 0,75rem = 12px, 0,8125rem = 13px, 0,875rem = 14px, 0,9375rem = 15px e 1,125rem = 18px.

| Token de peso | Peso |
| --- | --- |
| `--weight-regular` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |
| `--weight-extrabold` | 800 |
| `--weight-black` | 900 |

Corpo global: peso 400 e entrelinha 1,55. h1 global: peso 800 e entrelinha 0,94. Títulos globais usam tracking -0,035em. Labels de seção: 700, caixa alta e tracking 0,1em. Aprenda usa labels locais de 0,6875rem, peso 700 e tracking 0,12em. Títulos de intenções usam Georgia; o índice tem peso 400 e tracking -0,055em. Preços e quantidades usam números tabulares onde implementado.

## 8. Escalas de títulos por superfície

| Contexto | Tamanho | Entrelinha local | Seletor |
| --- | --- | --- | --- |
| h1 global | `clamp(2.75rem, 5.5vw, 5.5rem)` | `0.94` | `h1` |
| Hero principal | `herdado` | `0.94` | `.hero-title-primary` |
| Hero secundário | `clamp(1.8rem, 2.45vw, 2.65rem)` | `1.06` | `.hero-title-secondary` |
| Título de produto vigente | `clamp(2rem, 3.2vw, 3rem)` | `1.08` | `.product-page .product-summary h1` |
| Intenções: índice | `clamp(3rem, 8vw, 6.75rem)` | `0.98` | `.intentions-intro h1, .intention-detail h1` |
| Intenção: página individual | `clamp(2rem, 5vw, 3.5rem)` | `1.1` | `.intention-detail h1` |
| Intenções: cards | `clamp(1.5rem, 3vw, 2.2rem)` | `1.1` | `.intention-card-title` |
| Aprenda: índice | `herdado` | `1.06` | `.learn-intro h1` |
| Aprenda: guia | `herdado` | `herdado` | `.learn-guide-article .learn-intro h1` |
| Aprenda: h2 | `herdado` | `1.1` | `.learn-page h2` |

Os tamanhos fluidos e as media queries pertencem a cada componente. A escala de seção não substitui automaticamente todos os h2. As regras responsivas completas e os overrides estão no inventário; tabelas acima registram a base dos seletores nomeados.

## 9. Fontes de autoridade e manutenção

- Decisão de marca e limites: [PRODUCT](../PRODUCT.md).
- Contrato visual e componentes: [DESIGN](../DESIGN.md).
- Implementação: `app/globals.css`, `app/aprenda/aprenda.css` e `lib/ethnicity-colors.ts`.
- Extração técnica: [inventário](INVENTARIO-VISUAL.json), somente tokens globais com referência de uso no código.
- Guia do projeto: [Guia geral](GUIA-GERAL.md).

Execute `npm.cmd run docs:visual` para atualizar inventário e este documento; `npm.cmd run docs:visual:check` verifica os dois sem escrever. A extração não altera a interface. Não reintroduzir paletas de explorações, valores substituídos ou tokens sem referência na documentação vigente.
