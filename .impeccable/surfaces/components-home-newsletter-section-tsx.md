---
version: 1
slug: "components-home-newsletter-section-tsx"
primary_target: "components/home-newsletter-section.tsx"
related_targets: ["app/page.tsx"]
---

# Home: newsletter

Escopo: seção Persuade ao final da home, abaixo de Conexão Ancestral e antes do footer.
O visitante deixa seu e-mail para receber histórias, conhecimentos, promoções e avisos.
Integração Mailchimp/WordPress pertence ao parceiro de Danilo; serviço não confirmado.

## Direction contract

THESIS: convite claro à newsletter, sem prometer percentuais de desconto.

OWN-WORLD: fundo branco sob arte transparente responsiva, Proxima Nova, títulos verdes e controles existentes.

STORY: entenda o conteúdo, informe o e-mail e autorize o recebimento.

FIRST VIEWPORT: título e explicação à esquerda; campo, botão e consentimento à direita. Mobile empilha a composição e amplia a ação.

FORM: extensão direta da home existente; seleção de conceito dispensada para esta adição local. Interação principal: cadastro com validação e estados de envio, erro e confirmação real. Movimento restrito aos estados do botão, respeitando movimento reduzido.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Fechamento em 08/10/2026

Revisão independente: **ship**, no escopo da nova seção. Documentação conferida por agente independente em docs/NEWSLETTER.md e indexada em docs/README.md. DESIGN.md e o sidecar existentes permanecem a autoridade; não houve mudança global de sistema nem criação de imagens de produção.

Lint, tipos e 89 testes passaram. Conferência local de layout em 1440, 768, 390 e 320px, com fluxo e estados do formulário exercitados. Capturas finais válidas em output/playwright/newsletter/desktop.png, tablet.png e mobile.png. Sucessos simulados verificam somente o frontend. Integração Mailchimp/WordPress continua a cargo do parceiro de Danilo, conforme escopo confirmado.

## Preparação dos fundos em 08/10/2026

Pedido posterior de Danilo: arte transparente sobre toda a seção, com versões desktop e mobile. Caminhos e dimensões de exportação documentados em public/assets/home/newsletter/background/README.md. O CSS alterna em 900px, usa cover/center e mantém branco sob o canal alpha. As imagens finais aguardam fornecimento; a conferência da arte e de seu recorte ocorre quando elas chegarem.

Slots conferidos no navegador em 1440, 901, 900, 768, 390 e 320px: caminhos corretos, branco de segurança e recorte cover centralizado. Capturas desktop/mobile sem arquivos mantiveram o layout e não apresentaram overflow. Requisições dos dois fundos testadas com respostas transparentes simuladas, removidas ao final; nenhuma arte provisória foi salva em public. Capturas em output/playwright/newsletter/background-prepared-desktop.png e background-prepared-mobile.png.
