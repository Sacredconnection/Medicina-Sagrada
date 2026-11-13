# Força e coragem — repasse para cadastro no WooCommerce

Preparado em 05/11/2026. **Pendente de execução pelo responsável pelo WooCommerce.**
Nenhuma classificação foi gravada nesta revisão. Danilo encaminhará esta etapa ao parceiro.

## Objetivo e causa da página vazia

A rota `/intencoes/forca-e-coragem/` já está pronta. Ela seleciona os produtos
pelos termos públicos de `pa_intencao-principal` e `pa_intencoes-secundarias`,
como as demais intenções. A classificação ainda não está cadastrada nesses
produtos. Não adicionar uma lista fixa apenas nessa página: o cadastro deve
alimentar também filtros, cards e fichas dos produtos.

## Seleção editorial revisada

Os seis produtos abaixo já fazem parte da curadoria `strength:beginner` ou
`strength:practitioner` em `lib/rituals-data.ts`. Foram encontrados novamente
na Store API pública de `medicinasagrada.com.br`, com correspondência exata
entre slug, SKU e ID. Todos constavam em estoque na consulta; estoque e preço
continuam sendo lidos do WooCommerce, sem valores fixos no frontend.

A inclusão combina essa curadoria existente com as descrições oficiais dos
produtos. **É uma associação editorial à intenção, não uma comprovação de
efeitos, promessa de coragem ou indicação baseada somente na intensidade.**
As afirmações terapêuticas presentes nas fontes não devem ser copiadas para
os textos do site como fatos comprovados.

| Produto | ID | SKU | Motivo editorial / fonte oficial | Cadastro proposto |
| --- | --- | --- | --- | --- |
| Rapé Xamânico — Tsunu Força | 3398 | MSSC10 | A descrição relaciona Tsunu à força espiritual; já integra a curadoria de firmeza. [Produto](https://medicinasagrada.com.br/product/rape-xamanico-tsunu-forca/) | Acrescentar **Força e coragem** às secundárias |
| Rapé Xamânico — Tsunu Extra | 3392 | MSSC08 | Apresentado pelo catálogo como “Rapé de força”; já integra a curadoria de praticantes. [Produto](https://medicinasagrada.com.br/product/rape-xamanico-tsunu-extra/) | Definir **Força e coragem** como principal, se continuar sem intenção cadastrada |
| Rapé Xamânico — Paricá | 3383 | MSSC05 | A descrição associa o preparo à força, vigor e aterramento; já integra a curadoria de praticantes. [Produto](https://medicinasagrada.com.br/product/rape-xamanico-parica/) | Acrescentar **Força e coragem** às secundárias |
| Rapé Caboclo — Paricá | 39 | MSCO05 | A descrição associa a preparação à força e ao vigor; já integra a curadoria de praticantes. [Produto](https://medicinasagrada.com.br/product/caboclo-parica/) | Acrescentar **Força e coragem** às secundárias |
| Rapé Huni Kuin — Murici | 46 | MSHK09 | A descrição menciona força para agir e disposição; já é candidato da curadoria dessa intenção. [Produto](https://medicinasagrada.com.br/product/huni-kuin-murici/) | Acrescentar **Força e coragem** às secundárias |
| Rapé Yawanawa — Esperanza | 305 | MSYA01 | A descrição atribui ao Tsunu fortalecimento do trabalho espiritual; sua inclusão é nesse contexto editorial, não como promessa de força física. [Produto](https://medicinasagrada.com.br/product/yawanawa-esperanza/) | Acrescentar **Força e coragem** às secundárias |

## Como executar preservando o catálogo

1. Conferir novamente os seis IDs, SKUs, slugs e o status publicado no WooCommerce.
   Os IDs são do catálogo atual, não de uma planilha externa.
2. Conferir os atributos globais: **Intenção principal**, ID 27,
   `pa_intencao-principal`; **Intenções secundárias**, ID 28,
   `pa_intencoes-secundarias`. Confirmar esses IDs antes de qualquer escrita.
3. Criar ou reutilizar o termo **Força e coragem**, slug **`forca-e-coragem`**,
   nos atributos em que será utilizado. Não criar um atributo novo nem duplicar
   termos já existentes. Os IDs dos termos são diferentes em cada atributo.
4. Nos cinco produtos que já têm principal, manter a principal e todas as
   secundárias existentes, acrescentando o novo termo às secundárias.
5. No Tsunu Extra, confirmar que continua sem intenção principal e então definir
   a nova principal. Se alguém tiver cadastrado uma principal desde esta revisão,
   preservá-la e acrescentar Força e coragem como secundária.
6. Os atributos de intenção devem estar **visíveis**, com **variação desativada**.
   Não alterar Peso, composição, preço, estoque, variantes, descrição ou imagens.
7. Salvar o estado anterior e o proposto antes de gravar; reler cada produto após
   salvar. A operação deve ser idempotente, sem acrescentar o termo duas vezes.

Se usar REST API, seguir o padrão de validação e registro de
`scripts/apply-intention-attributes.mjs`, com seleção restrita a esses seis
produtos. **Não executar o importador antigo inteiro para esta tarefa:** ele
trata a planilha de sete intenções e pode sobrescrever secundárias.
Buscar os atributos completos e mesclar o termo antes do PUT: enviar apenas o
novo atributo no array `attributes` pode remover os demais.

## Conferência após o cadastro

- A Store API pública deve retornar o slug `forca-e-coragem` como principal ou
  secundária nos seis produtos, com os demais atributos preservados.
- `/intencoes/forca-e-coragem/` deve listar **6 produtos**, considerando a seleção
  desta revisão e sem outras inclusões posteriores.
- `/busca/?intencao=forca-e-coragem` deve encontrar os mesmos seis e preservar
  paginação e demais filtros.
- A ficha de cada produto deve mostrar a intenção e seu link para a página.
- Conferir que os produtos continuam nas intenções anteriores e que Peso,
  preço, estoque e variações permanecem inalterados.
- O frontend revalida o catálogo em até 15 minutos. Para conferir imediatamente,
  usar a revalidação já configurada do projeto ou aguardar o cache expirar.
  Cadastro no WooCommerce e publicação do frontend são etapas distintas.

Evidência local desta revisão: `artifacts/strength-intention/catalog-before.json`,
com os seis registros públicos consultados. Esse arquivo não contém credenciais;
é uma captura datada, não uma fonte atualizada de estoque.
