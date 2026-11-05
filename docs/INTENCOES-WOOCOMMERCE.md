# Intenções editoriais e integração WooCommerce

## Entrega

- `/intencoes/` apresenta oito temas editoriais, incluindo Força e coragem, e suas páginas individuais.
- Índice e oito subpáginas usam Proxima Nova em títulos, textos, sidebar e navegação inferior. Títulos individuais têm peso 800, a navegação inferior peso 600 e a contagem de produtos fica subordinada ao h1. No índice em celular, títulos dos cards usam 1rem e descrições 0,875rem, respeitando a escala de texto do navegador.
- `/questionario/` concentra a escolha guiada e abre diretamente na primeira pergunta. O fluxo é intenção → experiência → resultado, com cinco perfis já definidos em `lib/rituals-data.ts`. O índice de Intenções, a home e o produto levam a essa mesma rota por “Responder ao questionário”. O índice não repete o banner nem o questionário. Home e produto preservam o convite visual; o catálogo para as sugestões é carregado na página do questionário.
- No questionário, os oito cards aparecem juntos, em quatro colunas no desktop e duas no celular, sem carrossel e sem etiquetas sobre as imagens. Os cinco perfis guiados continuam para experiência e resultado. Foco e clareza, Energia e renovação e Oração e cerimônia usam os mesmos cards e abrem o catálogo: não há curadoria por experiência definida para esses temas. As opções de experiência ficam uma acima da outra no celular. `intentionSlug` liga os resultados às páginas editoriais, sem alterar recomendações ou classificação no WooCommerce.
- Nomes, descrições e quebras dos cards vêm de lib/intencoes.ts, compartilhados com o índice e as páginas individuais. Os nomes usam a conjunção e, sem o símbolo &.
- O resultado oferece acesso à página da intenção. O link “Explorar todas as intenções” permite sair do questionário para os oito temas editoriais. Atualizar a página reinicia o questionário; as respostas não são persistidas.
- O índice usa Proxima Nova, introdução em duas colunas, convite explicando o questionário e ações verdes nos cards com hover/foco laranja. A abertura e a grade compartilham largura máxima de 72rem, com quatro colunas no desktop e duas em tablet/celular, fotografias verticais 3:4 e CTAs de pelo menos 44px no celular. Os textos fluem sem quebras forçadas.
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
