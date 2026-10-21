# Intenções editoriais e integração WooCommerce

## Entrega

- `/intencoes/` apresenta os sete temas editoriais e suas páginas individuais.
- Cada página busca produtos na Store API e os relaciona por intenção principal ou secundária.
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
