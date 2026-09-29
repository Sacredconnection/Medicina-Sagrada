# Imagens das páginas de etnias do Rapé

Esta pasta recebe exclusivamente os banners panorâmicos exibidos atrás do texto de introdução nas páginas de etnias dentro de Rapé. Categorias gerais como Rapé, Sananga, Incensos e Acessórios não usam estes arquivos.

## Especificações

- Nome: `medicina-sagrada-etnia-{slug}-banner.webp`
- Tamanho: **3840 × 1080 px**
- Formato: WebP com transparência (alpha), perfil sRGB
- Peso recomendado: até **900 KB**
- Composição: use todo o canvas horizontal; a arte transparente ocupa a largura da tela e fica atrás do texto, com os elementos visuais concentrados nas laterais para preservar a leitura
- Margem segura recomendada para elementos importantes: **120 px** em todos os lados
- Exibição: desktop e tablet, a partir de **768 px**
- Fundo abaixo da imagem: branco, aplicado pelo próprio layout

## Arquivos previstos

```text
medicina-sagrada-etnia-rape-apurina-banner.webp
medicina-sagrada-etnia-caboclo-banner.webp
medicina-sagrada-etnia-huni-kuin-banner.webp
medicina-sagrada-etnia-katukina-banner.webp
medicina-sagrada-etnia-kuntanawa-banner.webp
medicina-sagrada-etnia-nukini-banner.webp
medicina-sagrada-etnia-puyanawa-banner.webp
medicina-sagrada-etnia-shanenawa-banner.webp
medicina-sagrada-etnia-shawadawa-banner.webp
medicina-sagrada-etnia-yawanawa-banner.webp
```

O código verifica a existência e a data de modificação do arquivo antes de renderizá-lo. Ao substituir uma arte mantendo o mesmo nome, a versão da URL é atualizada automaticamente para impedir que o Next.js ou o navegador continuem exibindo o banner antigo. Enquanto uma arte não for adicionada, a página permanece sem imagem quebrada e sem reservar espaço vazio para ela.

Arquivos antigos terminados em `-desktop.webp` são mantidos apenas como referência e não são carregados pelo novo layout.
