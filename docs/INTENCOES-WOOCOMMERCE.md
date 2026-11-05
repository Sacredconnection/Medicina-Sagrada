# Intenções editoriais e integração WooCommerce

## Entrega

- `/intencoes/` apresenta oito temas editoriais, incluindo Força e coragem, e suas páginas individuais.
- Índice e oito subpáginas usam Proxima Nova em títulos, textos, sidebar e navegação inferior. Títulos individuais têm peso 800, a navegação inferior peso 600 e a contagem de produtos fica subordinada ao h1. No índice em celular, títulos dos cards usam 1rem e descrições 0,875rem, respeitando a escala de texto do navegador.
- A página reutiliza `ProductMatcher`, o mesmo componente da home. A escolha mostra os oito temas em cards compactos: quatro colunas no desktop, duas em larguras intermediárias e duas imagens verticais 4:5 por fila no celular, com nomes abaixo e sem carrossel. Os cinco perfis com curadoria continuam para experiência e ritual. Foco e clareza, Energia e renovação e Oração e cerimônia abrem diretamente suas páginas de produtos; não há curadoria por experiência definida para esses três temas. `intentionSlug` em `lib/rituals-data.ts` liga cada perfil à sua página editorial, com os mesmos nomes usados nas páginas.
- Nomes, descrições e quebras dos cards vêm de lib/intencoes.ts, compartilhados com o índice e as páginas individuais. Os nomes usam a conjunção e, sem o símbolo &.
- O resultado da jornada oferece acesso à página da intenção; a introdução permite explorar os oito temas.
- O índice usa Proxima Nova, introdução em duas colunas, CTA editorial com contorno laranja e ações verdes nos cards com hover/foco laranja. A grade centralizada tem largura máxima de 64rem no desktop, quatro colunas e duas em tablet/celular, com fotografias verticais 3:4 e CTAs de pelo menos 44px no celular.
- Todas as imagens dos cards de intenção usam o mesmo traçado interno branco de 1px, inclusive no índice e nos cards verticais da jornada no celular. O traçado fica mais evidente em hover/foco; o recuo acompanha o tamanho da imagem.
- Imagens dos cards em `public/assets/intentions/`, com mapa em `lib/intencoes.ts` e instruções no README da pasta. Cinco fotos foram reaproveitadas da jornada. Foco e clareza, Energia e renovação e Oração e cerimônia têm arquivos WebP temporários identificados; basta substituí-los mantendo os nomes.
- Força e coragem usa o slug `forca-e-coragem`. Sua página só lista produtos que já tenham esse termo nos atributos públicos; esta alteração não cadastra termos nem reclassifica produtos no WooCommerce.
- Para preencher essa intenção, a seleção de seis rapés e o cadastro proposto estão no [repasse de Força e coragem](FORCA-E-CORAGEM-REPASSE.md). A execução foi delegada por Danilo ao responsável pelo WooCommerce e está pendente.
- Cada página busca produtos na Store API e os relaciona por intenção principal ou secundária.
- Os cards e fichas de produto mostram as classificações cadastradas e levam às páginas do tema.
- O filtro “Buscar por intenção” (`intencao`) inclui correspondências na intenção principal ou nas secundárias, com paginação. Links antigos com filtros separados continuam compatíveis.
- Os cartões mostram uma intenção resumida; a ficha exibe todas junto ao título. A explicação extensa do tema fica em “Sobre esta intenção”.
- O site revalida o catálogo a cada 15 minutos. Falha de leitura mostra aviso e ação de nova tentativa; uma resposta vazia mostra estado vazio.
- Os textos descrevem linguagem editorial e não prometem resultados nem indicam segurança.

## Vínculo dos dados

O ID de produto no arquivo de origem pertence a outro site e não é usado. A chave é o SKU: `RA` no início do SKU da planilha vira `MS`; o restante permanece idêntico. O SKU transformado precisa corresponder exatamente a um SKU único no WooCommerce. O ID WooCommerce é lido do produto encontrado pela API e usado apenas como destino da gravação.

Na auditoria do workbook de 82 registros, 54 SKUs corresponderam a um produto único e 28 não foram encontrados. Dos 54, 51 tinham intenção de alta confiança, fonte e página, sem sinalização de revisão; três permanecem pendentes. Exceções de revisão continuam fora do catálogo de intenções. Conferir o relatório detalhado em `artifacts/intention-join-audit.json`.

## Campos cadastrados

| Informação | WooCommerce | Exibição |
| --- | --- | --- |
| Intenção principal | Atributo global `pa_intencao-principal` | Pública |
| Intenções secundárias | Atributo global `pa_intencoes-secundarias` | Pública |
| Fonte, página e SKU de origem | Relatório interno da importação | Não expor |

Os dois atributos globais não criam variações. A atualização preserva atributos de peso, opções de compra, preço, estoque e variações. Não foram importados intensidade, características ou estado de tabaco; a planilha não confirma critérios suficientes para as funcionalidades comerciais sobre produtos sem tabaco.

## Importação e validação

O importador `scripts/apply-intention-attributes.mjs` valida a regra exata de SKU, produto publicado, fonte e termos, mescla apenas os atributos previstos e registra estado anterior/proposto e resultado em `artifacts/intention-import-before.json` e `artifacts/intention-import-result.json`. A execução registrou os 51 candidatos elegíveis: 50 gravações nesta rodada e um produto previamente cadastrado e validado. As 50 gravações foram confirmadas pela API.

As intenções são lidas da Store API pública; metadados internos não são incluídos. A verificação pública de `MSAP01` confirmou os novos termos e que o atributo Peso continua sendo uma variação.

## Limites desta etapa

- O escopo não confirma presença ou ausência de tabaco; portanto não há filtro nem comparação comercial por esse critério.
- Não houve backup, ambiente de homologação, teste de restauração ou publicação de deploy neste trabalho.
- O build de produção gerou páginas para os sete temas com produtos reais após receber acesso à API.
