# Documentação do projeto

Organização geral e visual: **27/10/2026**. Esta documentação descreve a implementação local. Consultas reais e testes registrados anteriormente conservam suas datas e não certificam a situação atual da loja.

## Ordem de leitura

1. [Guia geral](GUIA-GERAL.md): visão do projeto, composição, componentes e operação.
2. [Paleta e tipografia](PALETA-E-TIPOGRAFIA.md): cores e fontes vigentes, com os papéis de cada uma.
3. [DESIGN](../DESIGN.md): contrato visual para criar e manter interfaces.
4. [CSS e direção visual](CSS-E-DIRECAO-VISUAL.md) e [Espaçamento](ESPACAMENTO.md): implementação e composição.

As tabelas de identidade não incluem explorações antigas ou tokens sem referência no código. O inventário JSON é uma ferramenta técnica; suas declarações locais não constituem uma paleta de marca.

## Por onde começar

| Necessidade | Leitura |
| --- | --- |
| Consultar a paleta e a tipografia vigentes | [Paleta de cores e tipografia](PALETA-E-TIPOGRAFIA.md) |
| Consultar cores, tipografia, componentes e visão do projeto | [Guia geral](GUIA-GERAL.md) |
| Conferir tokens, cores locais e referências no código | [Inventário visual](INVENTARIO-VISUAL.json) |
| Entender intenções e seus dados no catálogo | [Intenções WooCommerce](INTENCOES-WOOCOMMERCE.md) |
| Entender o estado atual e entregar ao backend | [Visão geral e handoff](VISAO-GERAL-E-HANDOFF.md) |
| Entender e rodar o projeto | [README](../README.md), [Configuração](CONFIGURACAO.md) |
| Entender produto e limites | [PRODUCT](../PRODUCT.md) |
| Criar ou ajustar interfaces | [DESIGN](../DESIGN.md), [Espaçamento](ESPACAMENTO.md) |
| Entender a implementação visual e o CSS | [CSS e direção visual](CSS-E-DIRECAO-VISUAL.md) |
| Encontrar componentes e dados | [Arquitetura](ARQUITETURA.md) |
| Entender URLs e APIs | [Rotas e APIs](ROTAS-E-APIS.md) |
| Trocar texto, imagem ou guia | [Conteúdo e assets](CONTEUDO-E-ASSETS.md) |
| Testar e entregar mudanças | [Manutenção](MANUTENCAO.md) |
| Homologar e publicar | [Publicação](PUBLICACAO.md) |
| Investigar checkout e gateway | [Pagamentos](PAGAMENTOS.md) |
| Investigar frete | [Frete](FRETE.md) |
| Investigar rede | [Conexão](CONEXAO-HOSPEDAGEM.md) |
| Conectar o cadastro de newsletter | [Newsletter](NEWSLETTER.md) |

## Fontes de autoridade

- `AGENTS.md`: instruções de trabalho e precauções do Next.js.
- `PRODUCT.md`: fatos confirmados e decisões abertas do produto.
- `DESIGN.md`: registro global extraído de estilos e componentes atuais.
- `app/globals.css`, `app/aprenda/aprenda.css` e componentes: implementação executada; divergências documentais exigem conferência desses arquivos.
- `lib/ethnicity-colors.ts` e `PRODUCT.md`: paleta canônica das etnias.
- `public/assets/**/README.md` e `public/files/**/README.md`: contratos locais de arquivos. Dimensão de referência não prova dimensão real.
- `.env.example`, `lib/config.ts`, `package.json` e configurações de testes: contratos operacionais. Não documentar valores de `.env.local`.

## Documentos e evidências anteriores

[Revisão de UX da compra](REVISAO-UX-COMPRA.md) registra uma avaliação anterior. O [design local de Aprenda](../app/aprenda/DESIGN.md) foi atualizado contra o CSS e os componentes atuais em 26/10/2026, incluindo cards estáticos e guias compactos.

O [sidecar Impeccable](../.impeccable/design.json) complementa DESIGN com motion, sombras, breakpoints e amostras visuais de componentes, sem APIs ou autenticação.

Em 06/10/2026 foram amostradas home, Aprenda e Primeiro Rapé em 1440 e 390px, com estilos computados e capturas em `artifacts/documentation/`, fora do Git. Nenhuma dessas seis amostras apresentou overflow horizontal. Essa conferência não substitui teste comercial, auditoria completa de acessibilidade ou homologação externa.

## Como manter

Execute `npm.cmd run docs:visual` para regenerar o inventário e
`npm.cmd run docs:visual:check` para detectar divergência. Os scripts atualizam o inventário e a documentação de paleta/tipografia; não alteram
o site nem inferem quais seletores estão visíveis no navegador.

Atualize o documento do assunto na mesma entrega de uma mudança de comportamento. Altere tokens no código e depois reflita em DESIGN e no sidecar. Altere nomes/dimensões de imagens junto com o contrato local. Registre evidência com data e ambiente; em serviços externos, informe o que foi consultado e o que permanece pendente. Evite transformar capturas antigas em regras globais.
