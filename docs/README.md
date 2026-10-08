# Documentação do projeto

Revisão: **06/10/2026**. Esta documentação descreve a implementação local. Consultas reais registradas anteriormente são históricas, não certificação da situação atual da loja.

## Por onde começar

| Necessidade | Leitura |
| --- | --- |
| Entender e rodar o projeto | [README](../README.md), [Configuração](CONFIGURACAO.md) |
| Entender produto e limites | [PRODUCT](../PRODUCT.md) |
| Criar ou ajustar interfaces | [DESIGN](../DESIGN.md), [Espaçamento](ESPACAMENTO.md) |
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

[Revisão de UX da compra](REVISAO-UX-COMPRA.md) registra uma avaliação anterior. [Design local de Aprenda](../app/aprenda/DESIGN.md) permanece preservado e tem divergências com o código atual: descreve expansores, faixas laterais e passos que já mudaram. Consulte [Conteúdo e assets](CONTEUDO-E-ASSETS.md) para o comportamento atual. Esses trechos antigos não são ordem de reconstrução.

O [sidecar Impeccable](../.impeccable/design.json) complementa DESIGN com motion, sombras, breakpoints e amostras visuais de componentes, sem APIs ou autenticação.

Em 06/10/2026 foram amostradas home, Aprenda e Primeiro Rapé em 1440 e 390px, com estilos computados e capturas em `artifacts/documentation/`, fora do Git. Nenhuma dessas seis amostras apresentou overflow horizontal. Essa conferência não substitui teste comercial, auditoria completa de acessibilidade ou homologação externa.

## Como manter

Atualize o documento do assunto na mesma entrega de uma mudança de comportamento. Altere tokens no código e depois reflita em DESIGN e no sidecar. Altere nomes/dimensões de imagens junto com o contrato local. Registre evidência com data e ambiente; em serviços externos, informe o que foi consultado e o que permanece pendente. Evite transformar capturas antigas em regras globais.
