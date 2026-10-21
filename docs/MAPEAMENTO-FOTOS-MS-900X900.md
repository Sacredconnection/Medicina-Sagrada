# Mapeamento preliminar — Fotos-MS-900x900

Status: somente mapeamento. Nenhuma imagem foi extraída, enviada ou substituída.

Fonte: `C:\Users\danie\Downloads\Fotos-MS-900x900.rar`

## Resumo

- 240 imagens `.webp` válidas.
- 63 famílias de produtos.
- 10 grupos/povos: Caboclo, Huni Kuin, Katukina, Kuntanawa, Nukini, Puyanawa, Shanenawa, Shawãdawa, Yawanawa e Apurinã.
- Padrão encontrado: uma imagem `FAMILIA` para a foto principal/identidade do produto e imagens `MEMBROS` para as opções de 10g, 20g e 50g.
- Arquivos `desktop.ini` foram desconsiderados.

## Regra de mapeamento proposta

| Arquivo no RAR | Uso WooCommerce proposto |
|---|---|
| `900x900-FAMILIA-{POVO}-{PRODUTO}.webp` | imagem destacada/principal do produto |
| `900x900-MEMBROS-{POVO}-{PRODUTO}-10g.webp` | galeria ou variação 10g |
| `900x900-MEMBROS-{POVO}-{PRODUTO}-20g.webp` | galeria ou variação 20g |
| `900x900-MEMBROS-{POVO}-{PRODUTO}-50g.webp` | galeria ou variação 50g |

As imagens `MEMBROS` não serão associadas automaticamente a variações até confirmar se 10g/20g/50g são variações reais no WooCommerce ou somente fotos de catálogo.

## Correspondências de alta confiança

As famílias abaixo têm correspondência nominal direta com produtos públicos do WooCommerce:

| Grupo | Família do RAR | Produto WooCommerce provável | Ação prevista |
|---|---|---|---|
| Caboclo | Flor de Jaci | Rapé Caboclo – Flor de Jaci | principal + galeria |
| Huni Kuin | Tradição | Rapé Huni Kuin – Tradição | principal + galeria |
| Huni Kuin | Emburana | Rapé Huni Kuin – Emburana | principal + galeria |
| Huni Kuin | 7 Ervas | Rapé Huni Kuin – 7 Ervas | principal + galeria |
| Huni Kuin | Capemba | Rapé Huni Kuin – Capemba | principal + galeria |
| Huni Kuin | Canela de Velho | Rapé Huni Kuin – Canela de Velho | principal + galeria |
| Katukina | Sonhos Sagrados | Rapé Katukina – Sonhos Sagrados | principal + galeria |
| Katukina | Nisural | Rapé Katukina – Nisural | principal + galeria |
| Katukina | Cactus | Rapé Katukina – Cactus | principal + galeria |
| Kuntanawa | Sananga | Rapé Kuntanawa – Sananga | principal + galeria |
| Kuntanawa | Kawãnayrû | Rapé Kuntanawa – Kawãnayrû | principal + galeria |
| Kuntanawa | Tetê Pawã | Rapé Kuntanawa – Tetê Pawã | principal + galeria |
| Kuntanawa | Flor de Samaúma | Rapé Kuntanawa – Flor de Samaúma | principal + galeria |
| Kuntanawa | Cidoca | Rapé Kuntanawa – Cidoca | principal + galeria |
| Kuntanawa | Própolis | Rapé Kuntanawa – Propólis | principal + galeria |
| Nukini | Rawni | Rapé Nukini – Rawni | principal + galeria |
| Nukini | Gelzinho | Rapé Nukini – Gelzinho | principal + galeria |
| Nukini | Limpeza Astral | Rapé Nukini – Limpeza Astral | principal + galeria |
| Nukini | Fresh | Rapé Nukini – Fresh (Eucalipto) | principal + galeria |
| Nukini | Elixir | Rapé Nukini – Elixir | principal + galeria |
| Puyanawa | Pixuri | Rapé Puyanawa – Pixuri | principal + galeria |
| Shawãdawa | Relax | Rapé Shawãdawa – Relax | principal + galeria |
| Yawanawa | Cacique | Rapé Yawanawa – Cacique | principal + galeria |

## Correspondências pendentes de validação

As famílias abaixo existem no RAR, mas não tiveram correspondência inequívoca por nome no catálogo público consultado. Podem ser produtos sem estoque, produtos com outro nome, produtos ainda não publicados ou novas inclusões:

| Grupo | Famílias |
|---|---|
| Caboclo | Verdinho da Floresta; Rosa Branca; Paricá; Marachimbó; Gesileu Tradicional; Gesileu; Croa |
| Huni Kuin | Uxi; Paricá; Ninawá Pai da Mata; Murici; Cumaru; Cacau; Baimuka |
| Kuntanawa | Veia do Pajé; Menta; Jarina; Capim Santo; Cacique; Apuxuri; Alfavaca da Mata |
| Nukini | Sansara; Pitaica; Onça; Mulata; Cumaru Trevo |
| Puyanawa | Jagube |
| Shanenawa | Caneleiro |
| Shawãdawa | Rawaputu; Kapayuba |
| Yawanawa | Tsunu; Runu; Pai Nani; Mulateiro; Força Feminina; Esperanza |
| Apurinã | Awiry — os arquivos aparecem sem subpasta de produto no RAR |

## Pontos que exigem confirmação antes da troca

1. Se a imagem `FAMILIA` deve ser a imagem destacada e as três imagens `MEMBROS` devem entrar na galeria.
2. Se 10g, 20g e 50g são variações existentes no WooCommerce.
3. Como tratar famílias do RAR sem produto publicado ou com nome divergente.
4. Se produtos atuais fora desse conjunto — kits, incensos, kuripes, tepis, brincos e acessórios — devem permanecer com as fotos atuais.

Próximo passo seguro: validar a tabela contra o export completo do catálogo/variações do WooCommerce e, só depois, preparar um plano de substituição por ID de produto.
