---
version: 1
slug: "components-home-newsletter-section-tsx"
primary_target: "components/home-newsletter-section.tsx"
related_targets: ["app/page.tsx"]
---

# Home: newsletter

Estado documental vigente: **27/10/2026**. Modo: Persuade.
Última seção da home, abaixo de Conexão Ancestral e antes do footer.
O visitante deixa seu e-mail para receber histórias, conhecimentos, promoções e avisos.

## Direction contract

THESIS: convite claro à newsletter, sem prometer percentuais de desconto.

OWN-WORLD: fundo branco, com arte transparente somente acima de 900px; mobile sem imagem ou espaço reservado. Proxima Nova, títulos verdes e controles existentes.

STORY: entenda o conteúdo, informe o e-mail e autorize o recebimento.

FIRST VIEWPORT: título, explicação e formulário empilhados na coluna esquerda; metade direita livre para arte. Até 900px, a coluna ocupa a largura disponível. Até 600px, campo e botão empilham.

FORM: extensão da home existente. E-mail, consentimento obrigatório, validação e estados de envio, erro e confirmação conforme resposta do serviço. Preservar movimento reduzido nas regras existentes.

## Visual e assets atuais

- Fundo desktop sobre toda a seção, com `cover/center` sobre branco.
- Apenas o arquivo desktop tem contrato ativo em [fundos da newsletter](../../public/assets/home/newsletter/background/README.md). Não preparar fundo mobile.
- Destaques “saberes” e “ofertas” usam `--forest-650`; corpo e controles usam Proxima Nova e os tokens globais.
- O contrato de exportação especifica a produção da imagem; não comprova disponibilidade do arquivo ou recorte final.

## Integração e verificação

O endpoint esperado é `POST /api/newsletter/`, sem handler local implementado.
A integração Mailchimp/WordPress pertence ao parceiro de Danilo; o serviço
não está confirmado. Sucesso depende de resposta válida do serviço.

Referência funcional e evidências anteriores com suas datas originais:
[Newsletter](../../docs/NEWSLETTER.md). Esta atualização foi documental,
conferida contra o componente e o CSS; não representa nova homologação visual
ou da integração externa.
