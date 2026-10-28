# Newsletter da home

Adicionada em 08/10/2026: última seção da home, abaixo de Conexão Ancestral e antes do footer, com fundo branco. Usa os tokens e a tipografia de DESIGN.md. Desktop concentra título, texto e formulário empilhados na coluna esquerda, deixando a metade direita livre de conteúdo para imagens. Até 900px, a coluna ocupa a largura disponível; até 600px, campo e botão também empilham.

Frontend: `components/home-newsletter-section.tsx`, montado em `app/page.tsx`; estilos locais em `app/globals.css`. Inclui validação nativa de e-mail, consentimento obrigatório, proteção contra envio duplo e estados de envio, erro, confirmação e confirmação pendente por e-mail.

O título destaca as palavras “saberes” e “ofertas” com `--forest-650` (`#3b6f52`), o mesmo verde de “relações de respeito” na seção institucional da home.

## Imagens de fundo

Fundo exclusivo do desktop em `public/assets/home/newsletter/background/`, conforme o [contrato de exportação](../public/assets/home/newsletter/background/README.md): `medicina-sagrada-newsletter-background-desktop.webp`, 1920 × 600 px, WebP sRGB com canal alpha, até 400 KB. Dimensões e peso são referências de produção. A preparação da imagem mobile foi removida a pedido de Danilo.

Acima de 900px, o CSS aplica a imagem desktop à seção inteira, centralizada e com `cover`; preserve a metade esquerda para leitura e formulário. Até 900px, a newsletter usa somente fundo branco, texto e formulário, sem imagem ou área reservada abaixo do conteúdo. Não é necessário alterar código ao substituir o arquivo desktop canônico.

## Integração Mailchimp

Mailchimp foi confirmado como destino em 23/10/2026. A implementação está em `lib/newsletter.ts` e `app/api/newsletter/route.ts`. Configure `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID` e, opcionalmente, `MAILCHIMP_SERVER_PREFIX` (por exemplo, `us21`; sem ele, usa o sufixo da chave). São segredos exclusivos do servidor. Após configurar ou trocar a audiência, refaça o deploy para atualizar a home estática. Sem configuração válida, a home oculta o formulário e a API retorna 503 para solicitações válidas.

O componente envia para `POST /api/newsletter/`. O servidor faz PUT no membro pelo hash MD5 do e-mail normalizado, com `status_if_new: pending`. Novos contatos precisam confirmar por e-mail. Não envia `status`, preservando inscrições, cancelamentos e estados existentes. Repetir uma solicitação não reinscreve um contato cancelado nem reenvia automaticamente a confirmação.

Entrada JSON:

```json
{ "email": "pessoa@exemplo.com", "consent": true, "website": "" }
```

Resposta HTTP 202 após aceite do serviço (sem divulgar se o endereço já estava na lista):

```json
{ "status": "pending" }
```

O campo `pending` representa o aceite da solicitação, sem confirmar a inscrição. A interface explica que novos cadastros recebem uma confirmação. Inscrições existentes não têm seu estado exposto. O honeypot recebe a mesma resposta sem chamar o serviço.

Uma resposta HTTP 2xx sem um desses status é tratada como indisponível. O frontend não usa uma mensagem personalizada de sucesso para não confundir cadastro confirmado com confirmação pendente.

Erros de entrada (400) ou excesso de tentativas (429) podem retornar `{ "error": "Mensagem pública em português." }`. Demais falhas, HTML em vez de JSON, ausência do endpoint e falhas de rede recebem mensagem local. Timeout: 15 segundos. Em falhas, o e-mail e o consentimento permanecem preenchidos; no sucesso, o formulário é limpo.

A API valida e-mail, consentimento, origem e JSON de até 8 KiB. Aplica limite de tentativas, ignora o honeypot, usa timeout de 10 segundos no Mailchimp, bloqueia redirects e devolve erros públicos sem diagnósticos do provedor. Não registra e-mails ou credenciais. A configuração de remetente, textos de confirmação, descadastro e eventuais campos obrigatórios da audiência deve ser homologada no Mailchimp antes da ativação. O teste automatizado usa respostas simuladas; nenhum contato real foi inscrito durante a implementação.

## Verificação

Conferir 1440, 768 e 390px; e-mail inválido e ausência de consentimento não devem enviar. Sem configuração, o formulário deve ficar oculto. Durante envio, desabilitar controles. Falha deve manter os dados preenchidos. Os unitários cobrem confirmação pendente, preservação de opt-out, validação e falhas; os E2E cobrem origem, consentimento e indisponibilidade sem configuração. Isso não substitui a homologação da audiência real.

Em 08/10/2026, o frontend local passou nas larguras 1440, 768, 390 e 320px, sem overflow horizontal, com fundo branco e ordem entre Conexão Ancestral e footer confirmados no DOM. Foram exercitados e-mail vazio/inválido, consentimento, indisponibilidade real da rota, envio duplo, rede indisponível e respostas simuladas `pending`, `subscribed` e HTTP 200 sem status válido. Foco por teclado e retenção/limpeza de dados passaram. `npm.cmd run check` passou lint, tipos e 89 testes. Essa evidência não confirma serviço ou lista externos.

