# CSS e direção visual

Revisão: **26/10/2026**.

Este documento conecta o sistema visual registrado em [DESIGN](../DESIGN.md)
à implementação CSS atual. Ele não cria uma identidade nova: descreve arquivos,
tokens, organização, responsividade e regras já presentes no projeto.

## Fontes de autoridade

| Fonte | Responsabilidade |
| --- | --- |
| `DESIGN.md` | Direção visual, tokens normativos e comportamento dos componentes |
| `.impeccable/design.json` | Motion, sombras, breakpoints e amostras complementares |
| `app/globals.css` | Base global, comércio, home, páginas, componentes e responsividade |
| `app/aprenda/aprenda.css` | Sistema local das páginas Aprenda e guias |
| `lib/ethnicity-colors.ts` | Cores e foregrounds canônicos das etnias |
| `public/assets/**/README.md` | Dimensões, nomes e uso esperado dos assets |

Em divergência, confira primeiro o CSS e o componente realmente renderizado.
Depois atualize DESIGN e a documentação na mesma entrega.

## Arquitetura do CSS

O projeto usa CSS próprio, sem Tailwind ou biblioteca externa de componentes.
`app/globals.css` concentra o sistema global. A ordem atual segue estes blocos:

1. tokens `:root` e estilos comerciais;
2. reset e base tipográfica;
3. header, navegação e ações compartilhadas;
4. home e suas seções;
5. newsletter;
6. cards, catálogo e produto;
7. páginas institucionais e editoriais;
8. footer e diagnóstico;
9. ajustes responsivos e menus expandidos.

`app/aprenda/aprenda.css` é carregado pela superfície Aprenda e mantém regras
locais. Não promover automaticamente uma composição de Aprenda a regra global.

## Tokens globais

Valores exatos: [Guia geral](GUIA-GERAL.md). Referências, literais locais e
condições de mídia: [Inventário visual](INVENTARIO-VISUAL.json). A documentação
inclui somente tokens globais com referência de uso no código.

Os valores normativos completos estão no frontmatter de `DESIGN.md`. No CSS,
os grupos principais são:

### Cores

As cores principais fixas são #1A4020 e #EF4929. Outros verdes e cores de etnias
são somente apoios. Consulte a [paleta e tipografia vigentes](PALETA-E-TIPOGRAFIA.md).

Verde principal: **`#1a4020`**, token `--forest-800`. A barra do header usa
esse token; bordas translúcidas correspondentes usam RGB `26, 64, 32`.
Logo, favicon e tema do navegador estão alinhados ao mesmo HEX.
Laranja principal: **`#ef4929`**, compartilhado por `--brand-orange` e
`--cta-accent`; as transparências correspondentes usam RGB `239, 73, 41`.
Fundos verdes das seções usam `--forest-800`. Na introdução do Ritual Finder,
o pseudo-elemento sobre a textura usa `color-mix()` com 88% desse mesmo verde;
o gradiente antigo de outros tons foi removido.

| Grupo | Tokens | Uso principal |
| --- | --- | --- |
| Floresta | `--forest-950`, `--forest-900`, `--forest-800`, `--forest-650` | Fundos profundos, texto de marca, compra, links e foco |
| Vegetação | `--leaf-400` | Apoio natural e detalhes editoriais |
| Acentos quentes | `--clay-500` | Apoio contextual |
| Neutros | `--paper`, `--paper-deep`, `--line`, `--ink`, `--muted`, `--white` | Superfícies, divisórias e texto |
| Marca e ação | `--brand-orange`, `--cta-accent`, `--cta-on-accent`, `--brand-text` | Marca, CTA editorial, hover e labels |

O verde permanece a cor funcional da compra. O laranja é usado de forma
contextual em ações editoriais e estados definidos; não deve substituir todos
os CTAs por uma regra genérica.

### Tipografia

- família principal: `--font-primary`, com Proxima Nova e fallbacks de sistema;
- pesos globais referenciados: 400, 500, 600, 700, 800 e 900;
- corpo e UI: `--type-body`, `--type-body-small`, `--type-ui`, `--type-label` e
  `--type-caption`;
- títulos: `--type-section-title`, `--type-subsection-title` e
  `--type-card-title`;
- ações: `--type-action` e `--type-action-compact`.

Georgia é a exceção local para títulos principais, títulos de cards e navegação
anterior/próximo de intenções. O `body` usa a família principal. Títulos globais têm tracking negativo e
largura controlada. Valores comerciais usam `font-variant-numeric: tabular-nums`
quando o alinhamento de preço ou quantidade precisa permanecer estável.

### Layout e espaçamento

| Token | Papel |
| --- | --- |
| `--max-width: 80rem` | Limite do container principal |
| `--reading-width: 68ch` | Largura de leitura editorial |
| `--page-gutter` | Margem horizontal responsiva |
| `--section-space-compact` | Seção curta |
| `--section-space-standard` | Ritmo padrão |
| `--section-space-major` | Separação ampla |
| `--group-space-medium/large` | Ritmo interno de grupos |
| `--home-section-gap` | Intervalo externo entre seções da home |
| `--sticky-offset` | Compensação de elementos sticky |

O container canônico é:

```css
.container {
  width: min(calc(100% - (var(--page-gutter) * 2)), var(--max-width));
  margin-inline: auto;
}
```

Não somar margens avulsas ao intervalo da home sem conferir
[Espaçamento](ESPACAMENTO.md).

### Forma e profundidade

- `--radius: 0.75rem` é a referência para superfícies e cards;
- `--shadow` é a sombra ampla de superfícies elevadas;
- campos e ações comerciais usam raios menores definidos no próprio componente;
- pílulas aparecem em ações editoriais específicas;
- bordas `--line` estruturam campos, listas e áreas comerciais.

Sombras não são aplicadas universalmente. Cards de produto ganham elevação em
hover/foco; campos e blocos comerciais normalmente dependem de borda e contraste.

## Base visual e acessibilidade

- `box-sizing: border-box` é global;
- `html` usa rolagem suave;
- links herdam cor e não recebem sublinhado global;
- `:focus-visible` usa contorno de `0.2rem` em `--cta-accent`, com offset;
- controles importantes usam altura mínima próxima de 44px/2.75rem;
- regras de hover são preferencialmente limitadas por `@media (hover: hover)`;
- animações relevantes possuem tratamento para `prefers-reduced-motion`.

Não remover foco visível para resolver aparência. Ajuste o foco local apenas
quando o componente já oferece uma alternativa com contraste equivalente.

## Componentes visuais principais

### Header e navegação

O header é branco, sticky e separado do conteúdo por uma barra verde. Desktop
usa navegação central; até 1000px, a marca fica centralizada e o menu passa ao
componente mobile. A mesma lista de dados alimenta as duas apresentações.

### Botões editoriais

As classes `.button` e variantes usam contorno e preenchimento animado por
pseudo-elemento. O estado em repouso depende do fundo da seção; hover e foco
podem preencher com `--cta-accent`. Preserve os estados de repouso, hover,
foco, active e reduced motion ao alterar esse padrão.

### Controles comerciais

`.commerce-button`, campos, selects e controles de quantidade usam verde,
superfície branca, borda fina e cantos menores. Estados disabled mantêm
legibilidade e impedem interação. Erro e sucesso têm tratamento próprio.

### Cards de produto

O card inteiro é clicável. A imagem ocupa mídia quadrada; corpo reúne categoria,
nome, intenções editoriais quando disponíveis, preço e CTA na base.
O botão do card usa `--forest-800` (`#1a4020`) em repouso, incluindo home,
catálogo e relacionados. Hover e foco usam o laranja oficial `#ef4929`. Em desktop
com hover, borda, sombra e deslocamento sinalizam interação. Foco por teclado
possui tratamento equivalente.

### Produto e galeria

A página prioriza fotografia ampla e sequência de compra clara. A imagem
principal é interativa, as miniaturas mantêm navegação por teclado e o diálogo
ampliado preserva foco/fechamento. Alterações devem ser verificadas em produto
simples, variável e sem imagem.

### Conteúdo rico

`.rich-text` controla ritmo de parágrafos, títulos, listas, citações e embeds.
HTML vem do CMS e é sanitizado antes da renderização. Evite seletores que
dependam de uma estrutura perfeita ou de um único editor WordPress.

### Aprenda

Aprenda possui tokens locais `--learn-*`, cards e grids próprios. A grade de
povos muda para duas colunas em 640px e três em 1024px. Guias internos mudam de
composição em 768px e 1024px. Consulte também o registro atualizado
em `app/aprenda/DESIGN.md`.

## Responsividade

Os breakpoints são definidos por componente, não por uma escala global única.
Os pontos mais recorrentes são:

| Faixa | Mudanças comuns |
| --- | --- |
| `1100px` | Grades e navegação começam a compactar |
| `1000px` | Header muda para navegação mobile |
| `900px` | Catálogo, newsletter e layouts intermediários se reorganizam |
| `800px` / `767px` | Seções passam para uma coluna e tipografia reduz |
| `760px` / `700px` | Carrosséis, filtros e grades comerciais se adaptam |
| `600px` / `550px` / `520px` | Formulários, sacola e páginas institucionais empilham |
| `390px` / `360px` | Ajustes para telefones estreitos |

Ao alterar um componente, revise somente os breakpoints que realmente o afetam.
Não crie um breakpoint novo quando um existente atende ao mesmo comportamento.

## Estados que precisam ser preservados

Cada alteração visual deve considerar, quando aplicável:

- carregando, vazio, erro e sucesso;
- repouso, hover, focus-visible, active e disabled;
- produto simples, variável, esgotado e em oferta;
- menu fechado e aberto;
- sacola vazia, preenchida e com falha;
- imagem ausente ou indisponível;
- texto curto, longo e vindo do CMS;
- desktop, tablet e mobile;
- `prefers-reduced-motion: reduce`.

## Como alterar CSS com segurança

1. Localize o componente e todos os seletores correspondentes.
2. Verifique tokens existentes antes de adicionar cor, tamanho ou espaçamento.
3. Preserve a intenção visual e faça a menor alteração capaz de resolver o alvo.
4. Evite `!important`; corrija escopo ou especificidade na origem.
5. Não use seletores globais para resolver um caso local.
6. Mantenha estilos de Aprenda no arquivo local quando não forem compartilhados.
7. Atualize `DESIGN.md` apenas quando a regra do sistema mudar, não para ajustes
   isolados de uma página.
8. Valide a rota em 1440px, 768px quando pertinente e 390px.

## Checklist visual

- [ ] Sem overflow horizontal.
- [ ] Header, conteúdo e footer mantêm o mesmo container.
- [ ] Hierarquia de títulos permanece clara.
- [ ] Texto editorial não excede a largura confortável de leitura.
- [ ] CTA correto mantém cor e comportamento em todos os estados.
- [ ] Foco por teclado está visível.
- [ ] Áreas de toque permanecem adequadas no mobile.
- [ ] Imagens preservam proporção, recorte e texto alternativo.
- [ ] Loading, erro, vazio e disabled não quebram o layout.
- [ ] Reduced motion não mantém animações essenciais desnecessárias.
- [ ] A mudança foi conferida na rota e no elemento exatos solicitados.

## Validação técnica

Depois de mudanças visuais:

```powershell
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run build
```

Os testes não substituem inspeção visual. Capturas temporárias devem permanecer
em `artifacts/` ou `output/`, que não são fontes normativas do design.

