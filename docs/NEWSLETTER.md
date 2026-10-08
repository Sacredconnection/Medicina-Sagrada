# Newsletter da home

Adicionada em 08/10/2026: última seção da home, abaixo de Conexão Ancestral e antes do footer, com fundo branco. Usa os tokens e a tipografia de DESIGN.md. Desktop concentra título, texto e formulário empilhados na coluna esquerda, deixando a metade direita livre de conteúdo para imagens. Até 900px, a coluna ocupa a largura disponível; até 600px, campo e botão também empilham.

Frontend: `components/home-newsletter-section.tsx`, montado em `app/page.tsx`; estilos locais em `app/globals.css`. Inclui validação nativa de e-mail, consentimento obrigatório, proteção contra envio duplo e estados de envio, erro, confirmação e confirmação pendente por e-mail.

O título destaca as palavras “saberes” e “ofertas” com `--forest-650` (`#3b6f52`), o mesmo verde de “relações de respeito” na seção institucional da home.

## Imagens de fundo

Fundo exclusivo do desktop em `public/assets/home/newsletter/background/`, conforme o [contrato de exportação](../public/assets/home/newsletter/background/README.md): `medicina-sagrada-newsletter-background-desktop.webp`, 1920 × 600 px, WebP sRGB com canal alpha, até 400 KB. Dimensões e peso são referências de produção. A preparação da imagem mobile foi removida a pedido de Danilo.

Acima de 900px, o CSS aplica a imagem desktop à seção inteira, centralizada e com `cover`; preserve a metade esquerda para leitura e formulário. Até 900px, a newsletter usa somente fundo branco, texto e formulário, sem imagem ou área reservada abaixo do conteúdo. Não é necessário alterar código ao substituir o arquivo desktop canônico.

## Integração a cargo do parceiro

Danilo informou que a integração pertence ao parceiro e que provavelmente usa Mailchimp com WordPress. O serviço ainda não foi confirmado. Esta entrega não cria endpoint, não armazena inscritos nem configura envios. Sem a integração, o formulário informa indisponibilidade e preserva os dados preenchidos. Nunca mostra sucesso apenas por clicar no botão.

O componente espera um adaptador no servidor em `POST /api/newsletter/`. A prop `endpoint` permite trocar a rota se necessário. URL padrão segue a barra final do projeto.

Entrada JSON:

```json
{ "email": "pessoa@exemplo.com", "consent": true, "website": "" }
```

Resposta de sucesso, somente após confirmação do serviço:

```json
{ "status": "subscribed" }
```

Se houver confirmação por e-mail ainda pendente:

```json
{ "status": "pending" }
```

Uma resposta HTTP 2xx sem um desses status é tratada como indisponível. O frontend não usa uma mensagem personalizada de sucesso para não confundir cadastro confirmado com confirmação pendente.

Erros de entrada (400) ou excesso de tentativas (429) podem retornar `{ "error": "Mensagem pública em português." }`. Demais falhas, HTML em vez de JSON, ausência do endpoint e falhas de rede recebem mensagem local. Timeout: 15 segundos. Em falhas, o e-mail e o consentimento permanecem preenchidos; no sucesso, o formulário é limpo.

O adaptador deve validar e-mail e consentimento no servidor, rejeitar o honeypot `website` preenchido, limitar tentativas, respeitar a origem e o limite de JSON usados pelas outras APIs, manter credenciais somente no servidor e retornar respostas sem cache. A lista real deve oferecer descadastro e respeitar a confirmação por e-mail quando configurada. Não registrar e-mails ou credenciais em logs. Implementação e homologação externa são escopo do parceiro.

## Verificação

Conferir 1440, 768 e 390px; e-mail inválido e ausência de consentimento não devem enviar. Com endpoint ausente, exibir indisponibilidade e manter os dados. Durante envio, desabilitar controles. Validar os dois status com respostas simuladas localmente; isso confirma o frontend, não a integração real.

Em 08/10/2026, o frontend local passou nas larguras 1440, 768, 390 e 320px, sem overflow horizontal, com fundo branco e ordem entre Conexão Ancestral e footer confirmados no DOM. Foram exercitados e-mail vazio/inválido, consentimento, indisponibilidade real da rota, envio duplo, rede indisponível e respostas simuladas `pending`, `subscribed` e HTTP 200 sem status válido. Foco por teclado e retenção/limpeza de dados passaram. `npm.cmd run check` passou lint, tipos e 89 testes. Essa evidência não confirma serviço ou lista externos.

