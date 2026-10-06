# Padrão de espaçamento

## Separação entre seções da homepage

A distância externa entre duas seções consecutivas da homepage é controlada
exclusivamente pelo token CSS `--home-section-gap`.

| Contexto | Distância |
| --- | --- |
| Desktop | até `24px` |
| Tablet e mobile | `16px` |

Implementação atual:

```css
:root {
  --home-section-gap: clamp(1rem, 2vw, 1.5rem);
}

.home-page-flow > section + section {
  margin-top: var(--home-section-gap);
}
```

O espaço revela a superfície branca `--white`, mantendo a distância sem criar
uma faixa colorida entre as seções.

Exceção atual: a faixa de benefícios pertence visualmente ao Hero e fica
encostada diretamente nele. Essa relação é localizada por
`.home-hero + .benefits-strip { margin-top: 0; }` e não altera o intervalo das
demais seções.

## Regra de manutenção

- Não aplicar margens isoladas entre seções da homepage.
- Não usar o padding interno de uma seção para simular a separação externa.
- Usar `--section-space-compact`, `--section-space-standard` e
  `--section-space-major` somente para o respiro interno dos blocos.
- Uma exceção visual deve ser explícita, localizada e documentada; o padrão
  continua sendo `--home-section-gap`.

## Filtros ativos do catálogo

- Categorias, estoque, oferta e faixa de preço compartilham um único grupo.
- Usar `gap` entre os chips e `--group-space-medium` como margem inferior do grupo.
- Não aplicar margem inferior em cada chip, pois ela se acumula nas quebras de linha.
- Quando não houver filtros ativos, não renderizar o grupo nem reservar seu espaço.

## Áreas de toque

- Os botões de quantidade da sacola e do painel lateral usam `2.75rem` nos dois eixos.
- Até `800px`, os links de navegação do rodapé têm largura e altura mínimas de `2.75rem`.
- O tamanho visual dos textos e símbolos permanece independente da área acionável.
