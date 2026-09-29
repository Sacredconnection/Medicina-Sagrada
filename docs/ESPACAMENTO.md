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
